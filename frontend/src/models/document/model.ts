// Document Models - Frontend representation with proper types

export const DocumentType = {
  CNIC: "CNIC",
  PASSPORT: "PASSPORT",
  MEDICAL_HISTORY: "MEDICAL_HISTORY",
  PRESCRIPTION: "PRESCRIPTION",
  LAB_RESULT: "LAB_RESULT",
  RADIOLOGY_RESULT: "RADIOLOGY_RESULT",
  INSURANCE: "INSURANCE",
  OTHER: "OTHER"
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export const UploaderRole = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  FRONTDESK: "FRONTDESK",
  LAB_TECH: "LAB_TECH",
  SYSTEM_ADMIN: "SYSTEM_ADMIN"
} as const;

export type UploaderRole = typeof UploaderRole[keyof typeof UploaderRole];

export class DocumentModel {
  documentId: string;
  patientId: number;
  originalName: string;
  mimeType: string;
  fileSize: number;
  createdAt: Date;
  documentType: DocumentType | null;
  isVerified: boolean;
  detail: string;
  uploadedBy?: number;
  uploadedByFirstName?: string;
  uploadedByLastName?: string;
  appointmentId?: number;
  hospitalId?: number;
  hospitalName?: string;
  labTestId?: number;
  labTestName?: string;
  labTestDescription?: string;
  labTestCost?: number;
  fileName?: string;
  ipfsHash?: string;
  updatedAt?: Date;

  constructor(
    documentId: string,
    patientId: number,
    originalName: string,
    mimeType: string,
    fileSize: number,
    createdAt: Date,
    documentType: DocumentType | null,
    isVerified: boolean,
    detail: string,
    uploadedBy?: number,
    uploadedByFirstName?: string,
    uploadedByLastName?: string,
    appointmentId?: number,
    hospitalId?: number,
    hospitalName?: string,
    labTestId?: number,
    labTestName?: string,
    labTestDescription?: string,
    labTestCost?: number,
    fileName?: string,
    ipfsHash?: string,
    updatedAt?: Date
  ) {
    this.documentId = documentId;
    this.patientId = patientId;
    this.originalName = originalName;
    this.mimeType = mimeType;
    this.fileSize = fileSize;
    this.createdAt = createdAt;
    this.documentType = documentType;
    this.isVerified = isVerified;
    this.detail = detail;
    this.uploadedBy = uploadedBy;
    this.uploadedByFirstName = uploadedByFirstName;
    this.uploadedByLastName = uploadedByLastName;
    this.appointmentId = appointmentId;
    this.hospitalId = hospitalId;
    this.hospitalName = hospitalName;
    this.labTestId = labTestId;
    this.labTestName = labTestName;
    this.labTestDescription = labTestDescription;
    this.labTestCost = labTestCost;
    this.fileName = fileName;
    this.ipfsHash = ipfsHash;
    this.updatedAt = updatedAt;
  }

  // Utility methods
  get uploaderFullName(): string {
    if (this.uploadedByFirstName && this.uploadedByLastName) {
      return `${this.uploadedByFirstName} ${this.uploadedByLastName}`;
    }
    return "Unknown";
  }

  get fileSizeInMB(): string {
    return (this.fileSize / (1024 * 1024)).toFixed(2);
  }

  get isImage(): boolean {
    return this.mimeType.startsWith("image/");
  }

  get isPDF(): boolean {
    return this.mimeType === "application/pdf";
  }

  get fileExtension(): string {
    const parts = this.originalName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  }
}
