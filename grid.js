export class Grid {
  constructor(w, h, depth = 2, maxSide = 1000) {
    this.w = w;
    this.h = h;
    this.depth = depth;
    this.maxSide = maxSide;
    this.cells = [];
    this.depthChange = 3;

    for (let y = 0; y < h; y += maxSide) {
      for (let x = 0; x < w; x += maxSide) {
        this.createCell(
          x,
          y,
          maxSide,
          maxSide,
          Math.floor(Math.random() * this.depth)
        );
      }
    }
  }

  createCell(x, y, w, h, depth) {
    if (depth > 0) {
      let z = Math.floor(Math.random() * this.depthChange);
      if (z === 0) {
        this.createCell(
          x,
          y,
          w / 2,
          h,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
        this.createCell(
          x + w / 2,
          y,
          w / 2,
          h,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
      }
      if (z === 1) {
        this.createCell(
          x,
          y,
          w,
          h / 2,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
        this.createCell(
          x,
          y + h / 2,
          w,
          h / 2,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
      } else {
        this.createCell(
          x,
          y,
          w / 2,
          h / 2,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
        this.createCell(
          x + w / 2,
          y,
          w / 2,
          h / 2,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
        this.createCell(
          x,
          y + h / 2,
          w / 2,
          h / 2,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
        this.createCell(
          x + w / 2,
          y + h / 2,
          w / 2,
          h / 2,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
      }
    } else {
      this.cells.push({
        x: x,
        y: y,
        w: w,
        h: h,
      });
    }
  }
}
