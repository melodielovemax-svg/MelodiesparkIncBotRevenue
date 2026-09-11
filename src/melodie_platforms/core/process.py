from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass
from typing import Sequence


@dataclass(slots=True)
class ProcessResult:
    command: list[str]
    exit_code: int
    stdout: str
    stderr: str

    @property
    def verified(self) -> bool:
        return self.exit_code == 0


def resolve(command: str) -> str | None:
    return shutil.which(command)


def installed(command: str) -> bool:
    return resolve(command) is not None


def capture(
    command: str,
    args: Sequence[str] | None = None,
    timeout: int = 60,
) -> ProcessResult:
    argv = [command, *(args or [])]

    path = resolve(command)

    if path is None:
        return ProcessResult(
            command=argv,
            exit_code=127,
            stdout="",
            stderr=f"Command not found: {command}",
        )

    try:
        completed = subprocess.run(
            [path, *(args or [])],
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        return ProcessResult(
            command=argv,
            exit_code=124,
            stdout=exc.stdout or "",
            stderr=exc.stderr or f"Command timed out after {timeout}s",
        )

    return ProcessResult(
        command=argv,
        exit_code=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
    )


def passthrough(command: str, args: Sequence[str] | None = None) -> int:
    path = resolve(command)

    if path is None:
        raise RuntimeError(f"Command not found: {command}")

    return subprocess.call([path, *(args or [])])
