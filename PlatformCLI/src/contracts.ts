/**
 * Shared contracts for the Melodiespark content catalog.
 *
 * These types mirror `packages/content-catalog/catalog.schema.json`.
 * The Python CLI in `python/melodiespark-cli` implements the same shapes.
 */

// ---------------------------------------------------------------------------
// Rules contract (packages/content-catalog/rules/classification-rules.json)
// ---------------------------------------------------------------------------

export type Category =
  | 'SECRET'
  | 'SENSITIVE'
  | 'VCS'
  | 'ARCHIVE'
  | 'BINARY'
  | 'GENERATED'
  | 'SOURCE'
  | 'TEST'
  | 'DOCUMENTATION'
  | 'CONFIG'
  | 'DATA'
  | 'ASSET'
  | 'OTHER';

export type MatchKind =
  | 'relative_path_equals'
  | 'relative_path_matches'
  | 'basename_matches_any'
  | 'path_matches_any'
  | 'extension_in'
  | 'basename_matches_any_or_extension_in';

export interface RuleMatch {
  kind: MatchKind;
  pattern?: string;
  patterns?: string[];
  values?: string[];
}

export interface Rule {
  id: string;
  priority: number;
  category: Category;
  flags: string[];
  match: RuleMatch;
  reason: string;
}

export interface ExtractionPolicy {
  default: 'DENY' | 'ALLOW';
  copy_requires_flag: boolean;
  flag: string;
  absolutely_denied_categories: Category[];
  absolutely_denied_paths: string[];
  absolutely_denied_basename_patterns: string[];
  absolutely_denied_policy_note: string;
  content_sensitive_patterns: {
    note: string;
    max_scan_bytes: number;
    patterns: Array<{ id: string; pattern: string; severity: string }>;
  };
  copyable_categories: Category[];
  authorization_required_categories: Category[];
}

export interface RulesFile {
  contract_version: string;
  description: string;
  principle: string;
  policy: {
    catalog_all_files: boolean;
    copy_by_default: boolean;
    redistribute_vcs_metadata: boolean;
    secrets_never_packaged: boolean;
  };
  categories: Record<Category, string>;
  extraction_policy: ExtractionPolicy;
  rules: Rule[];
  fallback: { id: string; category: Category; flags: string[]; reason: string };
  repositories: { source: string; fields: string[] };
}

// ---------------------------------------------------------------------------
// Catalog contract (packages/content-catalog/catalog.schema.json)
// ---------------------------------------------------------------------------

export interface CatalogFileEntry {
  path: string;
  bytes: number;
  sha256: string;
  extension: string;
  repository: string;
  module: string | null;
  category: Category;
  rule_id: string;
  reason: string;
  flags: string[];
  sensitive: boolean;
  generated: boolean;
  binary: boolean;
  archive: boolean;
  vcs_metadata: boolean;
  /** True when no flag can unlock this entry (SECRET category). */
  permanently_denied: boolean;
  extractable: boolean;
  authorization_required: boolean;
  modified_utc: string | null;
}

export interface CatalogTally {
  count: number;
  bytes: number;
}

export interface CatalogRepository {
  name: string;
  remote: string | null;
  branch: string | null;
  commit: string | null;
  commit_date: string | null;
  declared_file_count: number | null;
  catalogued_count: number;
  bytes: number;
}

export interface CatalogSummary {
  file_count: number;
  total_bytes: number;
  excluded_count: number;
  secret_count: number;
  sensitive_bytes: number;
  by_category: Record<string, CatalogTally>;
  by_repository: Record<string, CatalogTally>;
}

export interface CatalogGenerator {
  name: string;
  version: string;
  node: string;
  platform: string;
  elapsed_ms: number;
}

export interface ContentCatalog {
  contract_version: string;
  generated_at: string;
  generator: CatalogGenerator;
  source_root: string;
  source_root_exists: boolean;
  summary: CatalogSummary;
  repositories: CatalogRepository[];
  files: CatalogFileEntry[];
}

// ---------------------------------------------------------------------------
// Status contract (TRUTH_PROTOCOL.md aligned)
// ---------------------------------------------------------------------------

export type TruthStatus =
  | 'OPERATIONAL'
  | 'SCAFFOLD'
  | 'PLANNED'
  | 'PAPER-ONLY'
  | 'BLOCKED'
  | 'UNVERIFIED';

export interface CapabilityStatus {
  capability: string;
  layer: 'ENGINEERING' | 'TECHNICAL' | 'BUSINESS' | 'SECURITY';
  status: TruthStatus;
  evidence: string;
}
