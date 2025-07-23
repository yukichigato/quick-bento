import Cell from "./Cell.js";
import GridRow from "./GridRow.js";
import GridCol from "./GridCol.js";

class Grid {
  constructor({ rowAmount, colAmount, gap = 0 }) {
    this.rows = Array.from(
      { length: rowAmount },
      (_, rowIndex) => new GridRow({ rowIndex })
    );
    this.cols = Array.from(
      { length: colAmount },
      (_, colIndex) => new GridCol({ colIndex })
    );
    this.rowAmount = rowAmount;
    this.colAmount = colAmount;
    this.gap = gap; // rem
    this.padding = 1; // rem
    this.cells = [];
    this.mesh = Array.from({ length: rowAmount }, () =>
      Array(colAmount).fill({ isUsed: false })
    );

    this.drawGrid();
  }

  deformCell({ cellIndex, rowStart, rowEnd, colStart, colEnd }) {
    const cell = this.cells[cellIndex];
    if (!cell) {
      throw new Error("Cell not found");
    }

    if (
      rowStart < 0 ||
      rowEnd >= this.rowAmount ||
      colStart < 0 ||
      colEnd >= this.colAmount
    ) {
      throw new Error("Invalid range");
    }

    for (let i = cell.rowStart; i <= cell.rowEnd; i++) {
      for (let j = cell.colStart; j <= cell.colEnd; j++) {
        this.mesh[i][j] = { isUsed: false };
      }
    }

    for (let i = rowStart; i <= rowEnd; i++) {
      for (let j = colStart; j <= colEnd; j++) {
        if (this.mesh[i][j].isUsed) {
          throw new Error(
            "Target position already occupied at row " + i + ", col " + j
          );
        }
        this.mesh[i][j] = { isUsed: true };
      }
    }

    cell.rowStart = rowStart;
    cell.rowEnd = rowEnd;
    cell.colStart = colStart;
    cell.colEnd = colEnd;
    this.cells[cellIndex] = cell;

    this.drawContent();
  }

  moveCell({ cellIndex, movementRows, movementCols }) {
    const cell = this.cells[cellIndex];
    if (!cell) {
      throw new Error("Cell not found");
    }

    const newRowStart = cell.rowStart + movementRows;
    const newColStart = cell.colStart + movementCols;
    const newRowEnd = cell.rowEnd + movementRows;
    const newColEnd = cell.colEnd + movementCols;

    if (
      newRowStart < 0 ||
      newColStart < 0 ||
      newRowEnd >= this.rowAmount ||
      newColEnd >= this.colAmount
    ) {
      throw new Error("Movement out of bounds");
    }

    for (let i = cell.rowStart; i <= cell.rowEnd; i++) {
      for (let j = cell.colStart; j <= cell.colEnd; j++) {
        this.mesh[i][j] = { isUsed: false };
      }
    }

    for (let i = newRowStart; i <= newRowEnd; i++) {
      for (let j = newColStart; j <= newColEnd; j++) {
        if (this.rows[i].isUsed || this.cols[j].isUsed) {
          throw new Error("Target position already occupied");
        }

        this.mesh[i][j] = { isUsed: true };
      }
    }

    cell.rowStart = newRowStart;
    cell.colStart = newColStart;
    cell.rowEnd = newRowEnd;
    cell.colEnd = newColEnd;

    this.cells[cellIndex] = cell;

    this.drawContent();
  }

  addCell({ row, col }) {
    if (row < 0 || col >= this.colAmount || row > col) {
      throw new Error("Invalid range");
    }

    if (this.rows[row].isUsed || this.cols[col].isUsed) {
      throw new Error("Cell already in use");
    }

    const cell = new Cell({
      rowStart: row,
      rowEnd: row,
      colStart: col,
      colEnd: col,
    });

    this.mesh[row][col] = { isUsed: true };

    this.cells.push(cell);
    this.drawCells();
  }

  drawGrid() {
    const gridArea = document.querySelector("#gridArea");
    const div = document.createElement("div");
    div.id = "grid";
    Object.assign(div.style, {
      display: "grid",
      gridTemplateRows: `repeat(${this.rowAmount}, 1fr)`,
      gridTemplateColumns: `repeat(${this.colAmount}, 1fr)`,
      gap: `${this.gap}rem`,
      padding: `${this.padding}rem`,
      width: "100%",
      height: "100%",
    });
    gridArea.appendChild(div);
  }

  drawContent() {
    const grid = document.querySelector("#grid");
    grid.remove();
    this.drawGrid();

    this.drawCells();
    this.drawEmptyCells();
  }

  drawEmptyCells() {
    this.rows.forEach((row) => {
      this.cols.forEach((col) => {
        if (this.mesh[row.rowIndex][col.colIndex].isUsed) return;
        const grid = document.querySelector("#grid");
        const emptyCellDiv = document.createElement("div");
        emptyCellDiv.className = "empty-cell";
        Object.assign(emptyCellDiv.style, {
          gridRowStart: row.rowIndex + 1,
          gridRowEnd: row.rowIndex + 2,
          gridColumnStart: col.colIndex + 1,
          gridColumnEnd: col.colIndex + 2,
          backgroundColor: "lightgray",
        });
        grid.appendChild(emptyCellDiv);
      });
    });
  }

  drawCells() {
    this.cells.forEach((cell) => {
      const grid = document.querySelector("#grid");
      const cellDiv = document.createElement("div");
      cellDiv.className = "cell";
      Object.assign(cellDiv.style, {
        gridRowStart: cell.rowStart + 1,
        gridRowEnd: cell.rowEnd + 2,
        gridColumnStart: cell.colStart + 1,
        gridColumnEnd: cell.colEnd + 2,
        backgroundColor: "lightblue",
        zIndex: 1,
      });
      grid.appendChild(cellDiv);
    });
  }
}

export default Grid;
