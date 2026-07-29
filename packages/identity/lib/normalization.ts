import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

export class MobileNormalization {
  private static readonly DEFAULT_COUNTRY: CountryCode = 'IN';

  public static normalize(
    rawMobile: string,
    defaultCountry: CountryCode = this.DEFAULT_COUNTRY,
  ): string {
    const phoneNumber = parsePhoneNumberFromString(rawMobile, defaultCountry);

    if (!phoneNumber) {
      throw new Error('Invalid mobile number format. Number could not be parsed.');
    }

    if (!phoneNumber.isValid()) {
      throw new Error('Invalid mobile number according to E.164 specifications.');
    }

    return phoneNumber.format('E.164');
  }

  public static tryNormalize(
    rawMobile: string,
    defaultCountry: CountryCode = this.DEFAULT_COUNTRY,
  ): string | null {
    try {
      return this.normalize(rawMobile, defaultCountry);
    } catch {
      return null;
    }
  }
}