import Grid from "./Grid/Grid.js";

const grid = new Grid({ rowAmount: 4, colAmount: 4, gap: 1 });

document.addEventListener("DOMContentLoaded", () => {
  grid.drawContent();
});
