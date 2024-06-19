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
    this.spotColors = [];
    this.spotColors.push(
      this.p.color(PARAMS.color1.r, PARAMS.color1.g, PARAMS.color1.b)
    );
    this.spotColors.push(
      this.p.color(PARAMS.color2.r, PARAMS.color2.g, PARAMS.color2.b)
    );
    this.bgColor = this.p.color(
      PARAMS.background.r,
      PARAMS.background.g,
      PARAMS.background.b
    );
    this.pushToGrid = PARAMS.snapToGrid;

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
        // buffer.fill(this.spotColors[index]);
        index === 0 ? buffer.fill(0) : buffer.fill(255);
        // buffer.fill(Math.random() > 0.5 ? this.palettes[0] : this.palettes[1]);
        buffer.circle(
          bufferSize / 2,
          bufferSize / 2,
          // this.cellSize * 0.8 + i * 4
          this.cellSize * 1 + i * PARAMS.layerScale
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
      if (!PARAMS.lockEmbeddings) {
        PARAMS.keyEmbedding1 = Math.floor(Math.random() * embeddings.length);
        PARAMS.keyEmbedding2 = Math.floor(Math.random() * embeddings.length);
        //   PARAMS.rangeWidth = Math.floor(Math.random() * 35 + 5);
        //   PARAMS.rangeHeight = Math.floor(Math.random() * 35 + 5);
        //   PARAMS.rangeDepth = Math.floor(Math.random() * 35 + 5);
        pane.refresh();
      }

      const keyEmbedding =
        image === 0
          ? embeddings[PARAMS.keyEmbedding1]
          : embeddings[PARAMS.keyEmbedding2];
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

    // The background: Background color, with all the dots in white
    const bg = this.p.createGraphics(this.w, this.h);
    bg.background(this.bgColor);
    this.points.forEach((set) => {
      set.forEach((pnt) => {
        if (this.bufferImages[1][pnt.l]) {
          // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
          bg.image(
            this.bufferImages[1][pnt.l],
            pnt.x * pnt.l -
              this.bufferImages[1][pnt.l].width / 2 +
              pnt.l *
                this.layerScale *
                this.p.map(pnt.x - this.w / 2, -this.w / 2, this.w / 2, -1, 1),
            pnt.y * pnt.l -
              this.bufferImages[1][pnt.l].height / 2 +
              pnt.l *
                this.layerScale *
                this.p.map(pnt.y - this.h / 2, -this.h / 2, this.h / 2, -1, 1)
          );
        }
      });
    });

    // Bottom layer: White background with black dots
    const bottomLayer = this.p.createGraphics(this.w, this.h);
    bottomLayer.background(255);
    this.points[0].forEach((pnt) => {
      if (this.bufferImages[0][pnt.l]) {
        // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
        bottomLayer.image(
          this.bufferImages[0][pnt.l],
          pnt.x * pnt.l -
            this.bufferImages[0][pnt.l].width / 2 +
            pnt.l *
              this.layerScale *
              this.p.map(pnt.x - this.w / 2, -this.w / 2, this.w / 2, -1, 1),
          pnt.y * pnt.l -
            this.bufferImages[0][pnt.l].height / 2 +
            pnt.l *
              this.layerScale *
              this.p.map(pnt.y - this.h / 2, -this.h / 2, this.h / 2, -1, 1)
        );
      }
    });

    // Top layer: White background with black dots
    const topLayer = this.p.createGraphics(this.w, this.h);
    topLayer.background(255);
    this.points[1].forEach((pnt) => {
      if (this.bufferImages[0][pnt.l]) {
        // #BUG Sometimes this.bufferImages[pnt.l] returns as undefined
        topLayer.image(
          this.bufferImages[0][pnt.l],
          pnt.x * pnt.l -
            this.bufferImages[0][pnt.l].width / 2 +
            pnt.l *
              this.layerScale *
              this.p.map(pnt.x - this.w / 2, -this.w / 2, this.w / 2, -1, 1),
          pnt.y * pnt.l -
            this.bufferImages[0][pnt.l].height / 2 +
            pnt.l *
              this.layerScale *
              this.p.map(pnt.y - this.h / 2, -this.h / 2, this.h / 2, -1, 1)
        );
      }
    });

    // Overlaps: By screening the top layer against the bottom layer, we are left with the overlaps in black on a white background
    const overlaps = this.p.createGraphics(this.w, this.h);
    overlaps.image(bottomLayer, 0, 0);
    overlaps.blendMode(this.p.SCREEN);
    overlaps.image(topLayer, 0, 0);

    // Highlights: By screening the overlaps against a colored background, we are left with the colored overlaps with a white background
    const highlights = this.p.createGraphics(this.w, this.h);
    highlights.background(this.spotColors[0]);
    highlights.blendMode(this.p.SCREEN);
    highlights.image(overlaps, 0, 0);

    // Non Overlaps: By differencing the top and bottom layer against a white background, we are left with the non-overlapping areas in black against a white background
    const nonOverlaps = this.p.createGraphics(this.w, this.h);
    nonOverlaps.background(255);
    nonOverlaps.blendMode(this.p.DIFFERENCE);
    nonOverlaps.image(bottomLayer, 0, 0);
    nonOverlaps.image(topLayer, 0, 0);

    // Highlights: By screening the non-overlaps against a colored background, we are left with the colored non-overlaps with a white background
    const baseLayer = this.p.createGraphics(this.w, this.h);
    baseLayer.background(this.spotColors[1]);
    baseLayer.blendMode(this.p.SCREEN);
    baseLayer.image(nonOverlaps, 0, 0);

    // Main image: The main image that is returned - the background image, with the base layer and highlights multiplied over them.
    this.mainImage.image(bg, 0, 0);
    this.mainImage.blendMode(this.p.MULTIPLY);
    this.mainImage.image(baseLayer, 0, 0);
    this.mainImage.image(highlights, 0, 0);
  }
}
