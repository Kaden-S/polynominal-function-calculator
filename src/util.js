/**
 * Copyright 2022 Kaden Sharpin. Subject to the MIT license.
 */
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
function calculate() {
  const t = resetTable();
  resetMatrices();
  resetEquation();

  for (let x = 0; x < 10; x++) {
    const diff = addDifference(x);
    if (diff !== false) {
      const span = t.tFoot.appendChild(document.createElement("span"));
      span.innerText =
        "expected\n" +
        `a = ${diff}/${x + 1}!\n` +
        `a = ${diff / factorial(x + 1)}`;
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
/**
 * @param {number} degree
 * @returns {Array<Node | string>}
 */
function createBaseEquation(degree) {
  const parts = [];

  parts.push("y = ");
  for (let x = 0; x < degree + 1; x++) {
    const exponent = degree - x;
    const coefficient = String.fromCharCode(97 + x);

    if (exponent !== 0) {
      parts.push(coefficient + "x");

      if (exponent !== 1) parts.push(sup(exponent));

      parts.push(" + ");
    } else parts.push(coefficient);
  }

  return parts;
}
/**
 * @param {number} degree
 * @param {[number, number]} point
 * @returns {Array<Node | string>}
 */
function insertPointIntoEquation(degree, point) {
  const parts = [];
  const [X, Y] = point;

  parts.push(Y + " = ");
  for (let x = 0; x < degree + 1; x++) {
    const exponent = degree - x;
    const coefficient = String.fromCharCode(97 + x);

    if (exponent !== 0) {
      parts.push(`${coefficient}(${X})`);

      if (exponent !== 1) parts.push(sup(exponent));

      parts.push(" + ");
    } else parts.push(coefficient);
  }

  return parts;
}
/**
 * @param {number} degree
 * @param {[number, number]} point
 * @returns {Array<Node | string>}
 */
function solvePointInEquation(degree, point) {
  const parts = [];
  const [X, Y] = point;

  parts.push(Y + " = ");
  for (let x = 0; x < degree + 1; x++) {
    const exponent = degree - x;
    const coefficient = String.fromCharCode(97 + x);
    const value = X ** exponent;

    if (exponent !== 0) {
      parts.push(`${value}${coefficient}`);

      parts.push(" + ");
    } else parts.push(coefficient);
  }

  return parts;
}
/** @param {(Node | string)[]} parts */
function convertEquationToMatrixRow(parts) {
  const row = [];
  const y = parts.shift().replace(" = ", "");

  row.push(
    ...parts
      .filter((el) => el !== " + ")
      .reduce((p, c, i) => {
        if (typeof c === "number" || typeof c === "string") {
          p.push([c]);
        } else {
          p[p.length - 1]?.push(c);
        }
        return p;
      }, []),
    y
  );

  return row;
}
function resetEquation() {
  document.querySelector("[data-equation]").innerText = "";
}
function resetMatrices() {
  document.querySelector("[data-matrices]").innerHTML = "";
}
function resetGraph() {
  Promise.race([
    desmos.then((d) =>
      d?.setExpression?.({
        id: "2",
        type: "table",
        columns: [{ values: [] }],
      })
    ),
    Promise.resolve(),
  ]);
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
function setDesmosEquation(equation) {
  desmos.then((d) =>
    d?.setExpression?.({
      id: "2",
      type: "table",
      columns: [
        {
          latex: "x_{1}",
          hidden: true,
          pointStyle: "POINT",
          lineStyle: "SOLID",
          points: true,
          lines: false,
          dragMode: "NONE",
          values: ["-3", "-2", "-1", "0", "1", "2", "3"],
        },
        {
          latex: equation,
          hidden: false,
          pointStyle: "POINT",
          lineStyle: "SOLID",
          points: true,
          lines: true,
          dragMode: "NONE",
          values: ["", "", "", "", "", "", ""],
        },
      ],
    })
  );
}
function setURLParams(points, steps, equation) {
  // TODO: create a listener for history changes so clicking the back
  //       arrow will go to the previous state
  const title = document.title;
  const params = new URLSearchParams({ points, steps }).toString();

  document.title = equation;
  window.history.pushState(null, null, `?${params}`);
  document.title = title;
}
function initialiseDesmos() {
  if (typeof Desmos !== "undefined") {
    if (!window.resolveDesmos) {
      // Although mostly unnecessary, this should elimate race conditions
      waitUntil(
        () => window.resolveDesmos,
        () => initialiseDesmos()
      );
      return;
    }
    const d = new Desmos.Calculator(document.querySelector("[data-graph]"));
    d.controller._hideExpressions();
    d.controller.updateViews();
    window.resolveDesmos(d);
  }
}
/**
 * @param {() => boolean} predicate
 * @param {() => void} callback
 */
function waitUntil(predicate, callback) {
  if (predicate()) return void callback();

  setTimeout(() => waitUntil(predicate, callback), 10);
}
window.initialiseDesmos = initialiseDesmos;
