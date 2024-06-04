import { PARAMS } from "./pane";
import { embeddings } from "./public/embeddings";

// Embeddingas

export class Tile {
  constructor(p, w, h, x, y) {
    this.p = p;
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.scale = Math.floor(
      this.p.map(this.h < this.w ? this.h : this.w, 0, 2000, 1, 20)
    );
    this.layers = 10;
    this.bufferImages = [];
    this.points = [];
    this.swap = Math.random() > 0.5; // For each cell, pick one of the two color combinations
    this.palettes = ["#70EFC5", "#FFAF00", "#FF3A63", "#F67600"];

    this.bgColor = this.p.color("#F5F5F5");
    this.blue = this.p.color("#0038FF");
    console.log(PARAMS.palette);
    this.spotColor = this.p.color(this.palettes[PARAMS.palette]);

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
      buffer.fill(this.swap ? this.spotColor : this.blue);
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
    // let layers = this.p.createGraphics(this.w, this.h);
    this.tile.background(this.bgColor);
    // set the Blendmode
    this.tile.blendMode(this.p.DIFFERENCE);

    // For each set of points, create a buffer image that set of points and draw it on the canvas.
    this.points.forEach((set, i) => {
      let img = this.p.createGraphics(this.w, this.h);
      img.blendMode(this.p.DIFFERENCE);
      img.background(this.bgColor);
      set.forEach((pnt) => {
        img.image(
          this.bufferImages[pnt.l],
          pnt.x - this.bufferImages[pnt.l].width / 2,
          pnt.y - this.bufferImages[pnt.l].height / 2
        );
      });
      this.tile.image(img, 0, 0);
    });
  }
}
