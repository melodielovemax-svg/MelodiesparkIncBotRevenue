"""Content-level secret guard.

The Python twin of ``apps/melodie-cli/src/content-guard.ts``.

A credential is often committed inside an ordinary ``.md``, ``.ts``, or ``.py``
file, where path-based classification sees nothing suspicious. Before content is
copied, it is scanned against the high-signal patterns declared in the shared
rules contract. A match downgrades the entry to denied-by-default.

A match is not a permanent deny: documentation legitimately shows example
keys, and an operator may authorize copying after review. It is never copied
silently, and it is always recorded in the audit log with its pattern id.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from .contract import Rules

_CACHE: dict[str, re.Pattern[str]] = {}


@dataclass(frozen=True)
class ContentFinding:
    """One content signal that fired."""

    id: str
    severity: str
    line: int

    def render(self) -> str:
        return f"{self.id}({self.severity})@L{self.line}"


def _compile(pattern: str) -> re.Pattern[str]:
    cached = _CACHE.get(pattern)
    if cached is not None:
        return cached
    body = pattern
    flags = 0
    if body.startswith("(?i)"):
        flags |= re.IGNORECASE
        body = body[4:]
    compiled = re.compile(body.encode("utf-8"))
    _CACHE[pattern] = compiled
    return compiled


def scan_content(abs_path: Path, rules: Rules) -> list[ContentFinding]:
    """Return every content signal found in ``abs_path``."""
    signals = rules.content_signals
    if not signals:
        return []

    try:
        if abs_path.stat().st_size > rules.content_scan_max_bytes:
            return []
        data = abs_path.read_bytes()
    except OSError:
        return []

    # A NUL byte in the first block means this is not really text.
    if b"\x00" in data[:8192]:
        return []

    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return []

    findings: list[ContentFinding] = []
    for signal in signals:
        regex = _compile(signal["pattern"])
        for index, line in enumerate(text.split("\n"), start=1):
            if regex.search(line.encode("utf-8")):
                findings.append(
                    ContentFinding(
                        id=signal["id"],
                        severity=signal.get("severity", "UNKNOWN"),
                        line=index,
                    )
                )
                break
    return findings
