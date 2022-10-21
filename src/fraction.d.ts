/**
 * Copyright 2022 Kaden Sharpin. Subject to the MIT license.
 */
declare class Fraction {
  constructor(public numerator = 1, public denominator = 1);
  private lowestTerms(): Fraction;
  multiply(by: number, denominator?: number): Fraction;
  multiply(by: Fraction, denominator?: undefined): Fraction;
  multiply(by: Fraction | number, denominator = 1): Fraction;
  divide(by: number, denominator?: number): Fraction;
  divide(by: Fraction, denominator?: undefined): Fraction;
  divide(by: Fraction | number, denominator = 1): Fraction;
  add(by: number, denominator?: number): Fraction;
  add(by: Fraction, denominator?: undefined): Fraction;
  add(by: Fraction | number, denominator = 1): Fraction;
  subtract(by: number, denominator?: number): Fraction;
  subtract(by: Fraction, denominator?: undefined): Fraction;
  subtract(by: Fraction | number, denominator = 1): Fraction;
  toString(): string;
  toNumber(): number;
  copy(): Fraction;
  abs(): Fraction;
}
