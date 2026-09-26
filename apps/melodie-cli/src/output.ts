/** Terminal output helpers. No dependencies: the CLI must install anywhere. */

const SUPPORTS_COLOR =
  process.env.NO_COLOR === undefined &&
  process.env.TERM !== 'dumb' &&
  Boolean(process.stdout.isTTY);

const wrap = (code: string) => (text: string): string => (SUPPORTS_COLOR ? `\u001b[${code}m${text}\u001b[0m` : text);

export const style = {
  bold: wrap('1'),
  dim: wrap('2'),
  red: wrap('31'),
  green: wrap('32'),
  yellow: wrap('33'),
  blue: wrap('34'),
  magenta: wrap('35'),
  cyan: wrap('36'),
};

export function heading(text: string): void {
  process.stdout.write(`\n${style.bold(text)}\n${style.dim('-'.repeat(text.length))}\n`);
}

export function line(text = ''): void {
  process.stdout.write(`${text}\n`);
}

export function warn(text: string): void {
  process.stderr.write(`${style.yellow('warning')} ${text}\n`);
}

export function fail(text: string): void {
  process.stderr.write(`${style.red('error')} ${text}\n`);
}

export function table(rows: string[][], headers?: string[]): void {
  const all = headers ? [headers, ...rows] : rows;
  if (all.length === 0) return;
  const widths: number[] = [];
  for (const row of all) {
    row.forEach((cell, i) => {
      widths[i] = Math.max(widths[i] ?? 0, visibleLength(cell));
    });
  }
  const render = (row: string[]): string =>
    row.map((cell, i) => pad(cell, widths[i])).join('  ').trimEnd();

  if (headers) line(style.bold(render(headers)));
  for (const row of rows) line(render(row));
}

function visibleLength(text: string): number {
  // Strip ANSI sequences before measuring.
  return text.replace(/\u001b\[\d+m/g, '').length;
}

function pad(text: string, width: number): string {
  const visible = text.replace(/\u001b\[\d+m/g, '');
  return text + ' '.repeat(Math.max(0, width - visible.length));
}

export function bytesHuman(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

export const statusColor = (status: string): string => {
  switch (status) {
    case 'OPERATIONAL':
      return style.green(status);
    case 'SCAFFOLD':
      return style.cyan(status);
    case 'UNVERIFIED':
      return style.yellow(status);
    case 'BLOCKED':
      return style.red(status);
    case 'PLANNED':
    case 'PAPER-ONLY':
      return style.dim(status);
    default:
      return status;
  }
};
