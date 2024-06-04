export class Layout {
  constructor(width, height, contentType) {
    this.width = width;
    this.height = height;
    this.contentType = contentType; // 0 = Main graphic, 1 = full HD Info block, 2 = Instagram main graphic, 3 = Instagram speaker anouncement, 4 = Instagram info block, 5 = Portrait poster, 5 = Pattern.
    this.contentTypes = [
      // Main Graphic
      {
        cellsToSkip: [6, 9, 10],
        contentCells: [
          {
            id: 2,
            cols: 1,
            rows: 1,
          },
          {
            id: 5,
            cols: 2,
            rows: 2,
          },
        ],
      },
      // Full HD info block
      {
        cellsToSkip: [1, 4, 5, 8, 9],
        contentCells: [
          {
            id: 0,
            cols: 2,
            rows: 3,
          },
          {
            id: 15,
            cols: 1,
            rows: 1,
          },
        ],
      },
      // Instagram main graphic
      {
        cellsToSkip: [3, 5, 6, 7, 8, 9, 10, 11],
        contentCells: [
          {
            id: 2,
            cols: 2,
            rows: 1,
          },
          {
            id: 4,
            cols: 4,
            rows: 2,
          },
        ],
      },
      // Instagram speaker announcement
      {
        cellsToSkip: [1, 4, 5, 7, 9, 12, 13, 15],
        contentCells: [
          {
            id: 0,
            cols: 2,
            rows: 2,
          },
          {
            id: 3,
            cols: 1,
            rows: 1,
          },
          {
            id: 6,
            cols: 2,
            rows: 1,
          },
          {
            id: 8,
            cols: 2,
            rows: 2,
          },
          { id: 14, cols: 2, rows: 1 },
        ],
      },
      // Instagram info block
      {
        cellsToSkip: [1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14],
        contentCells: [
          {
            id: 0,
            cols: 3,
            rows: 4,
          },
          {
            id: 15,
            cols: 1,
            rows: 1,
          },
        ],
      },
      // Portrait poster
      {
        cellsToSkip: [1, 2, 13],
        contentCells: [
          {
            id: 0,
            cols: 3,
            rows: 1,
          },
          {
            id: 12,
            cols: 2,
            rows: 1,
          },
          {
            id: 15,
            cols: 1,
            rows: 1,
          },
        ],
      },
    ];
    this.initialCells = [];
    this.cells = [];

    this.numberOfCols = 4;
    this.numberOfRows = 4;
    this.cellWidth = this.width / this.numberOfCols;
    this.cellHeight = this.height / this.numberOfRows;

    this.initializeCells();
    this.mergeFreeCells();
  }

  initializeCells() {
    // Create the initial grid
    let i = 0;
    for (let _row = 0; _row < this.numberOfRows; _row++) {
      for (let _col = 0; _col < this.numberOfCols; _col++) {
        // Flag to check wether a cell should pushed or not
        let skipCell = false;

        // Flag to check wether a cell should contain content or not
        let contentCell = false;

        // Calculate the ID of the cell
        let _id = _col + this.numberOfRows * _row;

        // Check if the cell should be skipped;
        if (
          this.contentTypes[this.contentType].cellsToSkip.filter(
            (id_to_skip) => id_to_skip === _id
          ).length === 0
        ) {
          let width_multiplier = 1;
          let height_multiplier = 1;

          // Check if the cell should contain content, and apply the right dimensions
          this.contentTypes[this.contentType].contentCells.forEach((cell) => {
            if (cell.id === _id) {
              contentCell = true;
              width_multiplier = cell.cols;
              height_multiplier = cell.rows;
            }
          });

          let _width = this.cellWidth * width_multiplier;
          let _height = this.cellHeight * height_multiplier;

          // calculate the the x and y coordinates.
          let _x = _col * this.cellWidth;
          let _y = _row * this.cellHeight;

          // Save the cell to an array
          this.initialCells.push({
            col: _col,
            row: _row,
            id: _id,
            index: i,
            x: _x,
            y: _y,
            width: _width,
            height: _height,
            containsContent: contentCell,
            merged: false,
          });
          i++;
        }
      }
    }
  }

  mergeFreeCells() {
    // Starting from the top left cel, going left to righ top to bottom: randomly merge cells with one or more neighbours.

    // First we push the cells that contain content to the cells aray
    this.initialCells
      .filter((initCell) => initCell.containsContent === true)
      .forEach((contentCell) => this.cells.push(contentCell));

    // Array that contain the IDs of all free cells that don't contain content and can be merged:
    const freeCells = this.initialCells
      .filter((cell) => !cell.containsContent)
      .map((cell) => cell.index);

    // For each cell:
    this.initialCells.forEach((cell) => {
      const id = cell.id;
      const cellIndex = cell.index;
      const row = cell.row;
      const col = cell.col;
      let horizontalNeighbours;
      let verticalNeighbours;
      // Check if the cell is elligbele to merge with neighbours
      if (freeCells.filter((index) => index === cellIndex).length > 0) {
        // This line checks if the Cell we are currently looking at is present in the freeCells array.
        // Store all the horizontal & vertical neighbours that still exist as free cells
        horizontalNeighbours = this.initialCells
          .filter(
            // Filter on cells that are in the same row, have a ID that comes after the current ID, and don't contain content
            (possibleNeighbour) =>
              possibleNeighbour.row === row &&
              possibleNeighbour.id > id &&
              !possibleNeighbour.containsContent
          )
          .map((possibleNeighbour) => possibleNeighbour.index); // Save the indexes
        verticalNeighbours = this.initialCells
          .filter(
            // Filter on cells that are in the same col, have a ID that comes after the current ID, and don't contain content
            (possibleNeighbour) =>
              possibleNeighbour.col === col &&
              possibleNeighbour.id > id &&
              !possibleNeighbour.containsContent
          )
          .map((possibleNeighbour) => possibleNeighbour.index); // Save the indexes
        // Clean the neighbour arrays so that there are no gaps between the cells
        for (let i = 0; i < horizontalNeighbours.length; i++) {
          // For every horizontal neighbour
          if (
            // If the first "neighbour" is not adjacent to the current cell...
            this.initialCells[horizontalNeighbours[0]].col -
              this.initialCells[cellIndex].col >
            1
          ) {
            horizontalNeighbours = []; // ...clear the array
          }
          if (this.initialCells[horizontalNeighbours[i + 1]]) {
            // If there is a neighbour to look at
            if (
              // ...and if the "neighbours" or not in adjacent columns...
              this.initialCells[horizontalNeighbours[i + 1]].col -
                this.initialCells[horizontalNeighbours[i]].col >
              1
            ) {
              horizontalNeighbours = horizontalNeighbours.slice(0, i + 1); // ... slice the array
            }
          }
        }
        for (let i = 0; i < verticalNeighbours.length; i++) {
          // For every horizontal neighbour
          if (
            // If the first "neighbour" is not adjacent to the current cell...
            this.initialCells[verticalNeighbours[0]].row -
              this.initialCells[cellIndex].row >
            1
          ) {
            verticalNeighbours = []; // ...clear the array
          }
          if (this.initialCells[verticalNeighbours[i + 1]]) {
            // If there is a neighbour to look at
            if (
              // ...and if the "neighbours" or not in adjacent rows...
              this.initialCells[verticalNeighbours[i + 1]].row -
                this.initialCells[verticalNeighbours[i]].row >
              1
            ) {
              verticalNeighbours = verticalNeighbours.slice(0, i + 1); // ... slice the array
            }
          }
        }

        // By default, cells shouldn't merge:
        let n_cells_to_merge_horizontally = 0;
        let n_cells_to_merge_vertically = 0;

        let mergeHorizontal = false;
        let mergeVertical = false;

        // Roll the dice to see if the cells should merge, horizontaly or vertically
        if (horizontalNeighbours.length > 0 && verticalNeighbours.length === 0)
          mergeHorizontal = true;
        if (horizontalNeighbours.length === 0 && verticalNeighbours.length > 0)
          mergeVertical = true;
        if (horizontalNeighbours.length > 0 && verticalNeighbours.length > 0) {
          let dice = Math.random();
          mergeHorizontal = dice < 0.5 ? true : false;
          mergeVertical = dice < 0.5 ? false : true;
        }

        if (mergeHorizontal) {
          if (Math.random() > 0.3 && horizontalNeighbours.length > 0) {
            // if there are neighbours to merge with & a 50% chance
            // Generate a number of cells to merge with
            n_cells_to_merge_horizontally = Math.floor(
              Math.random() * horizontalNeighbours.length + 1
            );
            for (let i = 0; i < n_cells_to_merge_horizontally; i++) {
              // Remove the cells that have been merged into the current cell
              const cellToRemove = freeCells.indexOf(horizontalNeighbours[i]);
              freeCells.splice(cellToRemove, 1);
            }
          }
        }

        if (mergeVertical) {
          if (Math.random() > 0.3 && verticalNeighbours.length > 0) {
            // if there are neighbours to merge with & a 50% chance
            // Generate a number of cells to merge with
            n_cells_to_merge_vertically = Math.floor(
              Math.random() * verticalNeighbours.length + 1
            );

            for (let i = 0; i < n_cells_to_merge_vertically; i++) {
              // Remove the cells that have been merged into the current cell
              const cellToRemove = freeCells.indexOf(verticalNeighbours[i]);
              freeCells.splice(cellToRemove, 1);
            }
          }
        }

        // Push the final cell to the cells array
        this.cells.push({
          col: this.initialCells[cellIndex].col,
          row: this.initialCells[cellIndex].row,
          id: this.initialCells[cellIndex].id,
          index: this.initialCells[cellIndex].index,
          x: this.initialCells[cellIndex].x,
          y: this.initialCells[cellIndex].y,
          width: this.cellWidth * (n_cells_to_merge_horizontally + 1),
          height: this.cellHeight * (n_cells_to_merge_vertically + 1),
          containsContent: this.initialCells[cellIndex].containsContent,
        });
      }
    });
  }
}
