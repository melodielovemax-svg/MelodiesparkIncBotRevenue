/** Minimal argv parser. Supports --flag, --key value, --key=value, and positionals. */

export interface ParsedArgs {
  positionals: string[];
  flags: Set<string>;
  options: Map<string, string>;
  raw: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags = new Set<string>();
  const options = new Map<string, string>();
  const raw = [...argv];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--') {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const body = token.slice(2);
    if (body === '') {
      continue;
    }
    const eq = body.indexOf('=');
    if (eq !== -1) {
      options.set(body.slice(0, eq), body.slice(eq + 1));
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      options.set(body, next);
      i += 1;
    } else {
      flags.add(body);
    }
  }

  return { positionals, flags, options, raw };
}

export function opt(args: ParsedArgs, name: string): string | undefined {
  return args.options.get(name);
}

export function flag(args: ParsedArgs, name: string): boolean {
  return args.flags.has(name);
}

export function requireOpt(args: ParsedArgs, name: string): string {
  const value = args.options.get(name);
  if (value === undefined) {
    throw new Error(`Missing required option --${name}`);
  }
  return value;
}

/**
 * Drop the leading command name from the positional list.
 *
 * Dispatch passes raw argv, so `positionals[0]` is the command verb. Handlers
 * must not see it, or `melodie init ./app` would treat "init" as the target
 * directory and `melodie inspect foo` would search for the literal word
 * "inspect".
 */
export function shiftCommand(args: ParsedArgs): ParsedArgs {
  return { ...args, positionals: args.positionals.slice(1) };
}
