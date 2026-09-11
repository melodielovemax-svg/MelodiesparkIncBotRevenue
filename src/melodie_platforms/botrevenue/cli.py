from __future__ import annotations

import json

import typer
from rich.console import Console
from rich.table import Table

from .ledger import ledger_path, read_events, summarize
from .policy import policy


app = typer.Typer(
    add_completion=False,
    help="Melodiespark Inc. BotRevenue Automation CLI",
)

console = Console()


@app.command()
def status() -> None:
    """Show evidence-backed BotRevenue status."""

    events = read_events()
    summary = summarize(events)

    console.print("\n[bold cyan]BOTREVENUE STATUS[/bold cyan]\n")

    table = Table()

    table.add_column("Metric")
    table.add_column("Value")
    table.add_column("Evidence")

    table.add_row(
        "Verified payments",
        str(summary["verified_payments"]),
        summary["status"],
    )

    table.add_row(
        "Verified revenue",
        str(summary["verified_revenue"]),
        summary["status"],
    )

    table.add_row(
        "Fulfilled orders",
        str(summary["fulfilled_orders"]),
        summary["status"],
    )

    table.add_row(
        "Ledger",
        str(ledger_path()),
        "VERIFIED" if ledger_path().exists() else "UNVERIFIED",
    )

    console.print(table)


@app.command()
def policy_show() -> None:
    """Show financial automation safeguards."""

    console.print_json(json.dumps(policy()))


@app.command()
def evidence() -> None:
    """Print the evidence-backed revenue summary."""

    console.print_json(json.dumps(summarize(read_events())))


@app.command()
def golden_path() -> None:
    """Show the canonical BotRevenue golden path."""

    stages = [
        "CATALOG",
        "CHECKOUT",
        "PAYMENT_VERIFICATION",
        "FULFILLMENT",
        "ENTITLEMENT",
        "EVIDENCE",
    ]

    for number, stage in enumerate(stages, start=1):
        console.print(
            f"{number}. {stage}: [yellow]UNVERIFIED until supported by real evidence[/yellow]"
        )


def main() -> None:
    app()


if __name__ == "__main__":
    main()
