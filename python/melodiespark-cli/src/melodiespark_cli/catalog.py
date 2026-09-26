"""Catalog access for the Python CLI.

Thin, read-only helpers over the shared ``content-catalog.json``. The Python
CLI does not build catalogs; the TypeScript CLI owns catalog construction. Its
job is to answer the same questions from the same file so that both frontends
report identical state.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .contract import CatalogError


@dataclass(frozen=True)
class FileEntry:
    """One catalogued file."""

    path: str
    bytes: int
    sha256: str
    extension: str
    repository: str
    module: str | None
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
    modified_utc: str | None

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "FileEntry":
        return cls(
            path=raw["path"],
            bytes=raw.get("bytes", 0),
            sha256=raw.get("sha256", ""),
            extension=raw.get("extension", ""),
            repository=raw.get("repository", ""),
            module=raw.get("module"),
            category=raw.get("category", "OTHER"),
            rule_id=raw.get("rule_id", ""),
            reason=raw.get("reason", ""),
            flags=list(raw.get("flags", [])),
            sensitive=bool(raw.get("sensitive", False)),
            generated=bool(raw.get("generated", False)),
            binary=bool(raw.get("binary", False)),
            archive=bool(raw.get("archive", False)),
            vcs_metadata=bool(raw.get("vcs_metadata", False)),
            permanently_denied=bool(raw.get("permanently_denied", raw.get("category") == "SECRET")),
            extractable=bool(raw.get("extractable", False)),
            authorization_required=bool(raw.get("authorization_required", False)),
            modified_utc=raw.get("modified_utc"),
        )


class Catalog:
    """A loaded content catalog."""

    def __init__(self, raw: dict[str, Any], path: Path) -> None:
        self.raw = raw
        self.path = path
        self.files: list[FileEntry] = [FileEntry.from_dict(f) for f in raw.get("files", [])]
        self.summary: dict[str, Any] = raw.get("summary", {})
        self.repositories: list[dict[str, Any]] = raw.get("repositories", [])
        self.contract_version: str = raw.get("contract_version", "unknown")
        self.generated_at: str = raw.get("generated_at", "")
        self.source_root: str = raw.get("source_root", "")
        self.source_root_exists: bool = bool(raw.get("source_root_exists", False))
        self._by_path = {f.path: f for f in self.files}

    def __len__(self) -> int:
        return len(self.files)

    def get(self, path: str) -> FileEntry | None:
        return self._by_path.get(path)

    def by_category(self, category: str) -> list[FileEntry]:
        upper = category.upper()
        return [f for f in self.files if f.category == upper]

    def by_repository(self, repository: str) -> list[FileEntry]:
        target = repository.lower()
        return [f for f in self.files if f.repository.lower() == target]

    def search(self, query: str) -> list[FileEntry]:
        """Case-insensitive exact, suffix, then substring match."""
        q = query.lower()
        return [f for f in self.files if q in f.path.lower()]


def load_catalog(path: Path) -> Catalog:
    """Load and validate a catalog file."""
    if not path.is_file():
        raise CatalogError(
            f"Catalog not found at {path}.\n"
            "Build it with:  melodie catalog --build\n"
            "Or point at one with --catalog <file> or MELODIESPARK_CATALOG."
        )
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise CatalogError(f"Catalog at {path} is not valid JSON: {exc}") from exc
    if not isinstance(raw.get("files"), list) or "summary" not in raw:
        raise CatalogError(f"Catalog at {path} does not match the expected contract.")
    return Catalog(raw, path)
