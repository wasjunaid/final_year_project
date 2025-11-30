// stores/documentStore.ts
import { create } from "zustand";
import { documentService } from "../../services/documentService";
import type { Document } from "../../models/document/model";

type UploadingMap = Record<string, number>;

export const useDocumentStore = create((set, get) => ({
  documents: [] as Document[],
  uploading: {} as UploadingMap,
  error: null as string | null,

  addLocal: (doc: Document) => set(s => ({ documents: [doc, ...s.documents] })),

  uploadDocument: async (file: File) => {
    const tempId = `temp-${Date.now()}`;
    const tempDoc: Document = { id: tempId, name: file.name, url: "", createdAt: new Date() };

    // add temp UI doc and set progress 0
    set(s => ({ documents: [tempDoc, ...s.documents], uploading: { ...s.uploading, [tempId]: 0 }, error: null }));

    try {
      const uploaded = await documentService.uploadFile(file, (progress) => {
        set(s => ({ uploading: { ...s.uploading, [tempId]: progress } }));
      });

      // replace temp item with server item
      set(s => {
        const cleanedUploading = { ...s.uploading };
        delete cleanedUploading[tempId];
        return {
          documents: s.documents.map(d => d.id === tempId ? {
            id: uploaded.id,
            name: uploaded.name,
            url: uploaded.url,
            createdAt: new Date(uploaded.created_at)
          } : d),
          uploading: cleanedUploading
        };
      });

      return uploaded;
    } catch (err: any) {
      // rollback: remove temp and error
      set(s => {
        const cleanedUploading = { ...s.uploading };
        delete cleanedUploading[tempId];
        return { documents: s.documents.filter(d => d.id !== tempId), uploading: cleanedUploading, error: err.message ?? "Upload failed" };
      });
      throw err;
    }
  },

}));
