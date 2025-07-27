import {
  getClosestGridCell,
  getClosestGridCellResize,
  temporaryMeshChange,
  revertMeshChange,
  generateNextIndex,
} from "./utils.js";

let newX = 0;
let newY = 0;
let startX = 0;
let startY = 0;

class Cell {
  constructor({ rowStart, rowEnd, colStart, colEnd, gridInstance }) {
    this.index = generateNextIndex.next().value;
    this.rowStart = rowStart;
    this.rowEnd = rowEnd;
    this.colStart = colStart;
    this.colEnd = colEnd;
    this.gridInstance = gridInstance;
    this.resizing = false;
    this.color = undefined; // Default color
    this.changeColor = this.changeColor.bind(this);
    this.delete = this.delete.bind(this);
  }

  getCell = () => {
    return document.querySelector(
      `[data-row-start="${this.rowStart}"][data-col-start="${this.colStart}"]`
    );
  };

  changeColor = (e) => {
    this.color = e.target.value;
    const cell = this.getCell();
    if (cell) {
      cell.style.backgroundColor = this.color;
    }
  };

  delete = (e) => {
    const cellIndex = this.gridInstance.cells.findIndex(
      (cell) => cell.index === this.index
    );

    if (cellIndex !== -1) {
      this.gridInstance.removeCell({
        cellIndex: cellIndex,
      });
    }

    const contextMenu = document.getElementById("context-menu");
    const colorInput = contextMenu.querySelector("#color-input");
    const deleteCell = contextMenu.querySelector(".context-item:last-child");
    colorInput.removeEventListener("input", this.changeColor);
    deleteCell.removeEventListener("click", this.delete);
    contextMenu.classList.remove("visible");
  };

  allowContextMenu = () => {
    const cell = this.getCell();
    const contextMenu = document.getElementById("context-menu");

    // Remove any existing event listeners to prevent duplicates
    const colorInput = contextMenu.querySelector("#color-input");
    colorInput.removeEventListener("input", this.changeColor);

    const deleteCell = contextMenu.querySelector(".context-item:last-child");
    deleteCell.removeEventListener("click", this.delete);

    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Clean up any existing listeners before adding new ones
      colorInput.removeEventListener("input", this.changeColor);
      deleteCell.removeEventListener("click", this.delete);

      colorInput.value = this.color;
      colorInput.addEventListener("input", this.changeColor);
      deleteCell.addEventListener("click", this.delete);

      const { clientX, clientY } = e;

      contextMenu.style.top = `${clientY}px`;
      contextMenu.style.left = `${clientX}px`;
      contextMenu.classList.add("visible");
    });

    document.addEventListener("click", (e) => {
      if (!contextMenu.contains(e.target)) {
        contextMenu.classList.remove("visible");
      }
    });
  };

  allowResize = () => {
    const cellDiv = this.getCell();
    const resizeArea = document.createElement("div");
    resizeArea.className = "resize-area";
    Object.assign(resizeArea.style, {
      position: "absolute",
      bottom: "0",
      right: "0",
      zIndex: "10",
    });

    resizeArea.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.resizing = true;
      Object.assign(cellDiv.style, {
        cursor: "nwse-resize",
        zIndex: 50,
        opacity: 0.8,
      });

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
              cellIndex: this.gridInstance.cells.findIndex(
                (cell) => cell.index === this.index
              ),
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

        Object.assign(cellDiv.style, {
          cursor: "grab",
          width: `${originalWidth}px`,
          height: `${originalHeight}px`,
          opacity: 1,
        });
        this.resizing = false;
      };

      const rect = cellDiv.getBoundingClientRect();
      const originalWidth = rect.width;
      const originalHeight = rect.height;

      Object.assign(cellDiv.style, {
        position: "fixed",
        cursor: "grabbing",
        zIndex: 50,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        left: `${rect.left}px`,
        top: `${rect.top}px`,
      });

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

        Object.assign(cellDiv.style, {
          left: `${cellDiv.offsetLeft - newX}px`,
          top: `${cellDiv.offsetTop - newY}px`,
        });
      };

      const mouseUp = (e) => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);

        const { row, col } = getClosestGridCell(cellDiv);
        if (row !== null && col !== null) {
          try {
            this.gridInstance.moveCell({
              cellIndex: this.gridInstance.cells.findIndex(
                (cell) => cell.index === this.index
              ),
              movementRows: row - this.rowStart,
              movementCols: col - this.colStart,
            });

            return;
          } catch (error) {
            console.error("Error moving cell:", error.message);
            this.gridInstance.drawContent();
          }
        }

        revertMeshChange(
          this.gridInstance,
          this.rowStart,
          this.rowEnd,
          this.colStart,
          this.colEnd
        );

        Object.assign(cellDiv.style, {
          position: "relative",
          cursor: "grab",
          zIndex: "auto",
          width: "auto",
          height: "auto",
          left: "auto",
          top: "auto",
        });
      };

      const rect = cellDiv.getBoundingClientRect();

      Object.assign(cellDiv.style, {
        position: "fixed",
        cursor: "grabbing",
        zIndex: 50,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        left: `${rect.left}px`,
        top: `${rect.top}px`,
      });

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
