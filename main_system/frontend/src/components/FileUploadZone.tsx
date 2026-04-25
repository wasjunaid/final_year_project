import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  selectedFile,
  onFileSelect,
  onFileRemove,
  disabled = false,
  accept = '.pdf',
  maxSizeMB = 10,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5 dark:bg-primary/10'
            : 'border-gray-300 dark:border-dark-border hover:border-primary dark:hover:border-primary'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          accept={accept}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-[#808080] mb-3" />
        
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">
          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-[#808080]">
          PDF (MAX. {maxSizeMB}MB)
        </p>
      </div>

      {selectedFile && (
        <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900 dark:text-white">Selected:</span>
            <span className="text-gray-700 dark:text-[#d0d0d0]">{selectedFile.name}</span>
            <span className="text-gray-500 dark:text-dark-text-secondary">
              ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFileRemove();
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
