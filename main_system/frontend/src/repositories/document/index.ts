// Document Repository Factory - Provides DocumentRepository instances with DI

import { DocumentService } from "../../services/document";
import { DocumentRepository } from "./documentRepository";

let documentRepositoryInstance: DocumentRepository | null = null;

export const getDocumentRepository = (): DocumentRepository => {
  if (!documentRepositoryInstance) {
    documentRepositoryInstance = new DocumentRepository(DocumentService);
  }
  return documentRepositoryInstance;
};

// Export for direct use
export * from "./documentRepository";
