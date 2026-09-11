import sys
import typer

from rich.console import Console
from rich.table import Table

from .registry import load_registry
from .runtime import installed, resolve_command, run_native

app = typer.Typer(
    add_completion=False,
    help="Melodiespark Inc. Unified Platforms CLI"
)

console = Console()


def registry():
    return load_registry()


@app.command()
def list():
    """List all registered platforms."""

    table = Table(title="MELODIESPARK UNIFIED PLATFORMS")

    table.add_column("ID")
    table.add_column("Platform")
    table.add_column("Category")
    table.add_column("Status")
    table.add_column("Executable")

    for key, platform in registry().items():

        command = platform["command"]
        path = resolve_command(command)

        table.add_row(
            key,
            platform["name"],
            platform["category"],
            "VERIFIED" if path else "UNVERIFIED",
            path or "-"
        )

    console.print(table)


@app.command()
def doctor():
    """Run platform availability checks."""

    entries = registry()

    passed = 0

    console.print("\n[bold]MELODIESPARK PLATFORMS DOCTOR[/bold]\n")

    for key, platform in entries.items():

        ok = installed(platform["command"])

        if ok:
            passed += 1

        console.print(
            f"{platform['name']:<24} "
            f"{'[green]VERIFIED[/green]' if ok else '[yellow]UNVERIFIED[/yellow]'}"
        )

    total = len(entries)

    console.print(
        f"\nReadiness: {passed}/{total} "
        f"({round((passed / total) * 100) if total else 0}%)"
    )


@app.command(
    context_settings={
        "allow_extra_args": True,
        "ignore_unknown_options": True
    }
)
def run(
    ctx: typer.Context,
    platform: str = typer.Argument(...)
):
    """
    Run any registered platform and pass through remaining arguments.

    Example:
      platforms run claude --help
    """

    platforms = registry()

    key = platform.lower()

    if key not in platforms:
        console.print(f"[red]Unknown platform:[/red] {platform}")
        raise typer.Exit(1)

    target = platforms[key]

    try:
        code = run_native(
            target["command"],
            list(ctx.args)
        )
    except RuntimeError as exc:
        console.print(f"[red]{exc}[/red]")
        raise typer.Exit(1)

    raise typer.Exit(code)


@app.command()
def info(platform: str):
    """Show information about one registered platform."""

    entries = registry()

    key = platform.lower()

    if key not in entries:
        console.print(f"[red]Unknown platform:[/red] {platform}")
        raise typer.Exit(1)

    p = entries[key]

    console.print({
        "id": key,
        "name": p["name"],
        "category": p["category"],
        "command": p["command"],
        "installed": installed(p["command"]),
        "path": resolve_command(p["command"])
    })


def direct_dispatch():

    # Allows:
    #
    # platforms claude
    # platforms claude --help
    # platforms opencode .
    #
    # instead of requiring:
    #
    # platforms run claude

    if len(sys.argv) < 2:
        return False

    name = sys.argv[1].lower()

    reserved = {
        "list",
        "doctor",
        "run",
        "info",
        "--help",
        "-h"
    }

    if name in reserved:
        return False

    entries = registry()

    if name not in entries:
        return False

    target = entries[name]
    args = sys.argv[2:]

    try:
        code = run_native(target["command"], args)
    except RuntimeError as exc:
        console.print(f"[red]{exc}[/red]")
        sys.exit(1)

    sys.exit(code)


def main():
    direct_dispatch()
    app()


if __name__ == "__main__":
    main()
