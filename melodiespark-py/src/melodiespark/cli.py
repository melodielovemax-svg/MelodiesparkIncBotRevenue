import click
import json
import sys
from .client import MelodieClient
from .crypto import normalize_address

@click.group()
@click.option("--url", default="http://127.0.0.1:4173", help="Melodiespark Command Center URL")
@click.pass_context
def main(ctx, url):
    """Melodiespark CLI — Master Command Line Interface (Python)"""
    ctx.ensure_object(dict)
    ctx.obj["client"] = MelodieClient(base_url=url)

@main.command()
@click.pass_context
def status(ctx):
    """Check Command Center health and database status."""
    client: MelodieClient = ctx.obj["client"]
    try:
        health = client.get_health()
        dash = client.get_dashboard()
        click.echo("\n=== MELODIESPARK SYSTEM STATUS (Python CLI) ===")
        click.echo(f"Health Status   : {health.get('status', 'unknown').upper()}")
        click.echo(f"Mode            : {health.get('mode', 'demo').upper()}")
        click.echo(f"Version         : {health.get('version', '0.1.0')}")
        guardians = dash.get("guardians", {})
        click.echo(f"Arc-Angels      : {guardians.get('arc_angel', 0)}")
        click.echo(f"Sub-Guardians   : {guardians.get('sub_guardian', 0)}")
        click.echo(f"Connected Wallets: {dash.get('wallets', 0)}")
        click.echo("==============================================\n")
    except Exception as e:
        click.echo(f"Error connecting to Command Center: {e}", err=True)
        sys.exit(1)

@main.command()
@click.option("--tier", default=None, help="Filter by tier (arc_angel, guardian, sub_guardian)")
@click.option("--limit", default=20, help="Number of records to show")
@click.pass_context
def guardians(ctx, tier, limit):
    """List guardian matrix configuration profiles."""
    client: MelodieClient = ctx.obj["client"]
    try:
        items = client.list_guardians(tier=tier, limit=limit)
        click.echo(f"\n=== GUARDIANS REGISTRY (Showing {len(items)} profiles) ===")
        for g in items:
            click.echo(f"[{g.tier.upper():<12}] {g.name:<24} | Domain: {g.domain:<14} | Soul: {g.soul_core}")
        click.echo("=========================================================\n")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

@main.command()
@click.pass_context
def karma(ctx):
    """Display karma ledger summary."""
    client: MelodieClient = ctx.obj["client"]
    try:
        k = client.get_karma()
        click.echo("\n=== KARMA SUMMARY ===")
        click.echo(f"Balance      : {k.balance} Karma Points")
        click.echo(f"Transferable : {k.transferable}")
        click.echo(f"Notice       : {k.notice}\n")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

@main.command()
@click.option("--event", default="boss_slain", help="Event type")
@click.option("--boss", default="The Cinder Warden", help="Boss name")
@click.option("--act", default=1, type=int, help="Act number")
@click.option("--damage", default=12500, type=int, help="Damage dealt")
@click.option("--shatters", default=8, type=int, help="Shatters triggered")
@click.option("--karma", default=50, type=int, help="Karma earned")
@click.pass_context
def telemetry(ctx, event, boss, act, damage, shatters, karma):
    """Send Path of Melodie gameplay telemetry."""
    client: MelodieClient = ctx.obj["client"]
    try:
        res = client.emit_telemetry(
            event_type=event,
            act_number=act,
            boss_defeated=boss,
            damage_dealt=damage,
            shatters=shatters,
            karma_earned=karma
        )
        click.echo(f"Telemetry Sent Successfully: Event ID {res.get('eventId')} (Received: {res.get('receivedAt')})")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

@main.command()
@click.argument("address")
@click.option("--chain-id", default=1, type=int, help="EVM Chain ID")
@click.pass_context
def challenge(ctx, address, chain_id):
    """Generate non-custodial EIP-191 challenge for an address."""
    client: MelodieClient = ctx.obj["client"]
    try:
        norm = normalize_address(address)
        ch = client.get_wallet_challenge(norm, chain_id=chain_id)
        click.echo("\n=== EIP-191 WALLET CHALLENGE ===")
        click.echo(f"Address : {ch.get('address')}")
        click.echo(f"Nonce   : {ch.get('nonce')}")
        click.echo(f"Message :\n{ch.get('message')}")
        click.echo(f"Expires : {ch.get('expiresAt')}\n")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
