/**
 * Data Transfer Object for Medical Coder
 * Represents the raw data structure received from the backend API
 */
export interface MedicalCoderDto {
  medical_coder_id: number;
  person_id: number;
  hospital_id: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Data Transfer Object for ICD Code
 */
export interface ICDCodeDto {
  icd_code: string;
  description: string;
}

/**
 * Data Transfer Object for CPT Code
 */
export interface CPTCodeDto {
  cpt_code: string;
  description: string;
}

/**
 * Data Transfer Object for Modifier Code
 */
export interface ModifierCodeDto {
  modifier_code: string;
  description: string;
}

/**
 * Data Transfer Object for Medical Coding Entry
 */
export interface MedicalCodingDto {
  medical_coding_id: number;
  doctor_note_id: number;
  icd_code: string | null;
  cpt_code: string | null;
  modifier_code: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * AI Coding API - Code Detail
 */
export interface CodeDetailDto {
  code: string;
  description: string;
  explanation: string;
}

/**
 * AI Coding API - Coding Response
 */
export interface CodingResponseDto {
  icd_codes: CodeDetailDto[];
  cpt_codes: CodeDetailDto[];
  overall_summary: string;
}

/**
 * AI Coding API - File Upload Response
 */
export interface FileUploadResponseDto {
  success: boolean;
  filename: string;
  extracted_text_length: number;
  icd_codes: CodeDetailDto[];
  cpt_codes: CodeDetailDto[];
  overall_summary: string;
}
