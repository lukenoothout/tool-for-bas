import { PARAMS, pane } from "./pane";
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
    this.scale = 10;
    this.layers = 10;
    this.bufferImages = [[], []];
    this.points = [];
    this.annotions = [];
    this.swap = Math.random() > 0.5; // For each cell, pick one of the two color combinations
    this.palettes = ["#E770DE", "#FFADED", "#00C212", "#DDADED", "#000000"];
    this.spotColors = [];
    // this.spotColors.push(this.palettes[PARAMS.palette]);
    // this.spotColors.push(this.palettes[PARAMS.palette2]);
    this.spotColors.push(
      this.p.color(PARAMS.color1.r, PARAMS.color1.g, PARAMS.color1.b)
    );
    this.spotColors.push(
      this.p.color(PARAMS.color2.r, PARAMS.color2.g, PARAMS.color2.b)
    );
    // console.log(this.spotColors);
    // this.bgColor = this.p.color("#EEEDF5");
    this.bgColor = this.p.color(
      PARAMS.background.r,
      PARAMS.background.g,
      PARAMS.background.b
    );
    // this.bgColor = this.p.color("#FFF");
    this.pushToGrid = PARAMS.pushToGrid;
    PARAMS.scale = PARAMS.customSettings
      ? PARAMS.scale
      : Math.floor(Math.random() * 30) + 10;

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
    for (let index = 0; index < 2; index++) {
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
        if (PARAMS.backgroundFade) this.spotColor.setAlpha(255 - (9 - i) * 20);
        buffer.fill(this.spotColors[index]);
        // buffer.fill(Math.random() > 0.5 ? this.palettes[0] : this.palettes[1]);
        buffer.circle(
          bufferSize / 2,
          bufferSize / 2,
          // this.cellSize * 0.8 + i * 4
          this.cellSize * i
        );
        buffer.filter(this.p.BLUR, layerOffset * 10);
        this.bufferImages[index].push(buffer);
      }
    }
  }

  generatePoints() {
    // Select 1 embedding as the focal point
    for (let image = 0; image < 2; image++) {
      this.points.push([]);
      if (!PARAMS.customSettings) {
        PARAMS.keyEmbedding = Math.floor(Math.random() * embeddings.length);
        PARAMS.rangeWidth = Math.floor(Math.random() * 35 + 5);
        PARAMS.rangeHeight = Math.floor(Math.random() * 35 + 5);
        PARAMS.rangeDepth = Math.floor(Math.random() * 35 + 5);
        pane.refresh();
      }

      const keyEmbedding = embeddings[PARAMS.keyEmbedding];
      const rangeWidth = PARAMS.rangeWidth;
      const rangeHeight = PARAMS.rangeHeight;
      const rangeDepth = PARAMS.rangeDepth;

      const leftBoundary = keyEmbedding.embedding[0] - rangeWidth;
      const rightBoundary = keyEmbedding.embedding[0] + rangeWidth;
      const bottomBoundary = keyEmbedding.embedding[1] - rangeHeight;
      const topBoundary = keyEmbedding.embedding[1] + rangeHeight;
      const frontBoundary = keyEmbedding.embedding[2] - rangeDepth;
      const backBoundary = keyEmbedding.embedding[2] + rangeDepth;

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

      this.cellSize = PARAMS.scale;
      this.nCellsInWidth = this.w / this.cellSize;
      this.nCellsInHeight = this.h / this.cellSize;

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
          const _c = image;
          this.points[image].push({
            x: _x,
            y: _y,
            l: _z,
            c: _c,
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
          const _c = image;
          this.points[image].push({
            x: _x,
            y: _y,
            l: _z,
            c: _c,
          });
        });
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
    this.layerScale = 1.5 * this.cellSize;
    this.mainImage = this.p.createGraphics(this.w, this.h);
    this.tile = this.p.createGraphics(this.w, this.h);
    this.tile.background(this.bgColor); // turn back on!

    if (PARAMS.mode === 0) {
      // For each set of points, create a buffer image that set of points and draw it on the canvas.
      this.points.forEach((set, i) => {
        let img = this.p.createGraphics(this.w, this.h);
        // img.background(this.bgColor); // turn back on!
        set.forEach((pnt) => {
          if (this.bufferImages[pnt.c][pnt.l]) {
            // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
            img.image(
              this.bufferImages[pnt.c][pnt.l],
              pnt.x * pnt.l -
                this.bufferImages[pnt.c][pnt.l].width / 2 +
                pnt.l *
                  this.layerScale *
                  this.p.map(
                    pnt.x - this.w / 2,
                    -this.w / 2,
                    this.w / 2,
                    -1,
                    1
                  ),
              pnt.y * pnt.l -
                this.bufferImages[pnt.c][pnt.l].height / 2 +
                pnt.l *
                  this.layerScale *
                  this.p.map(pnt.y - this.h / 2, -this.h / 2, this.h / 2, -1, 1)
            );
          }
        });
        this.tile.image(img, 0, 0);
        // this.tile.fill(this.palettes[PARAMS.palette]);
        // if (this.containsContent) this.tile.filter(this.p.BLUR, 20);
      });
      this.mainImage.background(this.bgColor);
      // this.mainImage.blendMode(this.p.EXCLUSION);
      this.mainImage.image(this.tile, 0, 0);
    }

    if (PARAMS.mode === 1) {
      const allPoints = this.points.flat();
      console.log(allPoints);
      // For each layer, filter out the points on that layer.
      for (let l = 0; l < this.layers; l++) {
        const pointsInLayer = allPoints.filter((pnt) => pnt.l === l);

        let img = this.p.createGraphics(this.w, this.h);
        // img.background(this.bgColor); // turn back on!
        pointsInLayer.forEach((pnt) => {
          if (this.bufferImages[pnt.c][pnt.l]) {
            // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
            img.image(
              this.bufferImages[pnt.c][pnt.l],
              pnt.x * pnt.l -
                this.bufferImages[pnt.c][pnt.l].width / 2 +
                pnt.l *
                  this.layerScale *
                  this.p.map(
                    pnt.x - this.w / 2,
                    -this.w / 2,
                    this.w / 2,
                    -1,
                    1
                  ),
              pnt.y * pnt.l -
                this.bufferImages[pnt.c][pnt.l].height / 2 +
                pnt.l *
                  this.layerScale *
                  this.p.map(pnt.y - this.h / 2, -this.h / 2, this.h / 2, -1, 1)
            );
          }
        });
        this.tile.image(img, 0, 0);
        // this.tile.fill(this.palettes[PARAMS.palette]);
        // if (this.containsContent) this.tile.filter(this.p.BLUR, 20);
      }
      this.mainImage.background(this.bgColor);
      // this.mainImage.blendMode(this.p.EXCLUSION);
      this.mainImage.image(this.tile, 0, 0);
    }

    if (PARAMS.mode === 2) {
      // For each set of points, create a buffer image that set of points and draw it on the canvas.
      let img = this.p.createGraphics(this.w, this.h);
      // img.background(this.bgColor); // turn back on!
      this.points[0].forEach((pnt) => {
        if (this.bufferImages[pnt.c][pnt.l]) {
          // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
          img.image(
            this.bufferImages[pnt.c][pnt.l],
            pnt.x * pnt.l -
              this.bufferImages[pnt.c][pnt.l].width / 2 +
              pnt.l *
                this.layerScale *
                this.p.map(pnt.x - this.w / 2, -this.w / 2, this.w / 2, -1, 1),
            pnt.y * pnt.l -
              this.bufferImages[pnt.c][pnt.l].height / 2 +
              pnt.l *
                this.layerScale *
                this.p.map(pnt.y - this.h / 2, -this.h / 2, this.h / 2, -1, 1)
          );
        }
      });
      let highlights = this.p.createGraphics(this.w, this.h);
      this.points[0].forEach((pnt) => {
        if (Math.random() < PARAMS.highlightchance) {
          if (this.bufferImages[1][pnt.l]) {
            // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
            img.image(
              this.bufferImages[1][pnt.l],
              pnt.x * pnt.l -
                this.bufferImages[1][pnt.l].width / 2 +
                pnt.l *
                  this.layerScale *
                  this.p.map(
                    pnt.x - this.w / 2,
                    -this.w / 2,
                    this.w / 2,
                    -1,
                    1
                  ),
              pnt.y * pnt.l -
                this.bufferImages[1][pnt.l].height / 2 +
                pnt.l *
                  this.layerScale *
                  this.p.map(pnt.y - this.h / 2, -this.h / 2, this.h / 2, -1, 1)
            );
          }
        }
      });

      this.tile.image(img, 0, 0);
      // this.tile.fill(this.palettes[PARAMS.palette]);
      // if (this.containsContent) this.tile.filter(this.p.BLUR, 20);

      this.mainImage.background(this.bgColor);
      // this.mainImage.blendMode(this.p.EXCLUSION);
      this.mainImage.image(this.tile, 0, 0);
    }
    // this.mainImage.noStroke();

    // this.mainImage.fill(255); // Turn back on
    // this.mainImage.rect(0, 0, this.w, this.h); // Turn back on

    // this.mainImage.blendMode(this.p.BLEND);
    // this.mainImage.textAlign(this.p.LEFT, this.p.CENTER);
    // if (!this.containsContent) {
    //   const x = (this.annotions[0].x * this.annotions[0].l) / 5;
    //   const y = (this.annotions[0].y * this.annotions[0].l) / 5;
    //   this.mainImage.image(
    //     this.cross,
    //     x - this.cross.width / 2,
    //     y - this.cross.height / 2
    //   );
    //   this.mainImage.textFont(this.fontBold);
    //   this.mainImage.text(`${this.annotions[0].label}`, x + 16, y - 18);
    //   this.mainImage.textFont(this.fontRegular);
    //   this.mainImage.text(`${this.annotions[0].title}`, x + 16, y - 6);
    //   this.mainImage.text(`${this.annotions[0].source}`, x + 16, y + 6);
    //   this.mainImage.text(
    //     `[${this.annotions[0].embedding[0]}, ${this.annotions[0].embedding[1]}, ${this.annotions[0].embedding[2]}]`,
    //     x + 15,
    //     y + 18
    //   );
    // }
  }
}
