import { Transform } from 'stream';

class OverlapPercentageColumns extends Transform {
  constructor(private rules = [], private total = 'totalAreaHA') {
    super({ objectMode: true });
  }

  run = (chunk) => {
    // Loop through each rule to calculate and add the percentage column
    this.rules.forEach((rule) => {
      const totalValue = chunk[this.total];
      const value = chunk[rule.from];

      if (totalValue && value) {
        const percentage = (value / totalValue) * 100;
        chunk[rule.target] = percentage.toFixed(2);
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
