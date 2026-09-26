/**
 * Rule-driven classification engine.
 *
 * Rules are loaded from the shared JSON contract. No extraction policy is
 * hard-coded here: the JSON is the single source of truth so that the
 * TypeScript and Python frontends cannot drift apart.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Category, Rule, RuleMatch, RulesFile } from './contracts.ts';

export class ClassificationError extends Error {}

export function loadRules(rulesPath: string): RulesFile {
  if (!fs.existsSync(rulesPath)) {
    throw new ClassificationError(
      `Classification rules not found at ${rulesPath}. Run \`melodie catalog --build\` from the monorepo, or reinstall the package.`
    );
  }
  const raw = fs.readFileSync(rulesPath, 'utf-8');
  let parsed: RulesFile;
  try {
    parsed = JSON.parse(raw) as RulesFile;
  } catch (error) {
    throw new ClassificationError(`Classification rules at ${rulesPath} are not valid JSON: ${(error as Error).message}`);
  }
  if (!Array.isArray(parsed.rules) || parsed.rules.length === 0) {
    throw new ClassificationError(`Classification rules at ${rulesPath} declare no rules.`);
  }
  // Sort once, lowest priority number wins.
  parsed.rules = [...parsed.rules].sort((a, b) => a.priority - b.priority);
  return parsed;
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/').replace(/\\/g, '/');
}

function extensionOf(posixPath: string): string {
  const base = posixPath.slice(posixPath.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  return base.slice(dot).toLowerCase();
}

function basenameOf(posixPath: string): string {
  return posixPath.slice(posixPath.lastIndexOf('/') + 1);
}

/**
 * Compile a rule pattern.
 *
 * Rules are authored with `(?i)` prefixes for readability. JavaScript has no
 * inline inline-mode flags, so they are hoisted into the RegExp flags here
 * rather than being spread across every call site.
 */
const regexCache = new Map<string, RegExp>();

function safeRegex(pattern: string): RegExp {
  const cached = regexCache.get(pattern);
  if (cached) return cached;
  let body = pattern;
  let flags = '';
  if (body.startsWith('(?i)')) {
    flags += 'i';
    body = body.slice(4);
  }
  const compiled = new RegExp(body, flags);
  regexCache.set(pattern, compiled);
  return compiled;
}

function matchRule(match: RuleMatch, posixPath: string, extension: string, basename: string): boolean {
  switch (match.kind) {
    case 'relative_path_equals':
      return (match.values ?? []).includes(posixPath);
    case 'relative_path_matches':
      return !!match.pattern && safeRegex(match.pattern).test(posixPath);
    case 'basename_matches_any':
      return (match.patterns ?? []).some((p) => safeRegex(p).test(basename));
    case 'path_matches_any':
      return (match.patterns ?? []).some((p) => safeRegex(p).test(posixPath));
    case 'extension_in':
      return extension !== '' && (match.values ?? []).includes(extension);
    case 'basename_matches_any_or_extension_in': {
      const byName = (match.patterns ?? []).some((p) => safeRegex(p).test(basename));
      const byExt = extension !== '' && (match.values ?? []).includes(extension);
      return byName || byExt;
    }
    default:
      throw new ClassificationError(`Unsupported match kind: ${(match as RuleMatch).kind}`);
  }
}

export interface Classification {
  category: Category;
  rule_id: string;
  reason: string;
  flags: string[];
  sensitive: boolean;
  generated: boolean;
  binary: boolean;
  archive: boolean;
  vcs_metadata: boolean;
  /** True when no flag can ever unlock this entry (SECRET). */
  permanently_denied: boolean;
  extractable: boolean;
  authorization_required: boolean;
}

export class Classifier {
  private readonly rules: RulesFile;
  private readonly deniedPaths: Set<string>;
  private readonly deniedBasenames: RegExp[];
  private readonly absoluteDenied: Set<Category>;
  private readonly authRequired: Set<Category>;

  constructor(rules: RulesFile) {
    this.rules = rules;
    const policy = rules.extraction_policy;
    this.deniedPaths = new Set(policy.absolutely_denied_paths.map(toPosix));
    this.deniedBasenames = (policy.absolutely_denied_basename_patterns ?? []).map(safeRegex);
    this.absoluteDenied = new Set(policy.absolutely_denied_categories);
    this.authRequired = new Set(policy.authorization_required_categories);
  }

  classify(absPath: string, sourceRoot: string): Classification {
    const posixPath = toPosix(path.relative(sourceRoot, absPath));
    const extension = extensionOf(posixPath);
    const basename = basenameOf(posixPath);

    let matched: Rule | null = null;
    for (const rule of this.rules.rules) {
      if (matchRule(rule.match, posixPath, extension, basename)) {
        matched = rule;
        break;
      }
    }

    const rule = matched ?? {
      id: this.rules.fallback.id,
      category: this.rules.fallback.category,
      flags: this.rules.fallback.flags,
      reason: this.rules.fallback.reason,
    };

    const flags = [...(rule.flags ?? [])];
    const isHardDeniedPath = this.deniedPaths.has(posixPath);
    const isHardDeniedName = this.deniedBasenames.some((re) => re.test(basename));
    const isAbsoluteCategory = this.absoluteDenied.has(rule.category);

    // A hard-denied path or basename is a SECRET regardless of which broader
    // rule matched first, so that an unrecognised copy of a known secret in a
    // new directory cannot be classified as copyable CONFIG or DATA.
    const hardDenied = isHardDeniedPath || isHardDeniedName;
    const category: Category = hardDenied ? 'SECRET' : rule.category;

    if (hardDenied) flags.push('sensitive', 'excluded', 'hard_deny_pattern');
    if (isHardDeniedPath) flags.push('audit_confirmed');

    // SECRET is permanently denied: no flag can unlock it. Reporting it as
    // merely "authorization required" would misrepresent the policy.
    const permanentlyDenied = isAbsoluteCategory || hardDenied;
    if (permanentlyDenied) flags.push('permanently_denied');

    const sensitive = flags.includes('sensitive');
    const extractable =
      !permanentlyDenied &&
      (this.rules.extraction_policy.copyable_categories as string[]).includes(category);

    const authorizationRequired =
      !extractable && !permanentlyDenied && (this.authRequired.has(category) || sensitive);

    let reason = rule.reason;
    if (isHardDeniedName) {
      reason = `Filename matches an absolutely-denied pattern; treated as SECRET regardless of the rule that matched (${rule.id}).`;
    } else if (isHardDeniedPath) {
      reason = 'Listed in extraction_policy.absolutely_denied_paths.';
    }

    return {
      category,
      rule_id: hardDenied && !isHardDeniedPath ? 'R000_HARD_DENY_PATTERN' : rule.id,
      reason,
      flags: [...new Set(flags)],
      sensitive,
      generated: flags.includes('generated'),
      binary: flags.includes('binary'),
      archive: flags.includes('archive'),
      vcs_metadata: flags.includes('provenance_only'),
      permanently_denied: permanentlyDenied,
      extractable,
      authorization_required: authorizationRequired,
    };
  }

  getRules(): RulesFile {
    return this.rules;
  }
}
