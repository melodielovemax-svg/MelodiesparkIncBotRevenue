from __future__ import annotations

import json
import sys

import typer
from rich.console import Console
from rich.table import Table

from . import __version__
from .automation.engine import automation_status
from .botrevenue.ledger import read_events, summarize
from .botrevenue.policy import policy
from .core.paths import workspace_root
from .core.process import capture, installed, passthrough, resolve
from .core.workspace import inventory
from .evidence.writer import evidence_directory, write_json
from .providers.packages import audit_packages
from .providers.services import audit_services
from .registry import load_registry


app = typer.Typer(
    add_completion=False,
    help="Melodiespark Inc. A–Z Platform CLI",
)

console = Console()


def entries() -> dict:
    return load_registry()


@app.command()
def version() -> None:
    """Display CLI version."""

    console.print(f"melodie-platforms {__version__}")


@app.command(name="list")
def list_platforms() -> None:
    """List registered Melodiespark platforms."""

    table = Table(title="MELODIESPARK INC. — PLATFORM REGISTRY")

    table.add_column("ID")
    table.add_column("Platform")
    table.add_column("Category")
    table.add_column("Status")
    table.add_column("Executable")

    for key, item in entries().items():
        path = resolve(item["command"])

        table.add_row(
            key,
            item["name"],
            item["category"],
            "VERIFIED" if path else "UNVERIFIED",
            path or "-",
        )

    console.print(table)


@app.command()
def doctor(json_output: bool = typer.Option(False, "--json")) -> None:
    """Perform an evidence-first platform doctor."""

    report = {
        "version": __version__,
        "workspace": str(workspace_root()),
        "platforms": [],
        "packages": audit_packages(),
        "services": audit_services(),
        "botrevenue": summarize(read_events()),
        "financial_policy": policy(),
    }

    for key, item in entries().items():
        report["platforms"].append(
            {
                "id": key,
                "name": item["name"],
                "command": item["command"],
                "path": resolve(item["command"]),
                "status": "VERIFIED"
                if installed(item["command"])
                else "UNVERIFIED",
            }
        )

    if json_output:
        console.print_json(json.dumps(report))
        return

    console.print("\n[bold cyan]MELODIESPARK PLATFORM DOCTOR[/bold cyan]\n")

    table = Table()

    table.add_column("Platform")
    table.add_column("Status")
    table.add_column("Executable")

    for item in report["platforms"]:
        table.add_row(
            item["name"],
            item["status"],
            item["path"] or "-",
        )

    console.print(table)


@app.command()
def status() -> None:
    """Show high-level ecosystem state."""

    bot = summarize(read_events())

    console.print("\n[bold]MELODIESPARK INC. STATUS[/bold]\n")

    table = Table()

    table.add_column("Component")
    table.add_column("State")

    table.add_row("Workspace", "VERIFIED" if workspace_root().exists() else "FAILED")
    table.add_row("Platforms CLI", "VERIFIED")
    table.add_row("BotRevenue ledger", bot["status"])
    table.add_row("Treasury broadcast", "DISABLED")
    table.add_row("Server private keys", "FALSE")
    table.add_row("Autonomous payouts", "DISABLED")
    table.add_row("Autonomous transfers", "DISABLED")

    console.print(table)


@app.command()
def workspace() -> None:
    """Show workspace inventory."""

    console.print_json(json.dumps(inventory()))


@app.command()
def packages() -> None:
    """Audit npm/pnpm/npx/pip/pipx toolchain."""

    table = Table(title="PACKAGE PROVIDERS")

    table.add_column("Provider")
    table.add_column("Status")
    table.add_column("Version")

    for row in audit_packages():
        table.add_row(
            row["provider"],
            row["status"],
            row["version"] or "-",
        )

    console.print(table)


@app.command()
def services() -> None:
    """Probe local AI/platform services."""

    table = Table(title="LOCAL PLATFORM SERVICES")

    table.add_column("Service")
    table.add_column("Endpoint")
    table.add_column("Status")

    for row in audit_services():
        table.add_row(
            row["service"],
            row["endpoint"],
            row["status"],
        )

    console.print(table)


@app.command()
def botrevenue() -> None:
    """Display evidence-backed BotRevenue metrics."""

    console.print_json(json.dumps(summarize(read_events())))


@app.command()
def automation() -> None:
    """Display automation policy and state."""

    table = Table(title="MELODIESPARK AUTOMATION")

    table.add_column("Automation")
    table.add_column("Risk")
    table.add_column("Status")
    table.add_column("Description")

    for row in automation_status():
        table.add_row(
            row["id"],
            row["risk"],
            row["status"],
            row["description"],
        )

    console.print(table)


@app.command()
def evidence() -> None:
    """Create an evidence snapshot."""

    target = evidence_directory("PLATFORMS-CLI")

    payload = {
        "version": __version__,
        "workspace": inventory(),
        "packages": audit_packages(),
        "services": audit_services(),
        "botrevenue": summarize(read_events()),
        "automations": automation_status(),
        "financial_policy": policy(),
    }

    write_json(
        target / "platform-evidence.json",
        payload,
    )

    console.print(
        f"[green]Evidence written:[/green] {target}"
    )


@app.command(
    context_settings={
        "allow_extra_args": True,
        "ignore_unknown_options": True,
    }
)
def run(
    ctx: typer.Context,
    platform: str = typer.Argument(...),
) -> None:
    """Execute a registered developer platform."""

    registry = entries()
    key = platform.lower()

    if key not in registry:
        console.print(f"[red]Unknown platform:[/red] {platform}")
        raise typer.Exit(1)

    command = registry[key]["command"]

    try:
        code = passthrough(
            command,
            list(ctx.args),
        )
    except RuntimeError as exc:
        console.print(f"[red]{exc}[/red]")
        raise typer.Exit(1)

    raise typer.Exit(code)


@app.command()
def info(platform: str) -> None:
    """Display one platform entry."""

    registry = entries()

    key = platform.lower()

    if key not in registry:
        console.print(f"[red]Unknown platform:[/red] {platform}")
        raise typer.Exit(1)

    item = registry[key]

    console.print_json(
        json.dumps(
            {
                "id": key,
                "name": item["name"],
                "category": item["category"],
                "command": item["command"],
                "installed": installed(item["command"]),
                "path": resolve(item["command"]),
            }
        )
    )


def direct_dispatch() -> bool:
    if len(sys.argv) < 2:
        return False

    name = sys.argv[1].lower()

    reserved = {
        "version",
        "list",
        "doctor",
        "status",
        "workspace",
        "packages",
        "services",
        "botrevenue",
        "automation",
        "evidence",
        "run",
        "info",
        "--help",
        "-h",
    }

    if name in reserved:
        return False

    registry = entries()

    if name not in registry:
        return False

    try:
        code = passthrough(
            registry[name]["command"],
            sys.argv[2:],
        )
    except RuntimeError as exc:
        console.print(f"[red]{exc}[/red]")
        sys.exit(1)

    sys.exit(code)


def main() -> None:
    direct_dispatch()
    app()


if __name__ == "__main__":
    main()
