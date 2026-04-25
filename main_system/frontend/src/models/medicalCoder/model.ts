/**
 * Domain Model for Medical Coder
 * Represents the medical coder entity with user-friendly property names
 */
export interface MedicalCoderModel {
  medicalCoderId: number;
  personId: number;
  hospitalId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain Model for ICD Code
 */
export interface ICDCodeModel {
  icdCode: string;
  description: string;
}

/**
 * Domain Model for CPT Code
 */
export interface CPTCodeModel {
  cptCode: string;
  description: string;
}

/**
 * Domain Model for Modifier Code
 */
export interface ModifierCodeModel {
  modifierCode: string;
  description: string;
}

/**
 * Domain Model for Medical Coding Entry
 */
export interface MedicalCodingModel {
  medicalCodingId: number;
  doctorNoteId: number;
  icdCode: string | null;
  cptCode: string | null;
  modifierCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI Coding API - Code Detail Model
 */
export interface CodeDetailModel {
  code: string;
  description: string;
  explanation: string;
}

/**
 * AI Coding API - Coding Response Model
 */
export interface CodingResponseModel {
  icdCodes: CodeDetailModel[];
  cptCodes: CodeDetailModel[];
  overallSummary: string;
}

/**
 * AI Coding API - File Upload Response Model
 */
export interface FileUploadResponseModel {
  success: boolean;
  filename: string;
  extractedTextLength: number;
  icdCodes: CodeDetailModel[];
  cptCodes: CodeDetailModel[];
  overallSummary: string;
}
