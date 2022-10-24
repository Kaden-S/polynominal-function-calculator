/**
 * Copyright 2022 Kaden Sharpin. Subject to the MIT license.
 */
(() => {
  class Fraction {
    constructor(numerator = 1, denominator = 1) {
      this.numerator = numerator;
      this.denominator = denominator;
      this.lowestTerms();
    }
    /**
     * @returns {Fraction}
     */
    lowestTerms() {
      const hcf = HCF(this.numerator, this.denominator);
      this.numerator /= hcf;
      this.denominator /= hcf;
      if (this.denominator < 0) {
        this.numerator *= -1;
        this.denominator *= -1;
      }
      return this;
    }
    /**
     * @param {Fraction | number} by
     * @param {number} denominator
     * @returns {Fraction}
     */
    multiply(by, denominator = 1) {
      const numerator = by?.numerator ?? by;
      denominator = by?.denominator ?? denominator;

      this.numerator *= numerator;
      this.denominator *= denominator;

      this.lowestTerms();
      return this;
    }
    /**
     * @param {Fraction | number} by
     * @param {number} denominator
     * @returns {Fraction}
     */
    divide(by, denominator = 1) {
      const numerator = by?.numerator ?? by;
      denominator = by?.denominator ?? denominator;

      this.numerator *= denominator;
      this.denominator *= numerator;

      this.lowestTerms();
      return this;
    }
    /**
     * @param {Fraction | number} by
     * @param {number} denominator
     * @returns {Fraction}
     */
    add(by, denominator = 1) {
      const numerator1 = by?.numerator ?? by;
      const denominator1 = by?.denominator ?? denominator;
      const numerator2 = this.numerator;
      const denominator2 = this.denominator;

      const lcm = LCM(denominator1, denominator2);
      const factor1 = lcm / denominator1;
      const factor2 = lcm / denominator2;

      this.numerator = numerator1 * factor1 + numerator2 * factor2;
      this.denominator = lcm;

      this.lowestTerms();
      return this;
    }
    /**
     * @param {Fraction | number} by
     * @param {number} denominator
     * @returns {Fraction}
     */
    subtract(by, denominator = 1) {
      const numerator1 = this.numerator;
      const denominator1 = this.denominator;
      const numerator2 = by?.numerator ?? by;
      const denominator2 = by?.denominator ?? denominator;

      const lcm = LCM(denominator1, denominator2);
      const factor1 = lcm / denominator1;
      const factor2 = lcm / denominator2;

      this.numerator = numerator1 * factor1 - numerator2 * factor2;
      this.denominator = lcm;

      this.lowestTerms();
      return this;
    }
    toString() {
      if (this.denominator === 1) return `${this.numerator}`;
      return `${this.numerator}/${this.denominator}`;
    }
    toNumber() {
      return this.numerator / this.denominator;
    }
    copy() {
      return new Fraction(this.numerator, this.denominator);
    }
    abs() {
      this.numerator = Math.abs(this.numerator);
      return this;
    }
    inverse() {
      const n = this.numerator;
      this.numerator = this.denominator;
      this.denominator = n;

      return this;
    }
  }
  window.Fraction = Fraction;
})();
