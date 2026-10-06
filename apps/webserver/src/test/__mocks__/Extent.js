class ExtentMock {
  constructor({ xmin, ymin, xmax, ymax } = {}) {
    this.xmin = xmin;
    this.ymin = ymin;
    this.xmax = xmax;
    this.ymax = ymax;
  }

  expand(factor) {
    const width = (this.xmax - this.xmin) * (factor - 1);
    const height = (this.ymax - this.ymin) * (factor - 1);
    this.xmin -= width / 2;
    this.xmax += width / 2;
    this.ymin -= height / 2;
    this.ymax += height / 2;
    return this;
  }
}

module.exports = ExtentMock;
