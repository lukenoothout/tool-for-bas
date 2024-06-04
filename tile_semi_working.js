import { PARAMS } from "./pane";
import { embeddings } from "./public/embeddings";

export class Tile {
  constructor(p, w, h, x, y, containsContent) {
    this.p = p;
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.containsContent = containsContent; // Check if the cell should be blured to accomodate content
    // Take the smallest dimension, and map it's size between 1 and 20
    // this.scale = Math.floor(
    //   this.p.map(this.h < this.w ? this.h : this.w, 0, 2000, 1, 10)
    // );
    this.scale = Math.floor(this.p.random() * 19 + 1);
    // console.log(this.scale);
    this.layers = 10;
    this.bufferImages = [];
    this.points = [];
    this.swap = Math.random() > 0.5; // For each cell, pick one of the two color combinations
    this.palettes = ["#0038FF", "#70EFC5", "#FFAF00", "#FF3A63", "#F67600"];
    // this.cellSize = 5 * this.scale;
    // this.nCellsInWidth = this.w / this.cellSize;
    // this.nCellsInHeight = this.h / this.cellSize;
    // console.log(this.cellSize, this.nCellsInWidth, this.nCellsInHeight);
    // this.bgColor = this.p.color("#F5F5F5");
    this.bgColor = this.p.color("#000");
    this.blue = this.p.color("#0038FF");
    this.spotColor = this.p.color(this.palettes[PARAMS.palette]);

    this.generatePoints();
    this.bufferDots();
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
      // buffer.fill(this.swap ? this.spotColor : this.blue);
      buffer.fill("255");
      buffer.circle(bufferSize / 2, bufferSize / 2, 4 * i + this.cellSize);
      buffer.filter(this.p.BLUR, layerOffset * 10);
      this.bufferImages.push(buffer);
    }
  }

  // generatePoints() {
  //   // Generate the points for each image
  //   this.p.noiseSeed(PARAMS.noiseSeed);
  //   for (let image = 0; image < 1; image++) {
  //     this.points.push([]);
  //     for (let layer = 0; layer < this.layers; layer++) {
  //       for (let _x = 0; _x < this.w; _x += (layer + 1) * 5 * this.scale) {
  //         for (let _y = 0; _y < this.h; _y += (layer + 1) * 5 * this.scale) {
  //           const pnt = {
  //             x: _x,
  //             y: _y,
  //             l: layer,
  //           };
  //           if (
  //             this.p.noise(
  //               pnt.x / (10 * (40 - layer)),
  //               pnt.y / (10 * (40 - layer)),
  //               layer / 10 + 10 * image
  //             ) > 0.6
  //           ) {
  //             this.points[image].push(pnt);
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  generatePoints() {
    // Select 1 embedding as the focal point
    this.keyEmbedding =
      embeddings[Math.floor(Math.random() * embeddings.length)];
    const rangeWidth = Math.floor(Math.random() * 15 + 5);
    const rangeHeight = Math.floor(Math.random() * 15 + 5);
    const rangeDepth = Math.floor(Math.random() * 15 + 5);

    const leftBoundary = this.keyEmbedding.embedding[0] - rangeWidth;
    const rightBoundary = this.keyEmbedding.embedding[0] + rangeWidth;
    const bottomBoundary = this.keyEmbedding.embedding[1] - rangeHeight;
    const topBoundary = this.keyEmbedding.embedding[1] + rangeHeight;
    const frontBoundary = this.keyEmbedding.embedding[2] - rangeDepth;
    const backBoundary = this.keyEmbedding.embedding[2] + rangeDepth;

    console.log(this.keyEmbedding);

    // Array that will hold all the embeddings currently in range
    const embeddingsInRange = embeddings.filter(
      (emb) =>
        emb.embedding[0] > leftBoundary &&
        emb.embedding[0] < rightBoundary &&
        emb.embedding[1] > bottomBoundary &&
        emb.embedding[1] < topBoundary &&
        emb.embedding[2] > frontBoundary &&
        emb.embedding[2] < backBoundary
    );

    this.scale = this.p.constrain(
      this.p.map(embeddingsInRange.length, 500, 50, 1, 10),
      1,
      10
    );
    this.cellSize = 5 * this.scale;
    this.nCellsInWidth = this.w / this.cellSize;
    this.nCellsInHeight = this.h / this.cellSize;
    console.log(
      this.scale,
      this.cellSize,
      this.nCellsInWidth,
      this.nCellsInHeight
    );

    console.log(embeddingsInRange.length);

    for (let image = 0; image < 1; image++) {
      this.points.push([]);
      // Translate the coordinates to fit within the tile
      embeddingsInRange.forEach((emb) => {
        const _x = Math.floor(
          this.p.map(
            emb.embedding[0],
            leftBoundary,
            rightBoundary,
            0,
            this.nCellsInWidth
          ) * this.cellSize
        );
        const _y = Math.floor(
          this.p.map(
            emb.embedding[1],
            bottomBoundary,
            topBoundary,
            0,
            this.nCellsInHeight
          ) * this.cellSize
        );
        const _z = Math.floor(
          this.p.map(
            emb.embedding[2],
            frontBoundary,
            backBoundary,
            0,
            this.layers
          )
        );
        this.points[image].push({
          x: _x,
          y: _y,
          l: _z,
        });
      });
    }
  }

  render() {
    this.layerScale = 0.2;
    this.tile = this.p.createGraphics(this.w, this.h);
    // let layers = this.p.createGraphics(this.w, this.h);
    this.tile.background(this.bgColor);
    // set the Blendmode
    this.tile.blendMode(this.p.SCREEN);

    // For each set of points, create a buffer image that set of points and draw it on the canvas.
    this.points.forEach((set, i) => {
      let img = this.p.createGraphics(this.w, this.h);
      img.blendMode(this.p.DIFFERENCE);
      img.background(this.bgColor);
      set.forEach((pnt) => {
        // img.image(
        //   this.bufferImages[pnt.l],
        //   pnt.x * this.cellSize * (pnt.l * this.layerScale) -
        //     this.bufferImages[pnt.l].width / 2 -
        //     (this.w * pnt.l * this.layerScale) / 2,
        //   pnt.y * this.cellSize * (pnt.l * this.layerScale) -
        //     this.bufferImages[pnt.l].height / 2 -
        //     (this.h * pnt.l * this.layerScale) / 2
        // );
        // img.image(
        //   this.bufferImages[pnt.l],
        //   pnt.x * this.cellSize * (pnt.l * this.layerScale) -
        //     this.bufferImages[pnt.l].width / 2,
        //   pnt.y * this.cellSize * (pnt.l * this.layerScale) -
        //     this.bufferImages[pnt.l].height / 2
        // );
        if (this.bufferImages[pnt.l] && pnt.l === 5) {
          console.log(pnt);
          // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
          img.image(
            this.bufferImages[pnt.l],
            pnt.x * this.layerScale * pnt.l -
              this.bufferImages[pnt.l].width / 2,
            pnt.y * this.layerScale * pnt.l -
              this.bufferImages[pnt.l].height / 2
          );
        }
      });
      img.fill(255);
      img.rect(0, 0, this.w, this.h);
      this.tile.image(img, 0, 0);
      this.tile.fill(this.palettes[PARAMS.palette]);
      // this.tile.fill(this.swap ? this.spotColor : this.blue);
      this.tile.rect(0, 0, this.w, this.h);
      if (this.containsContent) this.tile.filter(this.p.BLUR, 20);
    });
  }
}
