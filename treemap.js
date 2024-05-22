export class Treemap {
  constructor(w, h, depth = 3) {
    this.w = w;
    this.h = h;
    this.depth = depth;
    this.cells = [];
    this.depthChange = depth;
    this.createCell(0, 0, this.w, this.h, this.depth);
  }

  createCell(x, y, w, h, depth) {
    if (depth > 0) {
      const div1 = Math.floor(Math.random() * 7 + 2) / 10; // Random number between 0.2 and 0.8
      const div2 = 1 - div1;
      let direction = Math.floor(Math.random() * 2); // Horizontal = 0, Vertical = 1;
      if (direction === 0) {
        this.createCell(
          x,
          y,
          w,
          Math.ceil(h * div1),
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
        this.createCell(
          x,
          Math.floor(y + h * div1),
          w,
          Math.ceil(h * div2),
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
      }
      if (direction === 1) {
        this.createCell(
          x,
          y,
          Math.ceil(w * div1),
          h,
          depth - (Math.floor(Math.random() * this.depthChange) + 1)
        );
        this.createCell(
          Math.floor(x + w * div1),
          y,
          Math.ceil(w * div2),
          h,
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
