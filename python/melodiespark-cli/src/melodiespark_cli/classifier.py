"""Rule-driven classification.

The Python twin of ``apps/melodie-cli/src/classifier.ts``. Both read the same
rules JSON and apply the same precedence:

1. hard-deny by path or basename pattern -> SECRET, permanently denied
2. otherwise the first matching rule by ascending priority wins
3. the fallback rule applies when nothing matches

Order matters: step 1 is evaluated independently of the matched rule so that an
unrecognised copy of a known secret can never be classified as copyable
CONFIG or DATA.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from .contract import Rule, Rules


@dataclass(frozen=True)
class Classification:
    """The verdict for one path."""

    category: str
    rule_id: str
    reason: str
    flags: list[str]
    sensitive: bool
    generated: bool
    binary: bool
    archive: bool
    vcs_metadata: bool
    permanently_denied: bool
    extractable: bool
    authorization_required: bool


def _to_posix(value: str) -> str:
    return value.replace("\\", "/")


def _basename(posix_path: str) -> str:
    return posix_path.rsplit("/", 1)[-1]


def _extension(posix_path: str) -> str:
    base = _basename(posix_path)
    dot = base.rfind(".")
    if dot <= 0:
        return ""
    return base[dot:].lower()


def _matches(rule: Rule, posix_path: str, extension: str, basename: str) -> bool:
    match = rule.match
    kind = match.get("kind")

    if kind == "relative_path_equals":
        return posix_path in set(match.get("values", []))

    if kind == "relative_path_matches":
        pattern = match.get("pattern")
        return bool(pattern) and re.search(pattern, posix_path) is not None

    if kind == "basename_matches_any":
        return any(re.search(p, basename) for p in match.get("patterns", []))

    if kind == "path_matches_any":
        return any(re.search(p, posix_path) for p in match.get("patterns", []))

    if kind == "extension_in":
        return bool(extension) and extension in set(match.get("values", []))

    if kind == "basename_matches_any_or_extension_in":
        by_name = any(re.search(p, basename) for p in match.get("patterns", []))
        by_ext = bool(extension) and extension in set(match.get("values", []))
        return by_name or by_ext

    raise ValueError(f"Unsupported match kind: {kind}")


class Classifier:
    """Applies the shared rules contract to absolute paths."""

    def __init__(self, rules: Rules) -> None:
        self.rules = rules

    def classify(self, abs_path: Path, source_root: Path) -> Classification:
        """Classify ``abs_path`` relative to ``source_root``."""
        posix_path = _to_posix(str(Path(abs_path).relative_to(source_root)))
        extension = _extension(posix_path)
        basename = _basename(posix_path)

        matched: Rule | None = None
        for rule in self.rules.rules:
            if _matches(rule, posix_path, extension, basename):
                matched = rule
                break

        if matched is None:
            fallback = self.rules.fallback
            rule_id = str(fallback.get("id", "R999_FALLBACK"))
            category = str(fallback.get("category", "OTHER"))
            flags = list(fallback.get("flags", []))
            reason = str(fallback.get("reason", "No rule matched."))
        else:
            rule_id = matched.id
            category = matched.category
            flags = list(matched.flags)
            reason = matched.reason

        denied_paths = self.rules.absolutely_denied_paths
        denied_names = self.rules.absolutely_denied_basename_patterns
        denied_categories = self.rules.absolutely_denied_categories

        hard_denied_path = posix_path in denied_paths
        hard_denied_name = any(p.search(basename) for p in denied_names)
        hard_denied = hard_denied_path or hard_denied_name

        if hard_denied:
            category = "SECRET"
            flags += ["sensitive", "excluded", "hard_deny_pattern"]
        if hard_denied_path:
            flags.append("audit_confirmed")

        permanently_denied = hard_denied or category in denied_categories
        if permanently_denied:
            flags.append("permanently_denied")

        # Stable order, no duplicates.
        flags = list(dict.fromkeys(flags))
        sensitive = "sensitive" in flags
        extractable = not permanently_denied and category in self.rules.copyable_categories
        authorization_required = (
            not extractable
            and not permanently_denied
            and (category in self.rules.authorization_required_categories or sensitive)
        )

        if hard_denied_name:
            reason = (
                "Filename matches an absolutely-denied pattern; treated as SECRET "
                f"regardless of the rule that matched ({rule_id})."
            )
        elif hard_denied_path:
            reason = "Listed in extraction_policy.absolutely_denied_paths."

        return Classification(
            category=category,
            rule_id="R000_HARD_DENY_PATTERN" if (hard_denied and not hard_denied_path) else rule_id,
            reason=reason,
            flags=flags,
            sensitive=sensitive,
            generated="generated" in flags,
            binary="binary" in flags,
            archive="archive" in flags,
            vcs_metadata="provenance_only" in flags,
            permanently_denied=permanently_denied,
            extractable=extractable,
            authorization_required=authorization_required,
        )
