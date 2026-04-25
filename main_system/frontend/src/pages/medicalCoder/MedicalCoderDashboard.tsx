import React, { useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import type { NavbarConfig } from '../../models/navbar/model';
import { useMedicalCoderManagementController, useAICodingController } from '../../hooks/medicalCoder';
import { User, RefreshCw } from 'lucide-react';
import { ProviderNotesInput, CodingResultsDisplay } from './components';

export const MedicalCoderDashboard: React.FC = () => {
  // Medical Coder Management
  const { 
    medicalCoder, 
    loading: managementLoading, 
    error: managementError,
  } = useMedicalCoderManagementController();

  // AI Coding
  const {
    loading: aiLoading,
    error: aiError,
    codingResult,
    analyzeNotes,
    uploadFile,
    clearResult,
  } = useAICodingController();

  const navbarConfig: NavbarConfig = useMemo(
    () => ({
      title: 'Medical Coding Dashboard',
      subtitle: 'AI-powered ICD-10 and CPT code suggestions',
      tabs: [],
      actions: codingResult ? [
        {
          label: 'Clear Results',
          icon: RefreshCw,
          onClick: clearResult,
          variant: 'ghost',
        },
      ] : undefined,
    }),
    [codingResult, clearResult]
  );

  useNavbarController(navbarConfig);

  if (managementLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading medical coder information...</p>
        </div>
      </div>
    );
  }

  if (managementError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{managementError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Medical Coder Information Card */}
      <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={24} />
          Medical Coder Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Medical Coder ID</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {medicalCoder?.medicalCoderId || 'N/A'}
            </p>
          </div>
          {/*<div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hospital Association</p>
            <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 size={16} />
              {medicalCoder && medicalCoder.hospitalId ? `Hospital ID: ${medicalCoder.hospitalId}` : 'Not Associated'}
            </p>
          </div>*/}
        </div>
      </div>

      {/* Provider Notes Input */}
      <ProviderNotesInput
        onAnalyze={analyzeNotes}
        onFileUpload={uploadFile}
        loading={aiLoading}
      />

      {/* Coding Results Display */}
      <CodingResultsDisplay result={codingResult} error={aiError} />
    </div>
  );
};
