// Document Transformers - Convert between DTOs and Models

import type { DocumentDto } from "./dto";
import { DocumentModel, type DocumentType } from "./model";

export class DocumentTransformer {
  static toModel(dto: DocumentDto): DocumentModel {
    return new DocumentModel(
      dto.document_id,
      dto.patient_id,
      dto.original_name,
      dto.mime_type,
      dto.file_size,
      new Date(dto.created_at),
      dto.document_type ? (dto.document_type as DocumentType) : null,
      dto.is_verified,
      dto.detail,
      dto.uploaded_by,
      dto.uploaded_by_first_name,
      dto.uploaded_by_last_name,
      dto.appointment_id,
      dto.hospital_id,
      dto.hospital_name,
      dto.lab_test_id,
      dto.lab_test_name,
      dto.lab_test_description,
      dto.lab_test_cost
    );
  }

  static toModels(dtos: DocumentDto[]): DocumentModel[] {
    return dtos.map((dto) => this.toModel(dto));
  }

  static toDto(model: DocumentModel): DocumentDto {
    return {
      document_id: model.documentId,
      patient_id: model.patientId,
      original_name: model.originalName,
      mime_type: model.mimeType,
      file_size: model.fileSize,
      created_at: model.createdAt.toISOString(),
      document_type: model.documentType,
      is_verified: model.isVerified,
      detail: model.detail,
      uploaded_by: model.uploadedBy,
      uploaded_by_first_name: model.uploadedByFirstName,
      uploaded_by_last_name: model.uploadedByLastName,
      appointment_id: model.appointmentId,
      hospital_id: model.hospitalId,
      hospital_name: model.hospitalName,
      lab_test_id: model.labTestId,
      lab_test_name: model.labTestName,
      lab_test_description: model.labTestDescription,
      lab_test_cost: model.labTestCost
    };
  }
}
