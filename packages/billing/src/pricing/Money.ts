import { Prisma } from '@haspataal/db';

export class CurrencyMismatchError extends Error {
  constructor(
    public currencyA: string,
    public currencyB: string,
  ) {
    super(`Currency mismatch: Cannot operate on ${currencyA} and ${currencyB}`);
    this.name = 'CurrencyMismatchError';
  }
}

export class Money {
  public readonly amount: Prisma.Decimal;
  public readonly currency: string;

  constructor(amount: Prisma.Decimal | number | string, currency: string = 'INR') {
    this.amount = new Prisma.Decimal(amount);
    this.currency = currency.toUpperCase();
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount.add(other.amount), this.currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount.sub(other.amount), this.currency);
  }

  public multiply(multiplier: number | Prisma.Decimal): Money {
    return new Money(this.amount.mul(multiplier), this.currency);
  }

  public compare(other: Money): number {
    this.assertSameCurrency(other);
    if (this.amount.lt(other.amount)) return -1;
    if (this.amount.gt(other.amount)) return 1;
    return 0;
  }

  public equals(other: Money): boolean {
    return this.currency === other.currency && this.amount.equals(other.amount);
  }

  public isZero(): boolean {
    return this.amount.isZero();
  }

  public isPositive(): boolean {
    return this.amount.isPositive() && !this.amount.isZero();
  }

  /**
   * Allocates the money into N parts based on the given ratios.
   * Handles rounding errors by adding the remainder to the first allocation.
   */
  public allocate(ratios: number[]): Money[] {
    const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);
    if (totalRatio === 0) {
      throw new Error('Total ratio for allocation cannot be zero.');
    }

    let remainder = this.amount;
    const results = ratios.map((ratio) => {
      const share = this.amount
        .mul(ratio)
        .div(totalRatio)
        .toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
      remainder = remainder.sub(share);
      return new Money(share, this.currency);
    });

    if (!remainder.isZero()) {
      results[0] = new Money(results[0].amount.add(remainder), this.currency);
    }

    return results;
  }

  /**
   * Rounds the amount to the nearest supported decimal places for the currency.
   * Default is 2 decimal places.
   */
  public round(decimalPlaces: number = 2): Money {
    return new Money(
      this.amount.toDecimalPlaces(decimalPlaces, Prisma.Decimal.ROUND_HALF_UP),
      this.currency,
    );
  }

  public toDecimal(): Prisma.Decimal {
    return this.amount;
  }

  public toNumber(): number {
    return this.amount.toNumber();
  }
}
