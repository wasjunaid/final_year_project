import type {
  MedicalCoderDto,
  ICDCodeDto,
  CPTCodeDto,
  ModifierCodeDto,
  MedicalCodingDto,
  CodeDetailDto,
  CodingResponseDto,
  FileUploadResponseDto,
} from './dto';
import type {
  MedicalCoderModel,
  ICDCodeModel,
  CPTCodeModel,
  ModifierCodeModel,
  MedicalCodingModel,
  CodeDetailModel,
  CodingResponseModel,
  FileUploadResponseModel,
} from './model';

/**
 * Transforms MedicalCoderDto to MedicalCoderModel
 */
export const toMedicalCoderModel = (dto: MedicalCoderDto): MedicalCoderModel => {
  return {
    medicalCoderId: dto.medical_coder_id,
    personId: dto.person_id,
    hospitalId: dto.hospital_id,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
};

/**
 * Transforms ICDCodeDto to ICDCodeModel
 */
export const toICDCodeModel = (dto: ICDCodeDto): ICDCodeModel => {
  return {
    icdCode: dto.icd_code,
    description: dto.description,
  };
};

/**
 * Transforms CPTCodeDto to CPTCodeModel
 */
export const toCPTCodeModel = (dto: CPTCodeDto): CPTCodeModel => {
  return {
    cptCode: dto.cpt_code,
    description: dto.description,
  };
};

/**
 * Transforms ModifierCodeDto to ModifierCodeModel
 */
export const toModifierCodeModel = (dto: ModifierCodeDto): ModifierCodeModel => {
  return {
    modifierCode: dto.modifier_code,
    description: dto.description,
  };
};

/**
 * Transforms MedicalCodingDto to MedicalCodingModel
 */
export const toMedicalCodingModel = (dto: MedicalCodingDto): MedicalCodingModel => {
  return {
    medicalCodingId: dto.medical_coding_id,
    doctorNoteId: dto.doctor_note_id,
    icdCode: dto.icd_code,
    cptCode: dto.cpt_code,
    modifierCode: dto.modifier_code,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
};

/**
 * Transforms CodeDetailDto to CodeDetailModel
 */
export const toCodeDetailModel = (dto: CodeDetailDto): CodeDetailModel => {
  return {
    code: dto.code,
    description: dto.description,
    explanation: dto.explanation,
  };
};

/**
 * Transforms CodingResponseDto to CodingResponseModel
 */
export const toCodingResponseModel = (dto: CodingResponseDto): CodingResponseModel => {
  return {
    icdCodes: dto.icd_codes.map(toCodeDetailModel),
    cptCodes: dto.cpt_codes.map(toCodeDetailModel),
    overallSummary: dto.overall_summary,
  };
};

/**
 * Transforms FileUploadResponseDto to FileUploadResponseModel
 */
export const toFileUploadResponseModel = (dto: FileUploadResponseDto): FileUploadResponseModel => {
  return {
    success: dto.success,
    filename: dto.filename,
    extractedTextLength: dto.extracted_text_length,
    icdCodes: dto.icd_codes.map(toCodeDetailModel),
    cptCodes: dto.cpt_codes.map(toCodeDetailModel),
    overallSummary: dto.overall_summary,
  };
};
