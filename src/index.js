/**
 * Copyright 2022 Kaden Sharpin. Subject to the MIT license.
 */
var resolveDesmos;
var desmos = new Promise(s => resolveDesmos = s);
const tr = document.querySelector("[data-table-of-values] > tbody").insertRow();
tr.appendChild(createCell());
tr.appendChild(createCell());

const calcButton = document.querySelector(
  "[data-table-of-values-button=calculate]"
);
calcButton.addEventListener("click", calculate);
const exampleButton = document.querySelector(
  "[data-table-of-values-button=example]"
);
exampleButton.addEventListener("click", loadExample);
const stepsButton = document.querySelector(
  "[data-table-of-values-button=show-steps]"
);
stepsButton.addEventListener("click", toggleSteps);
const clearButton = document.querySelector(
  "[data-table-of-values-button=clear]"
);
clearButton.addEventListener("click", clear);

const params = new URLSearchParams(window.location.search.slice(1));
try {
  if (Boolean(JSON.parse(params.get("steps"))) ?? false) {
    toggleSteps({
      target: document.querySelector(
        "[data-table-of-values-button=show-steps]"
      ),
    });
  }
} catch (_err) {}
try {
  const points = JSON.parse(params.get("points"));
  if (Array.isArray(points) && points.length > 0) {
    loadPoints(points);
    calculate();
  }
} catch (_err) {}