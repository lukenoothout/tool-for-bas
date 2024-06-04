import { PARAMS } from "./pane";
import { embeddings } from "./public/embeddings";

export class Tile {
  constructor(p, w, h, x, y, containsContent, fontBold, fontRegular) {
    this.p = p;
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.containsContent = containsContent; // Check if the cell should be blured to accomodate content
    this.fontBold = fontBold;
    this.fontRegular = fontRegular;
    // Take the smallest dimension, and map it's size between 1 and 20
    // this.scale = Math.floor(
    //   this.p.map(this.h < this.w ? this.h : this.w, 0, 2000, 1, 10)
    // );
    this.scale = Math.floor(this.p.random() * 19 + 1);
    // console.log(this.scale);
    // this.layers = Math.floor(Math.random() * 3) * 2 + 3;
    this.layers = 10;
    this.bufferImages = [];
    this.points = [];
    this.annotions = [];
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
    this.pushToGrid = Math.random() > 1;

    this.generateCross();
    this.generatePoints();
    this.bufferDots();
    this.render();
  }

  generateCross() {
    this.cross = this.p.createGraphics(40, 40);
    this.cross.noFill();
    this.cross.stroke(255);
    this.cross.strokeWeight(1);
    this.cross.strokeCap(this.p.SQUARE);
    this.cross.line(15, 20, 25, 20);
    this.cross.line(20, 15, 20, 25);
    this.cross.circle(20, 20, 20);
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
      buffer.fill(255);
      // buffer.fill(Math.random() > 0.5 ? this.palettes[0] : this.palettes[1]);
      buffer.circle(
        bufferSize / 2,
        bufferSize / 2,
        // this.cellSize * 0.8 + i * 4
        this.cellSize * 0.8 * (i / 5)
      );
      buffer.filter(this.p.BLUR, layerOffset * 10);
      this.bufferImages.push(buffer);
    }
  }

  generatePoints() {
    // Select 1 embedding as the focal point
    for (let image = 0; image < 2; image++) {
      this.points.push([]);
      const keyEmbedding =
        embeddings[Math.floor(Math.random() * embeddings.length)];
      const rangeWidth = Math.floor(Math.random() * 15 + 5);
      const rangeHeight = Math.floor(Math.random() * 15 + 5);
      const rangeDepth = Math.floor(Math.random() * 15 + 5);

      const leftBoundary = keyEmbedding.embedding[0] - rangeWidth;
      const rightBoundary = keyEmbedding.embedding[0] + rangeWidth;
      const bottomBoundary = keyEmbedding.embedding[1] - rangeHeight;
      const topBoundary = keyEmbedding.embedding[1] + rangeHeight;
      const frontBoundary = keyEmbedding.embedding[2] - rangeDepth;
      const backBoundary = keyEmbedding.embedding[2] + rangeDepth;

      // console.log(keyEmbedding);

      // Array that will hold all the embeddings currently in range
      let embeddingsInRange = embeddings.filter(
        (emb) =>
          emb.embedding[0] > leftBoundary &&
          emb.embedding[0] < rightBoundary &&
          emb.embedding[1] > bottomBoundary &&
          emb.embedding[1] < topBoundary &&
          emb.embedding[2] > frontBoundary &&
          emb.embedding[2] < backBoundary
      );

      // this.scale = this.p.constrain(
      //   this.p.map(embeddingsInRange.length, 500, 50, 1, 10),
      //   1,
      //   10
      // );
      this.scale = this.p.random(1, 20);
      this.cellSize = 5 * this.scale;
      this.nCellsInWidth = this.w / this.cellSize;
      this.nCellsInHeight = this.h / this.cellSize;

      // console.log("scale: " + this.scale);
      // console.log("cellSize: " + this.cellSize);
      // console.log("nCellsInWidth: " + this.nCellsInWidth);
      // console.log("nCellsInHeight: " + this.nCellsInHeight);

      // console.log(embeddingsInRange.length);
      // Translate the coordinates to fit within the tile
      if (this.pushToGrid) {
        embeddingsInRange.forEach((emb) => {
          const _x =
            Math.floor(
              this.p.map(
                emb.embedding[0],
                leftBoundary,
                rightBoundary,
                0,
                this.nCellsInWidth
              )
            ) * this.cellSize;
          const _y =
            Math.floor(
              this.p.map(
                emb.embedding[1],
                bottomBoundary,
                topBoundary,
                0,
                this.nCellsInHeight
              )
            ) * this.cellSize;
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
      if (!this.pushToGrid) {
        embeddingsInRange.forEach((emb) => {
          const _x = this.p.map(
            emb.embedding[0],
            leftBoundary,
            rightBoundary,
            0,
            this.w
          );
          const _y = this.p.map(
            emb.embedding[1],
            bottomBoundary,
            topBoundary,
            0,
            this.h
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
        this.points[image] = [...new Set(this.points[image])];
      }
      const randomIndex = Math.floor(Math.random() * this.points[image].length);
      const annotation = embeddingsInRange[randomIndex];
      this.annotions.push({
        embedding: annotation.embedding,
        file: annotation.file,
        label: annotation.label,
        source: annotation.source,
        title: annotation.title,
        year: annotation.year,
        x: this.p.map(
          annotation.embedding[0],
          leftBoundary,
          rightBoundary,
          0,
          this.w
        ),
        y: this.p.map(
          annotation.embedding[1],
          bottomBoundary,
          topBoundary,
          0,
          this.h
        ),
        l: Math.floor(
          this.p.map(
            annotation.embedding[2],
            frontBoundary,
            backBoundary,
            0,
            this.layers
          )
        ),
      });
    }
  }

  render() {
    this.layerScale = 0.2;
    this.mainImage = this.p.createGraphics(this.w, this.h);
    this.mainImage.blendMode(this.p.EXCLUSION);
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
      img.fill(255);
      // for (let y = 0; y < this.nCellsInWidth; y++) {
      //   for (let x = 0; x < this.nCellsInHeight; x++) {
      //     img.square(x * this.cellSize, y * this.cellSize, this.cellSize);
      //   }
      // }
      set.forEach((pnt) => {
        if (this.bufferImages[pnt.l] && pnt.l) {
          // img.noFill();
          // img.stroke(255);
          // img.square(pnt.x, pnt.y, pnt.cellSize);
          if (this.pushToGrid) {
            console.log(pnt.x, pnt.y);
            // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
            img.image(
              this.bufferImages[pnt.l],
              (pnt.x * pnt.l) / 5 - this.bufferImages[pnt.l].width / 2,
              (pnt.y * pnt.l) / 5 - this.bufferImages[pnt.l].height / 2
            );
          }
          if (!this.pushToGrid) {
            img.image(
              this.bufferImages[pnt.l],
              pnt.x * pnt.l * this.layerScale -
                this.bufferImages[pnt.l].width / 2,
              pnt.y * pnt.l * this.layerScale -
                this.bufferImages[pnt.l].height / 2
            );
          }
        }
      });
      img.fill(255);
      img.rect(0, 0, this.w, this.h);
      this.tile.image(img, 0, 0);
      this.tile.fill(this.palettes[PARAMS.palette]);
      // this.tile.fill(
      //   this.palettes[Math.floor(Math.random() * this.palettes.length)]
      // );
      // this.tile.fill(this.swap ? this.spotColor : this.blue);
      this.tile.rect(0, 0, this.w, this.h);
      if (this.containsContent) this.tile.filter(this.p.BLUR, 20);
      this.mainImage.image(this.tile, 0, 0);
      // this.mainImage.noStroke();
      // this.mainImage.fill("#FF0000");
      // this.mainImage.circle(
      //   Math.random() * this.w,
      //   Math.random() * this.h,
      //   this.cellSize / 5
      // );
    });
    this.mainImage.noStroke();
    this.mainImage.fill(255);
    this.mainImage.rect(0, 0, this.w, this.h);
    this.mainImage.blendMode(this.p.BLEND);
    this.mainImage.textAlign(this.p.LEFT, this.p.CENTER);
    if (!this.containsContent) {
      const x = (this.annotions[0].x * this.annotions[0].l) / 5;
      const y = (this.annotions[0].y * this.annotions[0].l) / 5;
      this.mainImage.image(
        this.cross,
        x - this.cross.width / 2,
        y - this.cross.height / 2
      );
      this.mainImage.textFont(this.fontBold);
      this.mainImage.text(`${this.annotions[0].label}`, x + 16, y - 18);
      this.mainImage.textFont(this.fontRegular);
      this.mainImage.text(`${this.annotions[0].title}`, x + 16, y - 6);
      this.mainImage.text(`${this.annotions[0].source}`, x + 16, y + 6);
      this.mainImage.text(
        `[${this.annotions[0].embedding[0]}, ${this.annotions[0].embedding[1]}, ${this.annotions[0].embedding[2]}]`,
        x + 15,
        y + 18
      );
    }
  }
}
