import Cell from "./Cell.js";
import { updateMesh } from "./utils.js";

const ROW_OFFSET = 1;
const COL_OFFSET = 1;

class GridCol {
  constructor({ colIndex, height = 1 }) {
    this.colIndex = colIndex;
    this.height = height; // rem
  }
}

class GridRow {
  constructor({ rowIndex, width = 1 }) {
    this.rowIndex = rowIndex;
    this.width = width; // rem
  }
}

class Grid {
  constructor({ rowAmount, colAmount, gap }) {
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
    this.drawContentTimeout = null; // For debouncing drawContent
    this.mesh = Array.from({ length: rowAmount }, () =>
      Array.from({ length: colAmount }, () => ({ isUsed: false }))
    );
    this.eventCreateNewCell = this.eventCreateNewCell.bind(this);
    this.updateColors = this.updateColors.bind(this);

    this.attachColorListeners();
  }

  attachColorListeners = () => {
    const primaryColorSelector = document.querySelector("#primary-color");
    const secondaryColorSelector = document.querySelector("#secondary-color");
    const accentColorSelector = document.querySelector("#accent-color");
    const gridBackgroundColorSelector = document.querySelector(
      "#grid-background-color"
    );
    const backgroundColorSelector = document.querySelector("#background-color");

    document.documentElement.style.setProperty(
      "--primary-color",
      primaryColorSelector.value || "gray"
    );
    document.documentElement.style.setProperty(
      "--secondary-color",
      secondaryColorSelector.value || "lightgray"
    );
    document.documentElement.style.setProperty(
      "--accent-color",
      accentColorSelector.value || "blue"
    );
    document.documentElement.style.setProperty(
      "--grid-background-color",
      backgroundColorSelector.value || "white"
    );
    document.documentElement.style.setProperty(
      "--background-color",
      gridBackgroundColorSelector.value || "white"
    );

    primaryColorSelector.addEventListener("input", this.updateColors);
    secondaryColorSelector.addEventListener("input", this.updateColors);
    accentColorSelector.addEventListener("input", this.updateColors);
    gridBackgroundColorSelector.addEventListener("input", this.updateColors);
    backgroundColorSelector.addEventListener("input", this.updateColors);
  };

  updateColors = (e) => {
    if (!e || !e.target) return;
    if (e.target.id === "primary-color") {
      document.documentElement.style.setProperty(
        "--primary-color",
        e.target.value
      );
    } else if (e.target.id === "secondary-color") {
      document.documentElement.style.setProperty(
        "--secondary-color",
        e.target.value
      );
    } else if (e.target.id === "accent-color") {
      document.documentElement.style.setProperty(
        "--accent-color",
        e.target.value
      );
    } else if (e.target.id === "grid-background-color") {
      document.documentElement.style.setProperty(
        "--grid-background-color",
        e.target.value
      );
    } else if (e.target.id === "background-color") {
      document.documentElement.style.setProperty(
        "--background-color",
        e.target.value
      );
    }
  };

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

    Object.assign(this.cells[cellIndex], {
      rowStart,
      rowEnd,
      colStart,
      colEnd,
    });
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

    Object.assign(this.cells[cellIndex], {
      rowStart: newRowStart,
      rowEnd: newRowEnd,
      colStart: newColStart,
      colEnd: newColEnd,
    });
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

  removeCell = ({ cellIndex }) => {
    if (cellIndex < 0 || cellIndex >= this.cells.length) {
      throw new Error("Invalid cell index");
    }

    const cell = this.cells[cellIndex];
    for (let i = cell.rowStart; i <= cell.rowEnd; i++) {
      for (let j = cell.colStart; j <= cell.colEnd; j++) {
        this.mesh[i][j].isUsed = false;
      }
    }

    this.cells.splice(cellIndex, 1);
    this.drawContent();
  };

  drawGrid = () => {
    const gridArea = document.querySelector("#gridArea");
    const div = Object.assign(document.createElement("div"), { id: "grid" });
    Object.assign(div.style, {
      display: "grid",
      gridTemplateRows: `repeat(${this.rowAmount}, 1fr)`,
      gridTemplateColumns: `repeat(${this.colAmount}, 1fr)`,
      gap: `${this.gap}rem`,
      padding: `${this.padding}rem`,
    });

    div.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const contextMenu = document.querySelector("#grid-context-menu");
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.classList.add("visible");
    });

    document.addEventListener("click", (e) => {
      const contextMenu = document.querySelector("#grid-context-menu");
      if (!contextMenu.contains(e.target)) {
        contextMenu.classList.remove("visible");
      }
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
    this.allowCreateNew();
    this.cells.forEach((cell) => {
      cell.allowDrag();
      cell.allowResize();
      cell.allowContextMenu();
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
        backgroundColor: cell.color ?? "var(--primary-color, gray)",
      });
      grid.appendChild(cellDiv);
    });
  };

  allowCreateNew = () => {
    const emptyCells = document.querySelectorAll(".empty-cell");
    emptyCells.forEach((cell) => {
      cell.addEventListener("click", this.eventCreateNewCell);
    });
  };

  updateEmptyCells = () => {
    const existingEmptyCells = document.querySelectorAll(".empty-cell");
    existingEmptyCells.forEach((cell) => cell.remove());

    this.drawEmptyCells();
    this.allowCreateNew();
  };

  eventCreateNewCell = (e) => {
    const row = parseInt(e.target.dataset.row, 10);
    const col = parseInt(e.target.dataset.col, 10);
    this.addCell({ row, col });
  };

  removeEventListeners = () => {
    const emptyCells = document.querySelectorAll(".empty-cell");
    emptyCells.forEach((cell) => {
      cell.removeEventListener("click", this.eventCreateNewCell);
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
