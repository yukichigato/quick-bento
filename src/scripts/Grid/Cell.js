let newX = 0;
let newY = 0;
let startX = 0;
let startY = 0;

function getClosestGridCell(element) {
  const grid = document.querySelector("#grid");
  const children = grid.querySelectorAll(".empty-cell");
  const elemRect = element.getBoundingClientRect();

  let closest = null;
  let closestDistance = Infinity;

  const elemUpperLeftCenter = {
    x: elemRect.left + elemRect.width / 4,
    y: elemRect.top + elemRect.height / 4,
  };

  children.forEach((child) => {
    const rect = child.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const distance = Math.hypot(
      elemUpperLeftCenter.x - center.x,
      elemUpperLeftCenter.y - center.y
    );

    if (distance > elemRect.width) return;

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = child;
    }
  });

  if (!closest) return { row: null, col: null };

  return {
    row: parseInt(closest.dataset.row, 10),
    col: parseInt(closest.dataset.col, 10),
  };
}

function temporaryMeshChange(gridInstance, rowStart, rowEnd, colStart, colEnd) {
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      if (!gridInstance.mesh[row][col].isUsed) {
        return;
      }

      gridInstance.mesh[row][col].isUsed = false;
    }
  }

  // Update only the empty cells to show visual feedback without interrupting drag
  gridInstance.updateEmptyCells();
}

function revertMeshChange(gridInstance, rowStart, rowEnd, colStart, colEnd) {
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      gridInstance.mesh[row][col].isUsed = true;
    }
  }

  // Update only the empty cells to show visual feedback
  gridInstance.updateEmptyCells();
}

class Cell {
  constructor({ rowStart, rowEnd, colStart, colEnd, gridInstance }) {
    this.rowStart = rowStart;
    this.rowEnd = rowEnd;
    this.colStart = colStart;
    this.colEnd = colEnd;
    this.gridInstance = gridInstance;
  }

  allowDrag() {
    const cellDiv = document.querySelector(
      `[data-row-start="${this.rowStart}"][data-col-start="${this.colStart}"]`
    );

    cellDiv.addEventListener("mousedown", (e) => {
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

        cellDiv.style.position = "static";
        cellDiv.style.cursor = "grab";
        cellDiv.style.zIndex = "auto";
        cellDiv.style.width = "auto";
        cellDiv.style.height = "auto";
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
  }
}

export default Cell;
