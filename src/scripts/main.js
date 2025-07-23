import Grid from "./Grid/Grid.js";

const grid = new Grid({ rowAmount: 3, colAmount: 3, gap: 0.5 });

grid.addCell({ row: 0, col: 0 });
grid.addCell({ row: 1, col: 1 });
grid.addCell({ row: 2, col: 2 });

grid.moveCell({ cellIndex: 0, movementRows: 1, movementCols: 0 });
grid.moveCell({ cellIndex: 0, movementRows: 1, movementCols: 0 });
grid.moveCell({ cellIndex: 0, movementRows: 0, movementCols: 1 });
grid.deformCell({
  cellIndex: 1,
  rowStart: 0,
  rowEnd: 1,
  colStart: 1,
  colEnd: 2,
});
grid.deformCell({
  cellIndex: 0,
  rowStart: 2,
  rowEnd: 2,
  colStart: 0,
  colEnd: 1,
});

document.addEventListener("DOMContentLoaded", () => {
  grid.addCellCreateEventListener();
});
