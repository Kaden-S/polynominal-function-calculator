var NUMBERS = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "nineth",
  "tenth",
];
var X = 0;
var Y = 1;
function getCaretPosition(editableDiv) {
  if (window.getSelection) {
    let sel = window.getSelection();
    if (sel.rangeCount) {
      let range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv)
        return range.endOffset;
    }
  }
  return 0;
}
function atEnd(editableDiv) {
  return editableDiv.innerText.length === getCaretPosition(editableDiv);
}
function atStart(editableDiv) {
  return 0 === getCaretPosition(editableDiv);
}

function moveLeft(td) {
  const row = td.parentElement;
  if (td === row.cells[Y]) {
    row.cells[X]?.focus();
  } else {
    row.previousElementSibling?.cells[Y]?.focus();
  }
}
function moveRight(td) {
  const row = td.parentElement;
  if (td === row.cells[Y]) {
    row.nextElementSibling?.cells[X]?.focus();
  } else {
    row.cells[Y]?.focus();
  }
}
function moveUp(td) {
  const row = td.parentElement;
  if (td === row.cells[Y]) {
    row.previousElementSibling?.cells[Y]?.focus();
  } else {
    row.previousElementSibling?.cells[X]?.focus();
  }
}
function moveDown(td) {
  const row = td.parentElement;
  if (td === row.cells[Y]) {
    row.nextElementSibling?.cells[Y]?.focus();
  } else {
    row.nextElementSibling?.cells[X]?.focus();
  }
}
function createCell(text) {
  const td = document.createElement("td");
  td.contentEditable = true;
  td.innerText = text ?? "";
  td.addEventListener("keydown", keyListener);
  return td;
}
function addRow(row, body) {
  let previousNum = 1 + Number(row.cells[X]?.innerText);
  if (isNaN(previousNum)) previousNum = null;

  const tr = body.insertRow();
  tr.appendChild(createCell(previousNum));
  tr.appendChild(createCell());
  return tr;
}
/** @param {KeyboardEvent} ev */
function keyListener(ev) {
  /** @type {HTMLTableDataCellElement} */
  const td = ev.target;
  /** @type {HTMLTableRowElement} */
  const row = td.parentElement;
  /** @type {HTMLTableSectionElement} */
  const body = row.parentElement;
  switch (ev.key) {
    case "ArrowLeft":
      if (atStart(td)) {
        ev.preventDefault();
        moveLeft(td);
      }
      break;
    case "ArrowRight":
      if (atEnd(td)) {
        ev.preventDefault();
        moveRight(td);
      }
      break;
    case "ArrowUp":
      ev.preventDefault();
      moveUp(td);
      break;
    case "ArrowDown":
      ev.preventDefault();
      moveDown(td);
      break;
    case "Tab":
      if (ev.shiftKey) break;
      if (row === body.lastElementChild && td === row.cells[Y]) {
        ev.preventDefault();
        addRow(row, body)?.cells?.[0]?.focus();
      }
      break;
    case "Enter":
      ev.preventDefault();

      if (ev.shiftKey) {
        moveUp(td);
        break;
      }

      if (row === body.lastElementChild) {
        addRow(row, body);
      }

      moveDown(td);
      break;
    default:
      break;
  }
}
function resetTable() {
  /** @type {HTMLTableElement} */
  const table = document.querySelector("[data-table-of-values]");

  table.tFoot.innerText = "";
  removeExcessCells(table.tHead.rows[0]);
  Array.from(table.tBodies[0]?.rows).forEach(removeExcessCells);
  return table;
}
function removeExcessCells(tr) {
  while (tr.cells.item(2)) tr.cells.item(2).remove();
}
async function calculate() {
  const t = resetTable();
  resetMatrices();
  resetEquation();

  for (let x = 0; x < 10; x++) {
    const diff = addDifference(x);
    if (diff !== false) {
      t.tFoot.innerText = `a = ${diff}/${x + 1}! = ${diff / factorial(x + 1)}`;
      runMatrix(x + 1);
      break;
    }
  }
}
function addDifference(x) {
  /** @type {HTMLTableElement} */
  const table = document.querySelector("[data-table-of-values]");

  const th = table.tHead.rows[0].appendChild(document.createElement("th"));
  th.innerText = NUMBERS[x];
  th.classList.add("math");

  const nums = Array.from(table.tBodies[0].rows)
    .slice(x + 1)
    .map((row) => {
      const td = row.insertCell();
      td.style.transform = `translate(0, -${50 * (x + 1)}%)`;
      return (td.innerText =
        Number(row.cells[x + 1].innerText) -
          Number(row.previousElementSibling?.cells[x + 1].innerText) || 0);
    });
  if (nums.every((n, i, arr) => arr[Math.min(i + 1, arr.length - 1)] === n))
    return nums[0];

  return false;
}
function sup(data) {
  const sup = document.createElement("sup");
  sup.innerText = data;
  return sup;
}
function resetEquation() {
  document.querySelector("[data-equation]").innerText = "";
}
function resetMatrices() {
  document.querySelector("[data-matrices]").innerHTML = "";
}
function resetGraph() {
  desmos?.setExpression?.({ id: "2", type: "table" });
}
/** @param {number} n */
function stringify(n, showSign = true) {
  return (n || 0).toLocaleString("en", {
    maximumFractionDigits: 5,
    signDisplay: showSign ? "auto" : "never",
  });
}
var showingSteps = false;
function toggleSteps(ev) {
  showingSteps = !showingSteps;
  ev.target.innerText = showingSteps ? "Hide Steps" : "Show Steps";
  calculate();
}
function clear() {
  const table = resetTable();
  resetMatrices();
  resetEquation();
  resetGraph();

  table.tBodies[0]?.remove();
  const tr = table.createTBody().insertRow();
  tr.appendChild(createCell());
  tr.appendChild(createCell());
}
function initialiseDesmos() {
  if (typeof Desmos !== "undefined") {
    desmos = new Desmos.Calculator(document.querySelector("[data-graph]"));
    desmos.controller._hideExpressions();
    desmos.controller.updateViews();
  }

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
}
window.initialiseDesmos = initialiseDesmos;
