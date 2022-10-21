var desmos = {};
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
