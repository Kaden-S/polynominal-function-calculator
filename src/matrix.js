/**
 * Copyright 2022 Kaden Sharpin. Subject to the MIT license.
 */
function runMatrix(degree) {
  const body = document.querySelector("[data-table-of-values] > tbody");
  const points = Array.from(body?.rows).map((el) => [
    Number(el.cells[X].innerText),
    Number(el.cells[Y].innerText),
  ]);
  if (points.length > 2) {
    matrix(degree, points);
  } else {
    clear();
  }
}
function matrix(degree, points) {
  const showSteps = showingSteps;
  const matrix = createMatrix(degree, points);
  const targetLength = degree + 1;

  if (matrix.length < targetLength) {
    alert("Add more points");
    return null;
  }

  while (matrix.length !== targetLength) {
    if (matrix.length % 2 === 0) {
      matrix.pop();
    } else {
      matrix.shift();
    }
  }

  if (showSteps) addPointsMatrix(degree, points);
  addMatrix(matrix, showSteps ? "Remove variable letters and excess rows" : "");
  let solved = solveMatrix(matrix, showSteps);
  if (showSteps) {
    solved.forEach(({ matrix, message }) => addMatrix(matrix, message));
    solved = solved[solved.length - 1].matrix;
  } else {
    addMatrix(solved);
  }

  const output = document.querySelector("[data-equation]");
  output.innerText = "f(x) = ";
  for (let x = 0; x < solved.length; x++) {
    let coefficient = stringify(solved[x][solved[x].length - 1]);

    const num = Number(coefficient);
    if (num === 0) continue;
    if (num === 1) coefficient = "";
    if (x > 0) {
      if (num < 0) {
        coefficient = coefficient.slice(1);
        coefficient = ` - ${coefficient}`;
      } else {
        coefficient = ` + ${coefficient}`;
      }
    }

    const exponent = degree - x;
    if (exponent >= 1) {
      coefficient += "x";
    }

    output.append(coefficient);

    if (exponent > 1) {
      output.append(sup(exponent));
    }
  }

  const equation = output.innerText
    .slice(6)
    .replace(/x/g, "x_{1}")
    .replace(/x_\{1\}(\d+)/g, "x_{1}^{$1}");
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
  const url = new URL(window.location);
  url.searchParams.set("points", JSON.stringify(points));
  url.searchParams.set("steps", showingSteps);
  window.history.pushState(
    null,
    output.innerText.slice(7).replace(/x(\d+)/g, "x^$1"),
    url.toString()
  );
}
/**
 * @param {number} degree
 * @param {[x: number, y: number][]} points
 */
function createMatrix(degree, points) {
  const matrix = [];
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    const row = [];

    if (x === 0) continue;

    for (let i1 = degree; i1 >= 0; i1--) {
      row.push(new Fraction(x ** i1));
    }
    row.push(new Fraction(y));
    matrix.push(row);
  }
  return matrix;
}
/** @param {Fraction[][]} matrix */
function solveMatrix(matrix, showSteps) {
  const matrices = [];
  for (let x = 0; x < matrix.length; x++) {
    const row = matrix[x];
    /* This divides the equation to set the number at [x][x] to 1 */
    let a = row[x].copy();
    for (let z = 0; z < row.length; z++) row[z].divide(a);
    if (showSteps) {
      matrices.push({
        message: `R${x + 1} = R${x + 1} / ${a}`,
        matrix: Array.from(matrix, (el) => Array.from(el, (f) => `${f}`)),
      });
    }

    for (let y = 0; y < matrix.length; y++) {
      if (y === x) continue;

      const rowToChange = matrix[y];
      const a = rowToChange[x].copy();
      /* This sets the other rows in column x to 0 */
      for (let z = x; z < row.length; z++)
        rowToChange[z].subtract(row[z].copy().multiply(a));

      if (showSteps) {
        let sign = "-";
        if (a.toNumber() < 0) sign = "+";
        let coefficient = "";
        if (Math.abs(a.toNumber()) !== 1) coefficient = ` ${a.abs()} *`;
        matrices.push({
          message: `R${y + 1} = R${y + 1} ${sign}${coefficient} R${x + 1}`,
          matrix: Array.from(matrix, (el) => Array.from(el, (f) => `${f}`)),
        });
      }
    }
  }
  return showSteps ? matrices : matrix;
}
function addPointsMatrix(degree, points) {
  const wrapper = document.querySelector("[data-matrices]");
  const startEquation = wrapper.appendChild(document.createElement("h2"));

  startEquation.append(...createBaseEquation(degree));

  const matrix1 = points.map((point) =>
    convertEquationToMatrixRow(insertPointIntoEquation(degree, point))
  );
  addMatrix(matrix1, "Sub points into the equation");

  const matrix2 = points.map((point) =>
    convertEquationToMatrixRow(solvePointInEquation(degree, point))
  );
  addMatrix(matrix2, "Simplify exponents");
}
/** @param {(Fraction | Array<string | Node>)[][]} matrix */
function addMatrix(matrix, message) {
  const width = matrix[0].length;
  const height = matrix.length;

  const table = document.createElement("table");
  const head = table.createTHead();
  const body = table.createTBody();
  const header = head.insertRow();
  if (message) table.createCaption().innerText = message;

  for (let x = 0; x < width; x++) {
    const th = header.appendChild(document.createElement("th"));
    th.classList.add("math");
    th.innerText = String.fromCharCode(97 + x);
    if (x === width - 1) {
      th.innerText = "y";
    }
  }

  for (let x = 0; x < matrix.length; x++) {
    const row = matrix[x];
    const tr = body.insertRow();
    for (let y = 0; y < row.length; y++) {
      const value = row[y];
      const td = tr.insertCell();
      if (Array.isArray(value)) {
        td.append(...value);
      } else {
        td.innerText = value;
      }
    }
  }

  document.querySelector("[data-matrices]").appendChild(table);
}
function loadPoints(points) {
  const table = document.querySelector("[data-table-of-values] > tbody");

  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];

    table.rows[i].cells[0].innerText = x;
    table.rows[i].cells[1].innerText = y;
    if (i < points.length - 1)
      table.rows[i].cells[1].dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab" })
      );
  }
}
function loadExample() {
  const points = [
    ["-5", "5870"],
    ["-4", "1852"],
    ["-3", "402"],
    ["-2", "38"],
    ["-1", "-2"],
    ["0", "0"],
    ["1", "2"],
    ["2", "-38"],
    ["3", "-402"],
    ["4", "-1852"],
  ];

  loadPoints(points);
}
