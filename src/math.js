/**
 * Copyright 2022 Kaden Sharpin. Subject to the MIT license.
 */

/**
 * Lowest Common Multiple
 */
function LCM(a, b) {
  return (a * b) / HCF(a, b);
}
/**
 * Highest Common Factor
 */
function HCF(a, b) {
  while (b !== 0) {
    if (isNaN(a) || isNaN(b)) {
      console.log(a, b);
      debugger;
    }

    const remainder = a % b;
    (a = b), (b = remainder);
  }
  return a;
}

function factorial(n) {
  if (n <= 1) return n;

  return n * factorial(n - 1);
}
