import { documentService } from "../../services/documentService";

const repo = createDocumentRepository({ documentService });
export const useDocumentStore = createDocumentStore({ repository: repo });