#!/usr/bin/env python3
"""Live network fetch for public mentions of "melodeathspark" and "melodiespark inc".

Pulls from public APIs only (GitHub REST search, npm registry search, PyPI JSON),
normalises the results, and writes a timestamped snapshot plus `latest.json`.

Standard library only. Read-only: no credentials are read or sent.

Usage:
    python scripts/fetch_live_mentions.py                 # one fetch
    python scripts/fetch_live_mentions.py --watch 300     # refresh every 300 s
    python scripts/fetch_live_mentions.py --out evidence/live-mentions
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

QUERIES = ["melodeathspark", "melodiespark inc", "melodiespark"]
USER_AGENT = "melodie-live-mentions/0.1 (+public-api-read-only)"
TIMEOUT = 20


def _get_json(url: str, headers: dict[str, str] | None = None) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, **(headers or {})})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:  # noqa: S310 - fixed public hosts
        return json.loads(resp.read().decode("utf-8"))


def _safe(name: str, fn):
    """Run one source; never let one failing source abort the whole snapshot."""
    try:
        return {"source": name, "ok": True, "items": fn()}
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError) as exc:
        return {"source": name, "ok": False, "error": f"{type(exc).__name__}: {exc}", "items": []}


def github_repos(query: str) -> list[dict]:
    headers = {"Accept": "application/vnd.github+json"}
    token = os.environ.get("GITHUB_TOKEN")  # optional; raises rate limit if set
    if token:
        headers["Authorization"] = f"Bearer {token}"
    q = urllib.parse.quote(query)
    data = _get_json(f"https://api.github.com/search/repositories?q={q}&per_page=30&sort=updated", headers)
    return [
        {
            "full_name": r["full_name"],
            "url": r["html_url"],
            "description": r.get("description"),
            "updated_at": r["updated_at"],
            "created_at": r["created_at"],
            "stars": r["stargazers_count"],
            "archived": r["archived"],
        }
        for r in data.get("items", [])
    ]


def github_users(query: str) -> list[dict]:
    q = urllib.parse.quote(query)
    data = _get_json(f"https://api.github.com/search/users?q={q}&per_page=30", {"Accept": "application/vnd.github+json"})
    return [{"login": u["login"], "url": u["html_url"], "type": u["type"]} for u in data.get("items", [])]


def npm_packages(query: str) -> list[dict]:
    q = urllib.parse.quote(query)
    data = _get_json(f"https://registry.npmjs.org/-/v1/search?text={q}&size=20")
    out = []
    for o in data.get("objects", []):
        p = o["package"]
        out.append(
            {
                "name": p["name"],
                "version": p.get("version"),
                "description": p.get("description"),
                "updated_at": p.get("date", {}).get("ts") if isinstance(p.get("date"), dict) else None,
                "url": p.get("links", {}).get("npm"),
            }
        )
    return out


def pypi_exact(name: str) -> list[dict]:
    """PyPI has no search API; check exact project names only. 404 = not published."""
    try:
        data = _get_json(f"https://pypi.org/pypi/{urllib.parse.quote(name)}/json")
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return []
        raise
    info = data["info"]
    return [{"name": info["name"], "version": info["version"], "summary": info.get("summary"),
             "url": info.get("package_url")}]


def collect() -> dict:
    sources: list[dict] = []
    for q in QUERIES:
        sources.append(_safe(f"github.repos:{q}", lambda q=q: github_repos(q)))
        sources.append(_safe(f"github.users:{q}", lambda q=q: github_users(q)))
        sources.append(_safe(f"npm:{q}", lambda q=q: npm_packages(q)))
    for name in ["melodeathspark", "melodiespark", "melodiespark-inc", "melodiespark-platform-cli"]:
        sources.append(_safe(f"pypi:{name}", lambda n=name: pypi_exact(n)))

    total = sum(len(s["items"]) for s in sources)
    now = datetime.now(timezone.utc)
    return {
        "fetched_at": now.isoformat(timespec="seconds"),
        "queries": QUERIES,
        "total_items": total,
        "sources_ok": sum(1 for s in sources if s["ok"]),
        "sources_failed": sum(1 for s in sources if not s["ok"]),
        "sources": sources,
    }


def write_snapshot(result: dict, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = result["fetched_at"].replace(":", "").replace("+0000", "Z")
    path = out_dir / f"snapshot-{stamp}.json"
    text = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
    path.write_text(text, encoding="utf-8")
    (out_dir / "latest.json").write_text(text, encoding="utf-8")
    return path


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default="evidence/live-mentions", help="output directory")
    ap.add_argument("--watch", type=int, metavar="SECONDS", help="repeat fetch every N seconds")
    args = ap.parse_args(argv)
    out_dir = Path(args.out)

    while True:
        result = collect()
        path = write_snapshot(result, out_dir)
        print(f"{result['fetched_at']} items={result['total_items']} "
              f"ok={result['sources_ok']} failed={result['sources_failed']} -> {path}", flush=True)
        if not args.watch:
            return 0 if result["sources_failed"] == 0 else 1
        time.sleep(max(5, args.watch))


if __name__ == "__main__":
    sys.exit(main())
