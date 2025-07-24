import Cell from "./Cell.js";
import GridRow from "./GridRow.js";
import GridCol from "./GridCol.js";
import { updateMesh, revertMeshUpdate } from "./utils.js";

const ROW_OFFSET = 1;
const COL_OFFSET = 1;

class Grid {
  constructor({ rowAmount, colAmount, gap = 0.5 }) {
    if (rowAmount <= 0 || colAmount <= 0) {
      throw new Error("Row and column amounts must be greater than zero");
    }

    if (gap < 0) {
      throw new Error("Gap must be a non-negative number in rem");
    }

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
      Array.from({ length: colAmount }, () => ({ isUsed: false }))
    );
    this.handleEmptyCellClick = this.handleEmptyCellClick.bind(this);
  }

  deformCell = ({ cellIndex, rowStart, rowEnd, colStart, colEnd }) => {
    const cell = this.cells[cellIndex];
    if (!cell) {
      throw new Error("Cell not found");
    }

    if (
      rowStart < 0 ||
      rowEnd >= this.rowAmount ||
      colStart < 0 ||
      colEnd >= this.colAmount ||
      rowStart > rowEnd ||
      colStart > colEnd
    ) {
      throw new Error("Invalid range");
    }

    updateMesh({
      grid: this,
      cell,
      newRowStart: rowStart,
      newColStart: colStart,
      newRowEnd: rowEnd,
      newColEnd: colEnd,
    });

    cell.rowStart = rowStart;
    cell.rowEnd = rowEnd;
    cell.colStart = colStart;
    cell.colEnd = colEnd;
    this.cells[cellIndex] = cell;
    this.drawContent();
  };

  moveCell = ({ cellIndex, movementRows, movementCols }) => {
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

    updateMesh({
      grid: this,
      cell,
      newRowStart,
      newColStart,
      newRowEnd,
      newColEnd,
    });

    cell.rowStart = newRowStart;
    cell.colStart = newColStart;
    cell.rowEnd = newRowEnd;
    cell.colEnd = newColEnd;

    this.cells[cellIndex] = cell;

    this.drawContent();
  };

  addCell = ({ row, col }) => {
    if (row < 0 || col < 0 || col >= this.colAmount || row >= this.rowAmount) {
      throw new Error("Invalid range");
    }

    if (this.mesh[row][col].isUsed) {
      throw new Error("Cell already in use");
    }

    const cell = new Cell({
      rowStart: row,
      rowEnd: row,
      colStart: col,
      colEnd: col,
      gridInstance: this,
    });

    this.mesh[row][col].isUsed = true;

    this.cells.push(cell);
    this.drawContent();
  };

  drawGrid = () => {
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
  };

  drawContent = () => {
    const grid = document.querySelector("#grid");
    if (grid) {
      this.removeEventListeners();
      grid.remove();
    }
    this.drawGrid();

    this.drawCells();
    this.drawEmptyCells();
    this.addCellCreateEventListener();

    this.cells.forEach((cell) => {
      cell.allowDrag();
      cell.allowResize();
    });
  };

  drawEmptyCells = () => {
    this.rows.forEach((row) => {
      this.cols.forEach((col) => {
        if (this.mesh[row.rowIndex][col.colIndex].isUsed) return;
        const grid = document.querySelector("#grid");

        const emptyCellDiv = document.createElement("div");
        emptyCellDiv.className = "empty-cell";
        emptyCellDiv.setAttribute("data-row", row.rowIndex);
        emptyCellDiv.setAttribute("data-col", col.colIndex);
        Object.assign(emptyCellDiv.style, {
          gridRowStart: row.rowIndex + ROW_OFFSET,
          gridRowEnd: row.rowIndex + ROW_OFFSET + 1,
          gridColumnStart: col.colIndex + COL_OFFSET,
          gridColumnEnd: col.colIndex + COL_OFFSET + 1,
        });

        grid.appendChild(emptyCellDiv);
      });
    });
  };

  drawCells = () => {
    this.cells.forEach((cell) => {
      const grid = document.querySelector("#grid");

      const cellDiv = document.createElement("div");
      const closeButton = document.createElement("button");
      closeButton.textContent = "X";

      cellDiv.className = "cell";
      cellDiv.setAttribute("data-row-start", cell.rowStart);
      cellDiv.setAttribute("data-row-end", cell.rowEnd);
      cellDiv.setAttribute("data-col-start", cell.colStart);
      cellDiv.setAttribute("data-col-end", cell.colEnd);
      Object.assign(cellDiv.style, {
        gridRowStart: cell.rowStart + ROW_OFFSET,
        gridRowEnd: cell.rowEnd + ROW_OFFSET + 1,
        gridColumnStart: cell.colStart + COL_OFFSET,
        gridColumnEnd: cell.colEnd + COL_OFFSET + 1,
      });
      grid.appendChild(cellDiv);
      cellDiv.appendChild(closeButton);
    });
  };

  handleEmptyCellClick = (e) => {
    const row = parseInt(e.target.dataset.row, 10);
    const col = parseInt(e.target.dataset.col, 10);
    this.addCell({ row, col });
  };

  addCellCreateEventListener = () => {
    const emptyCells = document.querySelectorAll(".empty-cell");
    emptyCells.forEach((cell) => {
      cell.addEventListener("click", this.handleEmptyCellClick);
    });
  };

  updateEmptyCells = () => {
    const existingEmptyCells = document.querySelectorAll(".empty-cell");
    existingEmptyCells.forEach((cell) => cell.remove());

    this.drawEmptyCells();
    this.addCellCreateEventListener();
  };

  removeEventListeners = () => {
    const emptyCells = document.querySelectorAll(".empty-cell");
    emptyCells.forEach((cell) => {
      cell.removeEventListener("click", this.handleEmptyCellClick);
    });
  };

  destroy() {
    this.removeEventListeners();
    const grid = document.querySelector("#grid");
    if (grid) {
      grid.remove();
    }
  }
}

export default Grid;
