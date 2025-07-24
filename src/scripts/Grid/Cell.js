let newX = 0,
  newY = 0,
  startX = 0,
  startY = 0;

class Cell {
  constructor({ rowStart, rowEnd, colStart, colEnd }) {
    this.rowStart = rowStart;
    this.rowEnd = rowEnd;
    this.colStart = colStart;
    this.colEnd = colEnd;
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
        cellDiv.style.position = "static";
        cellDiv.style.zIndex = "auto";
        cellDiv.style.width = "auto";
        cellDiv.style.height = "auto";
      };

      const rect = cellDiv.getBoundingClientRect();

      cellDiv.style.position = "fixed";
      cellDiv.style.zIndex = 1000;
      cellDiv.style.width = `${rect.width}px`;
      cellDiv.style.height = `${rect.height}px`;
      cellDiv.style.left = `${rect.left}px`;
      cellDiv.style.top = `${rect.top}px`;

      startX = e.clientX;
      startY = e.clientY;

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
    });
  }
}

export default Cell;
