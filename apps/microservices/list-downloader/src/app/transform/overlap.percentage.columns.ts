import { Transform } from 'stream';

class OverlapPercentageColumns extends Transform {
  constructor(private rules = [], private total = 'totalAreaHa') {
    super({ objectMode: true });
  }

  run = (chunk) => {
    const totalValue = chunk[this.total];

    // Loop through each rule to calculate and add the percentage column
    this.rules.forEach((rule) => {
      const value = chunk[rule.from];

      if (totalValue !== undefined && totalValue !== 0 && value !== undefined && value !== 0) {
        const percentage = (value / totalValue) * 100;
        chunk[rule.target] = percentage === 0 ? 0 : percentage.toFixed(2);
      } else {
        chunk[rule.target] = 0;
      }
    });

    return chunk;
  };

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }

    const newChunk = this.run(chunk);

    next(null, newChunk);
  }
}

export { OverlapPercentageColumns };
