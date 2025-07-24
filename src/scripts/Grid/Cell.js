import {
  getClosestGridCell,
  getClosestGridCellResize,
  temporaryMeshChange,
  revertMeshChange,
} from "./utils.js";

let newX = 0;
let newY = 0;
let startX = 0;
let startY = 0;

class Cell {
  constructor({ rowStart, rowEnd, colStart, colEnd, gridInstance }) {
    this.rowStart = rowStart;
    this.rowEnd = rowEnd;
    this.colStart = colStart;
    this.colEnd = colEnd;
    this.gridInstance = gridInstance;
    this.resizing = false;
  }

  getCell = () => {
    return document.querySelector(
      `[data-row-start="${this.rowStart}"][data-col-start="${this.colStart}"]`
    );
  };

  allowResize = () => {
    const cellDiv = this.getCell();
    const resizeArea = document.createElement("div");
    resizeArea.className = "resize-area";
    Object.assign(resizeArea.style, {
      position: "absolute",
      bottom: "0",
      right: "0",
      width: "20%",
      height: "20%",
      cursor: "nwse-resize",
      // backgroundColor: "red",
      zIndex: "10",
    });

    resizeArea.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.resizing = true;
      cellDiv.style.cursor = "nwse-resize";
      cellDiv.style.zIndex = 50;
      cellDiv.style.opacity = 0.8;

      const mouseMove = (e) => {
        const rect = cellDiv.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        const newHeight = e.clientY - rect.top;

        cellDiv.style.width = `${newWidth}px`;
        cellDiv.style.height = `${newHeight}px`;
      };

      const mouseUp = (e) => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);

        const { row, col } = getClosestGridCellResize(cellDiv);

        if (row !== null && col !== null) {
          try {
            this.gridInstance.deformCell({
              cellIndex: this.gridInstance.cells.indexOf(this),
              rowStart: this.rowStart,
              rowEnd: row,
              colStart: this.colStart,
              colEnd: col,
            });

            this.resizing = false;
            return;
          } catch (error) {
            console.error("Error moving cell:", error.message);
          }
        }

        revertMeshChange(
          this.gridInstance,
          this.rowStart,
          this.rowEnd,
          this.colStart,
          this.colEnd
        );

        cellDiv.style.cursor = "grab";
        cellDiv.style.width = `${originalWidth}px`;
        cellDiv.style.height = `${originalHeight}px`;
        cellDiv.style.opacity = 1;
        this.resizing = false;
      };

      const rect = cellDiv.getBoundingClientRect();

      const originalWidth = rect.width;
      const originalHeight = rect.height;

      cellDiv.style.position = "fixed";
      cellDiv.style.cursor = "grabbing";
      cellDiv.style.zIndex = 50;
      cellDiv.style.width = `${rect.width}px`;
      cellDiv.style.height = `${rect.height}px`;
      cellDiv.style.left = `${rect.left}px`;
      cellDiv.style.top = `${rect.top}px`;

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);

      temporaryMeshChange(
        this.gridInstance,
        this.rowStart,
        this.rowEnd,
        this.colStart,
        this.colEnd
      );
    });

    cellDiv.appendChild(resizeArea);
  };

  allowDrag = () => {
    const cellDiv = this.getCell();

    cellDiv.addEventListener("mousedown", (e) => {
      if (this.resizing) return;
      const mouseMove = (e) => {
        newX = startX - e.clientX;
        newY = startY - e.clientY;

        startX = e.clientX;
        startY = e.clientY;

        cellDiv.style.left = `${cellDiv.offsetLeft - newX}px`;
        cellDiv.style.top = `${cellDiv.offsetTop - newY}px`;
      };

      const mouseUp = (e) => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);

        const { row, col } = getClosestGridCell(cellDiv);

        if (row !== null && col !== null) {
          try {
            this.gridInstance.moveCell({
              cellIndex: this.gridInstance.cells.indexOf(this),
              movementRows: row - this.rowStart,
              movementCols: col - this.colStart,
            });

            return;
          } catch (error) {
            console.error("Error moving cell:", error.message);
          }
        }

        revertMeshChange(
          this.gridInstance,
          this.rowStart,
          this.rowEnd,
          this.colStart,
          this.colEnd
        );

        cellDiv.style.position = "relative";
        cellDiv.style.cursor = "grab";
        cellDiv.style.zIndex = "auto";
        cellDiv.style.width = "auto";
        cellDiv.style.height = "auto";
        cellDiv.style.left = "auto";
        cellDiv.style.top = "auto";
      };

      const rect = cellDiv.getBoundingClientRect();

      cellDiv.style.position = "fixed";
      cellDiv.style.cursor = "grabbing";
      cellDiv.style.zIndex = 50;
      cellDiv.style.width = `${rect.width}px`;
      cellDiv.style.height = `${rect.height}px`;
      cellDiv.style.left = `${rect.left}px`;
      cellDiv.style.top = `${rect.top}px`;

      startX = e.clientX;
      startY = e.clientY;

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);

      temporaryMeshChange(
        this.gridInstance,
        this.rowStart,
        this.rowEnd,
        this.colStart,
        this.colEnd
      );
    });
  };
}

export default Cell;
