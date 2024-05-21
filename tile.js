import { PARAMS } from "./pane";

export class Tile {
  constructor(p, w, h, x, y, scale = Math.floor(Math.random() * 20) + 1) {
    this.p = p;
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.layers = 10;
    this.bufferImages = [];
    this.points = [];
    // this.tile;
    this.swap = Math.floor(Math.random() * 2);
    // this.swap = false;

    this.bufferDots();
    this.generatePoints();
    this.render();
  }

  bufferDots() {
    // Generate images of the dots, with different levels of blur and opacity for each layer
    for (let i = 0; i < this.layers; i++) {
      // Offset to change parameters based on the layer (using a sine wave to make the effects the least for the middle layers)
      let layerOffset =
        this.p.sin((this.p.PI / this.layers) * i + this.p.PI) + 1;

      // Set up a buffer image for each dot and push to the imgs array
      let bufferSize = 400;
      let buffer = this.p.createGraphics(bufferSize, bufferSize);
      buffer.noStroke();
      buffer.fill(this.swap ? PARAMS.dotColor1 : PARAMS.dotColor2);
      buffer.circle(bufferSize / 2, bufferSize / 2, 4 * i + 5 * this.scale);
      buffer.filter(this.p.BLUR, layerOffset * 10);
      this.bufferImages.push(buffer);
    }
  }

  generatePoints() {
    // Generate the points for each image
    this.p.noiseSeed(PARAMS.noiseSeed);
    for (let image = 0; image < 2; image++) {
      this.points.push([]);
      for (let layer = 0; layer < this.layers; layer++) {
        for (let _x = 0; _x < this.w; _x += (layer + 1) * 5 * this.scale) {
          for (let _y = 0; _y < this.h; _y += (layer + 1) * 5 * this.scale) {
            const pnt = {
              x: _x,
              y: _y,
              l: layer,
            };
            if (
              this.p.noise(
                pnt.x / (10 * (40 - layer)),
                pnt.y / (10 * (40 - layer)),
                layer / 10 + 10 * image
              ) > 0.6
            ) {
              this.points[image].push(pnt);
            }
          }
        }
      }
    }
  }

  render() {
    this.tile = this.p.createGraphics(this.w, this.h);
    this.tile.background(this.swap ? PARAMS.bgColor1 : PARAMS.bgColor2);
    // set the Blendmode
    this.tile.blendMode(this.p.DIFFERENCE);

    // For each set of points, create a buffer image that set of points and draw it on the canvas.
    this.points.forEach((set) => {
      let img = this.p.createGraphics(this.w, this.h);
      // img.blendMode(this.p.DIFFERENCE);
      img.background(this.swap ? PARAMS.bgColor1 : PARAMS.bgColor2);
      set.forEach((pnt) => {
        img.image(
          this.bufferImages[pnt.l],
          pnt.x - this.bufferImages[pnt.l].width / 2,
          pnt.y - this.bufferImages[pnt.l].height / 2
        );
      });
      // img.fill(this.swap ? PARAMS.bgColor1 : PARAMS.bgColor2);
      // if (Math.random() > 0.5) img.rect(0, 0, this.w, this.h);
      // img.circle(this.w / 2, this.h / 2, this.w > this.h ? this.h : this.w);
      this.tile.image(img, 0, 0);
    });
  }
}
