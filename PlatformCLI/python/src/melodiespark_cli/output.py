"""Terminal output helpers. Standard library only, no dependencies."""

from __future__ import annotations

import os
import re
import sys
from typing import Iterable, Sequence

_ANSI = re.compile(r"\x1b\[\d+m")

_COLORS = {
    "bold": "1",
    "dim": "2",
    "red": "31",
    "green": "32",
    "yellow": "33",
    "blue": "34",
    "magenta": "35",
    "cyan": "36",
}


def _supports_color() -> bool:
    if os.environ.get("NO_COLOR") is not None:
        return False
    if os.environ.get("TERM") == "dumb":
        return False
    return sys.stdout.isatty()


_COLOR = _supports_color()


def _paint(code: str, text: str) -> str:
    if not _COLOR:
        return text
    return "\x1b[" + code + "m" + text + "\x1b[0m"


def _replace(marker: str) -> "callable[[str], str]":
    color = marker.strip("<>")
    code = _COLORS[color]

    def apply(text: str) -> str:
        return _paint(code, text)

    return apply


bold = _replace("bold")
dim = _replace("dim")
red = _replace("red")
green = _replace("green")
yellow = _replace("yellow")
blue = _replace("blue")
magenta = _replace("magenta")
cyan = _replace("cyan")


def _visible(text: str) -> int:
    return len(_ANSI.sub("", text))


def line(text: str = "") -> None:
    print(text)


def heading(text: str) -> None:
    print()
    print(bold(text))
    print(dim("-" * len(text)))


def warn(text: str) -> None:
    print(f"{yellow('warning')} {text}", file=sys.stderr)


def fail(text: str) -> None:
    print(f"{red('error')} {text}", file=sys.stderr)


def table(rows: Sequence[Sequence[str]], headers: Sequence[str] | None = None) -> None:
    """Print an aligned table, ignoring ANSI codes when measuring."""
    all_rows: list[Sequence[str]] = ([list(headers)] if headers else []) + [list(r) for r in rows]
    if not all_rows:
        return
    widths: list[int] = []
    for row in all_rows:
        for index, cell in enumerate(row):
            current = widths[index] if index < len(widths) else 0
            widths.append(max(current, _visible(str(cell))))

    def render(row: Sequence[str]) -> str:
        parts = []
        for index, cell in enumerate(row):
            text = str(cell)
            parts.append(text + " " * max(0, widths[index] - _visible(text)))
        return "  ".join(parts).rstrip()

    if headers:
        line(bold(render(list(headers))))
    for row in rows:
        line(render(row))


def bytes_human(value: int) -> str:
    """Format a byte count for humans.

    The first division is implicit: it moves the value into kilobytes, so
    ``unit`` indexes ``units`` directly. Getting that order wrong shifts every
    result one unit up (657 MB would render as 657 GB), which is exactly the
    kind of drift the Node/Python parity test exists to catch.
    """
    if value < 1024:
        return f"{value} B"
    units = ("KB", "MB", "GB", "TB")
    amount = float(value) / 1024
    unit = 0
    while amount >= 1024 and unit < len(units) - 1:
        amount /= 1024
        unit += 1
    return f"{amount:.1f} {units[unit]}"


_STATUS_STYLE = {
    "OPERATIONAL": green,
    "SCAFFOLD": cyan,
    "UNVERIFIED": yellow,
    "BLOCKED": red,
    "PLANNED": dim,
    "PAPER-ONLY": dim,
}


def status_color(status: str) -> str:
    return _STATUS_STYLE.get(status, lambda text: text)(status)


def chunked(items: Iterable[str], size: int) -> Iterable[list[str]]:
    """Yield lists of at most ``size`` items."""
    batch: list[str] = []
    for item in items:
        batch.append(item)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:
        yield batch
