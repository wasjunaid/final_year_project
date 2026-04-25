import { 
  parsePhoneNumberWithError, 
  getCountryCallingCode,
  type CountryCode  // "IN", "PK", etc.
} from 'libphonenumber-js';
import { 
  COUNTRY_CODES,    // Array of { code: '+92', country: 'Pakistan', flag: '🇵🇰' }
  type CountryCodeValue // '+92', '+1', etc.
 } from '../constants/countryCode';

// Custom validation error class
export class PhoneValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhoneValidationError';
  }
}

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedNumber?: string;
  fullNumber?: string;
  nationalFormat?: string;
  internationalFormat?: string;
}

export interface PhoneNumberInfo {
  countryCode: CountryCodeValue;
  phoneNumber: string;
  country: string;
  flag: string;
  fullNumber: string;
  formatted: string;
  nationalFormat: string;
  internationalFormat: string;
  type?: string; // 'MOBILE', 'FIXED_LINE', etc.
}

/**
 * Convert country code (+92) to country ISO code (PK)
 */
const getCountryISOFromCode = (countryCode: CountryCodeValue): CountryCode | undefined => {
  const mapping: Record<string, CountryCode> = {
    '+1': 'US',
    '+92': 'PK',
    '+44': 'GB',
    '+91': 'IN',
    '+86': 'CN',
    '+61': 'AU',
    '+49': 'DE',
    '+33': 'FR',
    '+81': 'JP',
    '+82': 'KR',
    '+55': 'BR',
    '+7': 'RU',
    '+966': 'SA',
    '+971': 'AE',
    '+90': 'TR',
    '+20': 'EG',
    '+880': 'BD',
  };
  return mapping[countryCode];
};

/**
 * Convert country ISO code (PK) to country code (+92)
 */
export const getCountryCodeFromISO = (countryISO: CountryCode): CountryCodeValue | undefined => {
  try {
    const code = `+${getCountryCallingCode(countryISO)}`;
    return code as CountryCodeValue;
  } catch {
    return undefined;
  }
};

/**
 * Normalizes phone number input by removing common formatting characters
 * and handling special cases like leading zeros
 */
const normalizePhoneInput = (phoneNumber: string, countryCode: CountryCodeValue): string => {
  // Remove all spaces, hyphens, parentheses, and dots
  let normalized = phoneNumber.replace(/[\s\-().]/g, '');
  
  // If it starts with the country code, remove it (we'll add it back)
  const countryCodeDigits = countryCode.replace('+', '');
  if (normalized.startsWith(countryCodeDigits)) {
    normalized = normalized.slice(countryCodeDigits.length);
  }
  
  // If it starts with '+', remove it
  if (normalized.startsWith('+')) {
    normalized = normalized.replace('+', '');
    // Try to remove country code again
    if (normalized.startsWith(countryCodeDigits)) {
      normalized = normalized.slice(countryCodeDigits.length);
    }
  }
  
  // Handle leading zero (common in many countries like Pakistan, UK, etc.)
  // For Pakistan: 03145436369 -> 3145436369
  // For UK: 07911123456 -> 7911123456
  if (normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }
  
  return normalized;
};

/**
 * Phone number validator using libphonenumber-js
 */
export class PhoneNumberValidator {
  /**
   * Validates country code exists in our list
   */
  static validateCountryCode(code: string): void {
    if (!code) {
      throw new PhoneValidationError('Country code is required');
    }

    if (!code.startsWith('+')) {
      throw new PhoneValidationError('Country code must start with +');
    }

    const validCode = COUNTRY_CODES.find(c => c.code === code);
    if (!validCode) {
      throw new PhoneValidationError(`Invalid country code: ${code}`);
    }
  }

  /**
   * Validates phone number using libphonenumber-js
   */
  static validatePhoneNumber(phoneNumber: string, countryCode: CountryCodeValue): void {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new PhoneValidationError('Phone number is required');
    }

    const countryISO = getCountryISOFromCode(countryCode);
    if (!countryISO) {
      throw new PhoneValidationError(`Unsupported country code: ${countryCode}`);
    }

    // Normalize the input
    const normalized = normalizePhoneInput(phoneNumber, countryCode);

    // Try to parse the phone number
    try {
      const parsed = parsePhoneNumberWithError(normalized, countryISO);
      
      if (!parsed.isValid()) {
        throw new PhoneValidationError(
          `Invalid phone number format for ${countryCode}`
        );
      }
    } catch (error) {
      if (error instanceof PhoneValidationError) {
        throw error;
      }
      throw new PhoneValidationError(
        `Invalid phone number format for ${countryCode}`
      );
    }
  }

  /**
   * Validates complete phone (country code + number)
   */
  static validateComplete(phoneNumber: string, countryCode: CountryCodeValue): void {
    this.validateCountryCode(countryCode);
    this.validatePhoneNumber(phoneNumber, countryCode);
  }

  /**
   * Safe validation that returns result object instead of throwing
   */
  static validate(phoneNumber: string, countryCode: CountryCodeValue): PhoneValidationResult {
    try {
      const countryISO = getCountryISOFromCode(countryCode);
      if (!countryISO) {
        return {
          isValid: false,
          error: `Unsupported country code: ${countryCode}`,
        };
      }

      this.validateComplete(phoneNumber, countryCode);
      
      // Normalize and parse
      const normalized = normalizePhoneInput(phoneNumber, countryCode);
      const parsed = parsePhoneNumberWithError(normalized, countryISO);
      
      return {
        isValid: true,
        formattedNumber: parsed.nationalNumber,
        fullNumber: parsed.number,
        nationalFormat: parsed.formatNational(),
        internationalFormat: parsed.formatInternational(),
      };
    } catch (error) {
      if (error instanceof PhoneValidationError) {
        return {
          isValid: false,
          error: error.message,
        };
      }
      return {
        isValid: false,
        error: 'Invalid phone number',
      };
    }
  }

  /**
   * Gets complete phone number information
   */
  static getPhoneInfo(phoneNumber: string, countryCode: CountryCodeValue): PhoneNumberInfo | null {
    const countryData = COUNTRY_CODES.find(c => c.code === countryCode);
    if (!countryData) return null;

    const validation = this.validate(phoneNumber, countryCode);
    if (!validation.isValid) return null;

    const countryISO = getCountryISOFromCode(countryCode);
    if (!countryISO) return null;

    try {
      const normalized = normalizePhoneInput(phoneNumber, countryCode);
      const parsed = parsePhoneNumberWithError(normalized, countryISO);
      
      return {
        countryCode,
        phoneNumber: validation.formattedNumber!,
        country: countryData.country,
        flag: countryData.flag,
        fullNumber: validation.fullNumber!,
        formatted: validation.internationalFormat!,
        nationalFormat: validation.nationalFormat!,
        internationalFormat: validation.internationalFormat!,
        type: parsed.getType(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Formats phone number for display (international format)
   */
  static formatForDisplay(phoneNumber: string, countryCode: CountryCodeValue): string {
    const countryISO = getCountryISOFromCode(countryCode);
    if (!countryISO) return phoneNumber;

    try {
      const normalized = normalizePhoneInput(phoneNumber, countryCode);
      const parsed = parsePhoneNumberWithError(normalized, countryISO);
      return parsed.formatInternational();
    } catch {
      return phoneNumber;
    }
  }

  /**
   * Formats phone number in national format (without country code)
   */
  static formatNational(phoneNumber: string, countryCode: CountryCodeValue): string {
    const countryISO = getCountryISOFromCode(countryCode);
    if (!countryISO) return phoneNumber;

    try {
      const normalized = normalizePhoneInput(phoneNumber, countryCode);
      const parsed = parsePhoneNumberWithError(normalized, countryISO);
      return parsed.formatNational();
    } catch {
      return phoneNumber;
    }
  }

  /**
   * Parses a full phone number (with country code) into parts
   */
  static parsePhoneNumber(fullNumber: string): { countryCode: CountryCodeValue; phoneNumber: string } | null {
    try {
      const parsed = parsePhoneNumberWithError(fullNumber);
      
      if (!parsed.isValid()) {
        return null;
      }

      const countryCode = `+${parsed.countryCallingCode}` as CountryCodeValue;
      
      return {
        countryCode,
        phoneNumber: parsed.nationalNumber,
      };
    } catch {
      return null;
    }
  }

  /**
   * Gets the country information from a country code
   */
  static getCountryInfo(countryCode: CountryCodeValue) {
    return COUNTRY_CODES.find(c => c.code === countryCode);
  }

  /**
   * Checks if a country code is valid
   */
  static isValidCountryCode(code: string): code is CountryCodeValue {
    return COUNTRY_CODES.some(c => c.code === code);
  }

  /**
   * Gets all available country codes
   */
  static getAllCountryCodes() {
    return COUNTRY_CODES;
  }

  /**
   * Checks if a phone number is a mobile number
   */
  static isMobile(phoneNumber: string, countryCode: CountryCodeValue): boolean {
    const countryISO = getCountryISOFromCode(countryCode);
    if (!countryISO) return false;

    try {
      const normalized = normalizePhoneInput(phoneNumber, countryCode);
      const parsed = parsePhoneNumberWithError(normalized, countryISO);
      return parsed.getType() === 'MOBILE';
    } catch {
      return false;
    }
  }

  /**
   * Gets the phone number type (MOBILE, FIXED_LINE, etc.)
   */
  static getPhoneType(phoneNumber: string, countryCode: CountryCodeValue): string | undefined {
    const countryISO = getCountryISOFromCode(countryCode);
    if (!countryISO) return undefined;

    try {
      const normalized = normalizePhoneInput(phoneNumber, countryCode);
      const parsed = parsePhoneNumberWithError(normalized, countryISO);
      return parsed.getType();
    } catch {
      return undefined;
    }
  }
}

// Export convenience functions
export const validatePhoneNumber = (phoneNumber: string, countryCode: CountryCodeValue): PhoneValidationResult => {
  return PhoneNumberValidator.validate(phoneNumber, countryCode);
};

export const getPhoneInfo = (phoneNumber: string, countryCode: CountryCodeValue): PhoneNumberInfo | null => {
  return PhoneNumberValidator.getPhoneInfo(phoneNumber, countryCode);
};

export const formatPhoneForDisplay = (phoneNumber: string, countryCode: CountryCodeValue): string => {
  return PhoneNumberValidator.formatForDisplay(phoneNumber, countryCode);
};

export const formatPhoneNational = (phoneNumber: string, countryCode: CountryCodeValue): string => {
  return PhoneNumberValidator.formatNational(phoneNumber, countryCode);
};

export const parsePhoneNumberString = (fullNumber: string): { countryCode: CountryCodeValue; phoneNumber: string } | null => {
  return PhoneNumberValidator.parsePhoneNumber(fullNumber);
};

export const isValidPhoneNumber = (phoneNumber: string, countryCode: CountryCodeValue): boolean => {
  return PhoneNumberValidator.validate(phoneNumber, countryCode).isValid;
};

export const isMobileNumber = (phoneNumber: string, countryCode: CountryCodeValue): boolean => {
  return PhoneNumberValidator.isMobile(phoneNumber, countryCode);
};