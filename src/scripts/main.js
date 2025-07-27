import Grid from "./Grid/Grid.js";

const grid = new Grid({ rowAmount: 6, colAmount: 6, gap: 1 });

document.addEventListener("DOMContentLoaded", () => {
  grid.drawContent();
});
