import React, { useState } from 'react';
import { FileText, Upload, Loader2 } from 'lucide-react';

interface ProviderNotesInputProps {
  onAnalyze: (notes: string) => void;
  onFileUpload: (file: File) => void;
  loading: boolean;
}

export const ProviderNotesInput: React.FC<ProviderNotesInputProps> = ({
  onAnalyze,
  onFileUpload,
  loading,
}) => {
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  const handleAnalyze = () => {
    if (notes.trim()) {
      onAnalyze(notes);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      onFileUpload(file);
    } else {
      alert('Please upload a .txt file');
    }
  };

  return (
    <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText size={24} />
        Provider Notes
      </h2>

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('text')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'text'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Text Input
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'file'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          File Upload
        </button>
      </div>

      {activeTab === 'text' ? (
        <div className="space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter provider notes here... Include patient symptoms, diagnosis, procedures, etc."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !notes.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText size={20} />
                Analyze Notes
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload a .txt file containing provider notes
            </p>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium cursor-pointer ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Choose File
                </>
              )}
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
