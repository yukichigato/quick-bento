const updateMesh = ({
  grid,
  cell,
  newRowStart,
  newColStart,
  newRowEnd,
  newColEnd,
}) => {
  for (let i = cell.rowStart; i <= cell.rowEnd; i++) {
    for (let j = cell.colStart; j <= cell.colEnd; j++) {
      grid.mesh[i][j].isUsed = false;
    }
  }

  for (let i = newRowStart; i <= newRowEnd; i++) {
    for (let j = newColStart; j <= newColEnd; j++) {
      if (grid.mesh[i][j].isUsed) {
        revertMeshUpdate({
          grid,
          cell,
          newRowStart,
          newColStart,
          newRowEnd,
          newColEnd,
          cellToRestore: { row: i, col: j },
        });
        throw new Error("Target position already occupied");
      }

      grid.mesh[i][j].isUsed = true;
    }
  }
};

const revertMeshUpdate = ({
  grid,
  cell,
  newRowStart,
  newColStart,
  newRowEnd,
  newColEnd,
  cellToRestore = null,
}) => {
  for (let i = cell.rowStart; i <= cell.rowEnd; i++) {
    for (let j = cell.colStart; j <= cell.colEnd; j++) {
      grid.mesh[i][j].isUsed = true;
    }
  }

  for (let i = newRowStart; i <= newRowEnd; i++) {
    for (let j = newColStart; j <= newColEnd; j++) {
      if (i === cellToRestore.row && j === cellToRestore.col) {
        grid.mesh[i][j].isUsed = true;
        return;
      }
      grid.mesh[i][j].isUsed = false;
    }
  }
};

const getClosestGridCell = (element) => {
  const grid = document.querySelector("#grid");
  const children = grid.querySelectorAll(".empty-cell");
  const elemRect = element.getBoundingClientRect();

  let closest = null;
  let closestDistance = Infinity;

  const elemCenter = {
    x: elemRect.left + Math.sqrt(elemRect.width / 4) * 2,
    y: elemRect.top + Math.sqrt(elemRect.height / 4) * 2,
  };

  children.forEach((child) => {
    const rect = child.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const distance = Math.hypot(
      elemCenter.x - center.x,
      elemCenter.y - center.y
    );

    if (distance > Math.max(elemRect.height * 0.7, elemRect.width * 0.7))
      return;

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
};

const getClosestGridCellResize = (element) => {
  const grid = document.querySelector("#grid");
  const children = grid.querySelectorAll(".empty-cell");
  const elemRect = element.getBoundingClientRect();

  let closest = null;
  let closestDistance = Infinity;

  const elemCenter = {
    x: elemRect.right - elemRect.width / 10,
    y: elemRect.bottom - elemRect.height / 10,
  };

  children.forEach((child) => {
    const rect = child.getBoundingClientRect();
    const center = {
      x: rect.right - rect.width / 2,
      y: rect.bottom - rect.height / 2,
    };

    const distance = Math.hypot(
      elemCenter.x - center.x,
      elemCenter.y - center.y
    );

    if (distance > elemRect.width * 0.6 && distance > elemRect.height * 0.6)
      return;

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
};

const temporaryMeshChange = (
  gridInstance,
  rowStart,
  rowEnd,
  colStart,
  colEnd
) => {
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      if (!gridInstance.mesh[row][col].isUsed) {
        return;
      }

      gridInstance.mesh[row][col].isUsed = false;
    }
  }

  gridInstance.updateEmptyCells();
};

const revertMeshChange = (gridInstance, rowStart, rowEnd, colStart, colEnd) => {
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      gridInstance.mesh[row][col].isUsed = true;
    }
  }

  gridInstance.updateEmptyCells();
};

function* numberFactory(start = 0, step = 1) {
  let current = start;
  while (true) {
    yield current;
    current += step;
  }
}

const generateNextIndex = numberFactory();

export {
  updateMesh,
  revertMeshUpdate,
  getClosestGridCell,
  getClosestGridCellResize,
  temporaryMeshChange,
  revertMeshChange,
  generateNextIndex,
};
