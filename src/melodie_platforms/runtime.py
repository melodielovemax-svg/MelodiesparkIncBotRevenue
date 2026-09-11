import shutil
import subprocess
from pathlib import Path

WORKSPACE = Path(r"D:\MelodieCLII")

def resolve_command(command: str):
    return shutil.which(command)

def installed(command: str) -> bool:
    return resolve_command(command) is not None

def run_native(command: str, args: list[str]):
    executable = resolve_command(command)

    if not executable:
        raise RuntimeError(f"Command not installed or not on PATH: {command}")

    result = subprocess.run(
        [executable, *args],
        cwd=str(WORKSPACE),
        check=False,
        shell=False
    )

    return result.returncode
