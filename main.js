import p5 from "p5";
import { pane, PARAMS } from "./pane";
import { Tile } from "./tile";
import { Grid } from "./grid";
import { Treemap } from "./treemap";

const sketch = (p) => {
  p.setup = function () {};

  p.draw = function () {
    if (PARAMS.running) {
      p.createCanvas(PARAMS.width, PARAMS.height);
      // let grid = new Grid(PARAMS.width, PARAMS.height, PARAMS.depth, 800);
      let grid = new Treemap(PARAMS.width, PARAMS.height, PARAMS.depth);
      console.log(grid);
      const tiles = [];
      grid.cells.forEach((cell) => {
        let t = new Tile(p, cell.w, cell.h, cell.x, cell.y);
        tiles.push(t);
      });
      // for (let y = 0; y < 2; y++) {
      //   for (let x = 0; x < 2; x++) {
      //     let t = new Tile(p, 500, 500, x * 500, y * 500);
      //     tiles.push(t);
      //   }
      // }
      tiles.forEach((t) => p.image(t.tile, t.x, t.y));
    }
    PARAMS.running = false;
  };
};

new p5(sketch);
