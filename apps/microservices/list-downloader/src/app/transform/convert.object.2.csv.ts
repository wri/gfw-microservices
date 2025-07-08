import { Transform } from 'stream';

class ConvertObject2CSV extends Transform {
  constructor(private readonly header: string[]) {
    super({ objectMode: true });
  }

  private escapeCSVValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // If the value contains comma, newline, double quote, or spaces, it needs to be quoted
    if (
      stringValue.includes(',') ||
      stringValue.includes('\n') ||
      stringValue.includes('"') ||
      stringValue.includes(' ')
    ) {
      // Escape any existing double quotes by doubling them
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }

    return stringValue;
  }

  _transform(data, _, next) {
    if (!data) {
      return next(null, '');
    }
    const [first] = data;
    let result = '';
    if (Array.isArray(first)) {
      result = data
        .filter((item) => item.length === this.header.length)
        .map((x) => x.map((val) => this.escapeCSVValue(val)).join(','))
        .join('\n');
    } else {
      result = data.map((x) => this.escapeCSVValue(x)).join(',');
    }
    next(null, result ? `${result}\n` : '');
  }
}

export { ConvertObject2CSV };
