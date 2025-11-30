import type { DocumentDTO } from "../models/document/dto";
import api from "./apiClient";
import type { AxiosProgressEvent } from "axios";

export const documentService = {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<DocumentDTO> {
    const form = new FormData();
    form.append("file", file);

    const res = await api.post<DocumentDTO>("/documents", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt: AxiosProgressEvent) => {
        if (!evt.total) return;
        const percent = Math.round((evt.loaded / evt.total) * 100);
        onProgress?.(percent);
      },
    });

    return res.data;
  },
};
