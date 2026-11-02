#!/usr/bin/env python3
"""Bundle pinned GitHub source archives without executing their code."""
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import tarfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
NAME = "Melodie_Ultimate_Final_Release"
OWNER = "melodielovemax-svg"


def main():
    manifest = json.loads((ROOT / "release/manifest.json").read_text(encoding="utf-8"))
    output = ROOT / "dist"
    output.mkdir(exist_ok=True)
    target = output / f"{NAME}.zip"
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for file in ("README.md", "manifest.json"):
            bundle.write(ROOT / "release" / file, f"{NAME}/{file}")
        for repo in manifest["repositories"]:
            name, sha = repo["name"], repo["sha"]
            if not name.replace('-', '').replace('_', '').isalnum() or len(sha) != 40 or any(c not in '0123456789abcdef' for c in sha):
                raise ValueError("Invalid repository name or commit")
            url = f"https://codeload.github.com/{OWNER}/{name}/tar.gz/{sha}"
            print(f"Fetching {name} at {sha}", flush=True)
            with urllib.request.urlopen(url, timeout=60) as response:
                data = response.read()
            with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
                for member in archive:
                    parts = PurePosixPath(member.name).parts
                    if len(parts) < 2 or member.isdir():
                        continue
                    if not member.isfile() or any(p in ("..", ".") for p in parts) or member.name.startswith('/'):
                        raise ValueError(f"Unsafe archive member: {member.name}")
                    source = archive.extractfile(member)
                    if source is None:
                        raise ValueError(f"Unable to read {member.name}")
                    info = zipfile.ZipInfo(f"{NAME}/repositories/{name}/{'/'.join(parts[1:])}")
                    info.compress_type = zipfile.ZIP_DEFLATED
                    info.external_attr = (member.mode & 0o777) << 16
                    bundle.writestr(info, source.read())
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    (output / f"{NAME}.zip.sha256").write_text(f"{digest}  {target.name}\n", encoding="utf-8")
    print(f"Created {target}: {digest}")


if __name__ == "__main__":
    main()
