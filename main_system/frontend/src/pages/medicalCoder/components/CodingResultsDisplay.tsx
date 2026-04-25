import React from 'react';
import type { CodingResponseModel } from '../../../models/medicalCoder';
import { Code, FileText, AlertCircle } from 'lucide-react';

interface CodingResultsDisplayProps {
  result: CodingResponseModel | null;
  error: string | null;
}

export const CodingResultsDisplay: React.FC<CodingResultsDisplayProps> = ({ result, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
              Analysis Failed
            </h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <Code size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          Enter provider notes above to get AI-powered code suggestions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      {result.overallSummary && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <FileText size={20} />
            Overall Summary
          </h3>
          <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
            {result.overallSummary}
          </p>
        </div>
      )}

      {/* ICD Codes */}
      <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Code size={20} className="text-green-600 dark:text-green-400" />
          ICD-10 Diagnosis Codes
          <span className="ml-auto text-sm font-normal text-gray-600 dark:text-gray-400">
            {result.icdCodes.length} codes found
          </span>
        </h3>
        {result.icdCodes.length > 0 ? (
          <div className="space-y-4">
            {result.icdCodes.map((code, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                    {code.code}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  {code.description}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {code.explanation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No ICD-10 codes identified
          </p>
        )}
      </div>

      {/* CPT Codes */}
      <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Code size={20} className="text-purple-600 dark:text-purple-400" />
          CPT Procedure Codes
          <span className="ml-auto text-sm font-normal text-gray-600 dark:text-gray-400">
            {result.cptCodes.length} codes found
          </span>
        </h3>
        {result.cptCodes.length > 0 ? (
          <div className="space-y-4">
            {result.cptCodes.map((code, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                    {code.code}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  {code.description}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {code.explanation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No CPT codes identified
          </p>
        )}
      </div>
    </div>
  );
};
