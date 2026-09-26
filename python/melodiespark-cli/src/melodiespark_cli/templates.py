"""Template loading and scaffolding.

The Python twin of ``apps/melodie-cli/src/template.ts`` and ``init.ts``. It
reads the same ``template.json`` manifests and the same template directories as
the TypeScript CLI, so ``melodie init`` and ``melodiespark-cli init`` produce
the same tree from the same inputs.

The Web3 consent gate is implemented identically: files listed in
``consent_gated_files`` are withheld unless the operator passes the explicit
consent flag.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .contract import CatalogError

TEMPLATE_SUFFIX = ".tmpl"
SIGNING_CONSENT_FLAG = "i-understand-this-signs-transactions"

_TOKEN = re.compile(r"\{\{([A-Z_]+)\}\}")


@dataclass
class Template:
    """A parsed ``template.json`` manifest."""

    name: str
    version: str
    description: str
    kind: str
    targets: list[str]
    install: dict[str, str]
    run: dict[str, str]
    variables: dict[str, str] = field(default_factory=dict)
    consent_gated_files: list[str] = field(default_factory=list)
    web3: dict[str, Any] | None = None
    files: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)
    root: Path | None = None

    @classmethod
    def load(cls, directory: Path) -> "Template":
        manifest_path = directory / "template.json"
        if not manifest_path.is_file():
            raise CatalogError(
                f"Template not found: {directory}\n"
                f"Expected a manifest at {manifest_path}"
            )
        try:
            raw = json.loads(manifest_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise CatalogError(f"Template manifest at {manifest_path} is not valid JSON: {exc}") from exc
        template = cls(
            name=raw.get("name", directory.name),
            version=raw.get("version", "0.0.0"),
            description=raw.get("description", ""),
            kind=raw.get("kind", ""),
            targets=list(raw.get("targets", [])),
            install=dict(raw.get("install", {})),
            run=dict(raw.get("run", {})),
            variables=dict(raw.get("variables", {})),
            consent_gated_files=list(raw.get("consent_gated_files", [])),
            web3=raw.get("web3"),
            files=list(raw.get("files", [])),
            notes=list(raw.get("notes", [])),
            root=directory,
        )
        emitted = [
            p
            for p in directory.rglob("*")
            if p.is_file() and p.name != "template.json" and "__pycache__" not in p.parts
        ]
        if not emitted:
            raise CatalogError(f"Template {template.name} contains no files to emit.")
        return template

    def web3_flag(self) -> str:
        if self.web3 and self.web3.get("consent_flag"):
            return str(self.web3["consent_flag"]).lstrip("-")
        return SIGNING_CONSENT_FLAG


def list_templates(templates_dir: Path) -> list[Template]:
    """Every template with a valid manifest, sorted by name."""
    if not templates_dir.is_dir():
        return []
    found: list[Template] = []
    for entry in sorted(templates_dir.iterdir()):
        if entry.is_dir() and (entry / "template.json").is_file():
            found.append(Template.load(entry))
    return sorted(found, key=lambda t: t.name)


def _json_escape(value: str) -> str:
    return json.dumps(value)[1:-1]


def render(text: str, variables: dict[str, str], is_json: bool) -> str:
    """Substitute ``{{TOKEN}}`` placeholders."""

    def replace(match: re.Match[str]) -> str:
        key = match.group(1)
        if key not in variables:
            return match.group(0)
        value = variables[key]
        return _json_escape(value) if is_json else value

    return _TOKEN.sub(replace, text)


def build_variables(template: Template, target_dir: Path, overrides: dict[str, str]) -> dict[str, str]:
    """Build the substitution map, template defaults winning over CLI overrides."""
    from datetime import datetime, timezone

    slug = re.sub(r"[^A-Za-z0-9_]", "_", target_dir.name).lower()
    base: dict[str, str] = {
        "TEMPLATE": template.name,
        "TEMPLATE_VERSION": template.version,
        "TEMPLATE_KIND": template.kind,
        "PACKAGE_NAME": target_dir.name,
        "PACKAGE_VERSION": "0.1.0",
        "DESCRIPTION": template.description,
        "AUTHOR": "Melodiespark",
        "LICENSE": "UNLICENSED",
        "YEAR": str(datetime.now(timezone.utc).year),
        "GENERATED_AT": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "CLI_BIN": "melodie-app",
        "PY_MODULE": slug,
        "CONSENT_FLAG": SIGNING_CONSENT_FLAG,
    }
    merged = {**base, **template.variables, **overrides}
    return merged
