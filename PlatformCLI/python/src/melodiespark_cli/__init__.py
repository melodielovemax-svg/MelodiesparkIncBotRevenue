"""Melodiespark CLI - Python frontend.

A thin compatibility frontend over the same content catalog, the same
classification rules, and the same templates as the TypeScript CLI
(``@melodiespark/cli``). One catalog, two frontends, one policy.

This package deliberately does not implement catalog construction or its own
extraction rules. Those live in the shared contract:

    packages/content-catalog/rules/classification-rules.json
    packages/content-catalog/catalog/content-catalog.json

Installation targets:

    pip install melodiespark-cli
    pipx install melodiespark-cli
"""

from __future__ import annotations

__version__ = "0.1.0"
__all__ = ["__version__", "main"]


def main(argv: list[str] | None = None) -> int:
    """Entry point for the ``melodiespark-cli`` and ``melodiespark`` scripts."""
    from .cli import main as _main

    return _main(argv)
