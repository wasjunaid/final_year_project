import { ROLES, type UserRole } from "../constants/profile";

// Custom validation error class
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Common validation utilities
export const validators = {
  // Validate email format
  email(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  },

  // Validate password strength
  password(password: string): void {
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
  },

  // Validate user role
  role(role: UserRole): void {
    const validRoles = Object.values(ROLES);
    if (!role || !validRoles.includes(role)) {
      throw new ValidationError('Invalid role');
    }
  },

  // Validate token exists and is not empty
  token(token: string): void {
    if (!token || token.trim().length === 0) {
      throw new ValidationError('Token is required');
    }
  },

  // Validate required field
  required(value: unknown, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`${fieldName} is required`);
    }
  },

  // Validate minimum length
  minLength(value: string, min: number, fieldName: string): void {
    if (value.length < min) {
      throw new ValidationError(`${fieldName} must be at least ${min} characters`);
    }
  },

  // Validate maximum length
  maxLength(value: string, max: number, fieldName: string): void {
    if (value.length > max) {
      throw new ValidationError(`${fieldName} must not exceed ${max} characters`);
    }
  },

  // Validate date is in the future
  futureDate(date: Date, fieldName: string = 'Date'): void {
    if (date < new Date()) {
      throw new ValidationError(`${fieldName} must be in the future`);
    }
  },

  // Validate date is in the past
  pastDate(date: Date, fieldName: string = 'Date'): void {
    if (date > new Date()) {
      throw new ValidationError(`${fieldName} must be in the past`);
    }
  },

  // Validate number is within range
  numberRange(value: number, min: number, max: number, fieldName: string): void {
    if (value < min || value > max) {
      throw new ValidationError(`${fieldName} must be between ${min} and ${max}`);
    }
  },

  // Validate string matches pattern
  pattern(value: string, pattern: RegExp, fieldName: string, errorMessage?: string): void {
    if (!pattern.test(value)) {
      throw new ValidationError(errorMessage || `${fieldName} has invalid format`);
    }
  },

  // Validate CNIC (Pakistani National ID)
  cnic(cnic: string): void {
    // CNIC should be 13 digits, optionally with hyphens: 12345-1234567-1
    const cnicRegex = /^(\d{5}-?\d{7}-?\d{1})$/;
    const cleanCnic = cnic.replace(/-/g, '');
    
    if (!cnicRegex.test(cnic) || cleanCnic.length !== 13) {
      throw new ValidationError('CNIC must be 13 digits (format: 12345-1234567-1 or 1234512345671)');
    }
  },

  // Validate phone number format
  phoneNumber(countryCode: string, number: string): void {
    if (!countryCode || !number) {
      throw new ValidationError('Both country code and phone number are required');
    }

    // Remove any formatting characters
    const cleanNumber = number.replace(/[\s\-().]/g, '');
    
    // Check if it's all digits
    if (!/^\d+$/.test(cleanNumber)) {
      throw new ValidationError('Phone number must contain only digits');
    }

    // Check length (should be between 7 and 15 digits for most countries)
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      throw new ValidationError('Phone number must be between 7 and 15 digits');
    }
  },

  // Validate date of birth
  dateOfBirth(dateString: string): void {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    // Check if date is in the past
    if (date >= today) {
      throw new ValidationError('Date of birth must be in the past');
    }

    // Check if person is not too old (e.g., max 150 years)
    const age = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    if (age > 150) {
      throw new ValidationError('Invalid date of birth');
    }
  },

  // Validate blood group
  bloodGroup(bloodGroup: string): void {
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validGroups.includes(bloodGroup.toUpperCase())) {
      throw new ValidationError('Invalid blood group. Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-');
    }
  },

  // Validate gender
  gender(gender: string): void {
    const validGenders = ['M', 'F', 'O']; // Male, Female, Other
    if (!validGenders.includes(gender.toUpperCase())) {
      throw new ValidationError('Invalid gender. Must be M (Male), F (Female), or O (Other)');
    }
  },

  // Validate license number (13 digits for doctors)
  licenseNumber(license: string): void {
    const cleanLicense = license.replace(/[\s\-]/g, '');
    if (!/^\d{10}$/.test(cleanLicense)) {
      throw new ValidationError('License number must be 10 digits');
    }
  },

  // Validate years of experience
  yearsOfExperience(years: number): void {
    if (years < 0 || years > 100) {
      throw new ValidationError('Years of experience must be between 0 and 100');
    }
  },

  // Validate time format (HH:MM:SS)
  timeFormat(time: string): void {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

    if (!regex.test(time)) {
      throw new ValidationError(
        'Time must be in HH:mm or HH:mm:ss format'
      );
    }
  },

  // Validate sitting hours
  sittingHours(startTime: string, endTime: string): void {
    this.timeFormat(startTime);
    this.timeFormat(endTime);

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (startMinutes >= endMinutes) {
      throw new ValidationError('Sitting start time must be before end time');
    }
  }
};
