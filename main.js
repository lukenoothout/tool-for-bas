import p5 from "p5";
import { pane, PARAMS } from "./pane";
import { Tile } from "./tile";
import { Grid } from "./grid";
import { Layout } from "./layout_generator";
import { Treemap } from "./treemap";

const sketch = (p) => {
  let numTiles;
  let currentTile;
  let progress = 0;

  pane.addBinding(PARAMS, "progress", {
    readonly: true,
  });

  let geistMonoBlack;
  let geistMonoRegular;

  p.preload = function () {
    geistMonoBlack = p.loadFont("GeistMono-Black.otf");
    geistMonoRegular = p.loadFont("GeistMono-Regular.otf");
  };

  p.setup = function () {};

  p.draw = function () {
    if (PARAMS.running) {
      p.createCanvas(PARAMS.width, PARAMS.height);
      let layout = new Layout(PARAMS.width, PARAMS.height, PARAMS.layout);
      const grid = [];
      const tiles = [];
      layout.cells.forEach((cell) => {
        grid.push({
          x: cell.x,
          y: cell.y,
          w: cell.width,
          h: cell.height,
          containsContent: cell.containsContent,
          treeMap: new Treemap(
            cell.width,
            cell.height,
            cell.containsContent ? 0 : 3
          ),
        });
      });

      let numTiles = 0;
      let currentTile = 0;
      grid.forEach((cell) => (numTiles += cell.treeMap.cells.length));
      console.log(numTiles);

      grid.forEach((cell) => {
        cell.treeMap.cells.forEach((section) => {
          let t = new Tile(
            p,
            section.w,
            section.h,
            section.x + cell.x,
            section.y + cell.y,
            cell.containsContent,
            geistMonoBlack,
            geistMonoRegular
          );
          tiles.push(t);
          currentTile += 1;
          console.log(((currentTile / numTiles) * 100).toFixed(0));
        });
      });

      tiles.forEach((t) => p.image(t.mainImage, t.x, t.y));
      // const tile = new Tile(
      //   p,
      //   PARAMS.width,
      //   PARAMS.height,
      //   0,
      //   0,
      //   false,
      //   geistMonoBlack,
      //   geistMonoRegular
      // );
      // p.image(tile.mainImage, tile.x, tile.y);
    }
    PARAMS.running = false;
  };
};

new p5(sketch);
