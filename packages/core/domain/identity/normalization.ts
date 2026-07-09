import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

export class MobileNormalization {
  private static readonly DEFAULT_COUNTRY: CountryCode = 'IN'; // Assuming India (+91) as default

  /**
   * Normalizes a mobile number to E.164 format.
   * Throws if the number is invalid.
   */
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

  /**
   * Safely attempts to normalize, returning null if invalid rather than throwing.
   */
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
