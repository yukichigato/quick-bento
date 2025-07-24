import Grid from "./Grid/Grid.js";

const grid = new Grid({ rowAmount: 4, colAmount: 4, gap: 1 });

document.addEventListener("DOMContentLoaded", () => {
  grid.drawContent();

  grid.addCell({ row: 1, col: 0 });
  grid.addCell({ row: 1, col: 1 });
  grid.addCell({ row: 1, col: 2 });
  grid.deformCell({
    cellIndex: 2,
    rowStart: 1,
    rowEnd: 2,
    colStart: 2,
    colEnd: 3,
  });
});
