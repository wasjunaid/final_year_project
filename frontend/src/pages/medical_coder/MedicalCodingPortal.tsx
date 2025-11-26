import { useState, useCallback } from 'react';
import { FaFileUpload, FaClipboardList, FaTrash, FaHeartbeat, FaBook } from 'react-icons/fa';
import { useMedicalCoding } from '../../hooks/useMedicalCoding';
import Button from '../../components/Button';
import LabeledInputField from '../../components/LabeledInputField';
import AppColors from '../../constants/appColors';

// Predefined example provider notes
const EXAMPLE_NOTES = [
  {
    id: 'custom',
    title: 'Custom Notes (Type Your Own)',
    content: '',
  },
  {
    id: 'bronchitis',
    title: 'Acute Bronchitis',
    content: 'Patient presents with acute bronchitis. Cough for 5 days, productive with yellow sputum. Lung exam reveals diffuse wheezing. Prescribed azithromycin 500mg daily for 5 days. Follow-up in 1 week if symptoms persist.',
  },
  {
    id: 'diabetes',
    title: 'Type 2 Diabetes - Initial Visit',
    content: 'Patient is a 55-year-old male presenting for initial diabetes management. HbA1c 8.5%. Fasting glucose 180 mg/dL. Patient reports polyuria, polydipsia for 2 months. Family history significant for diabetes in both parents. Started on metformin 500mg twice daily. Diabetic education provided. Order lipid panel, renal function tests, and fundoscopic exam.',
  },
  {
    id: 'hypertension',
    title: 'Hypertension Follow-up',
    content: 'Patient returns for hypertension follow-up. Blood pressure today 148/92. Patient admits to medication non-compliance. Currently on lisinopril 10mg daily. Increased to lisinopril 20mg daily. Discussed importance of medication adherence and lifestyle modifications including low-sodium diet and regular exercise. Return in 2 weeks for BP recheck.',
  },
  {
    id: 'annual_physical',
    title: 'Annual Physical Examination',
    content: 'Patient here for annual physical examination. 45-year-old female, generally healthy. Vital signs: BP 122/78, HR 72, RR 16, Temp 98.6°F. Physical exam unremarkable. Last mammogram 18 months ago - normal. Pap smear due. Discussed age-appropriate cancer screening. Ordered CBC, CMP, lipid panel, TSH. Administered flu vaccine. Patient counseled on healthy diet and exercise.',
  },
  {
    id: 'uti',
    title: 'Urinary Tract Infection',
    content: 'Patient presents with 2 days of dysuria, frequency, and urgency. Denies fever, back pain, or hematuria. Urine dipstick positive for leukocyte esterase and nitrites. Diagnosed with uncomplicated UTI. Prescribed ciprofloxacin 250mg twice daily for 3 days. Advised to increase fluid intake. Return if symptoms worsen or fever develops.',
  },
  {
    id: 'chest_pain',
    title: 'Chest Pain - Angina',
    content: 'Patient is a 62-year-old male presenting with substernal chest pressure occurring with exertion, relieved by rest. Episodes lasting 5-10 minutes. No radiation. Patient has history of hyperlipidemia and smoking. EKG shows no acute changes. Cardiac enzymes pending. Diagnosed with stable angina. Started on aspirin 81mg daily, atorvastatin 40mg at bedtime, and nitroglycerin sublingual as needed. Scheduled for stress test. Smoking cessation counseling provided.',
  },
  {
    id: 'depression',
    title: 'Major Depressive Disorder',
    content: 'Patient presents with persistent low mood, anhedonia, and sleep disturbance for 6 weeks. PHQ-9 score: 18 (moderate-severe depression). Denies suicidal ideation. No psychotic symptoms. Social and occupational functioning impaired. Diagnosed with major depressive disorder, moderate. Initiated on sertraline 50mg daily. Referred for cognitive behavioral therapy. Close follow-up scheduled in 2 weeks. Safety plan discussed.',
  },
  {
    id: 'asthma',
    title: 'Asthma Exacerbation',
    content: 'Patient with history of asthma presents with increased wheezing and shortness of breath for 3 days. Using albuterol inhaler more frequently with minimal relief. Denied recent URI symptoms. Lung exam reveals bilateral expiratory wheezes. Peak flow 65% of personal best. Diagnosed with asthma exacerbation. Administered nebulizer treatment in office with good response. Prescribed prednisone 40mg daily for 5 days and increased inhaled corticosteroid. Peak flow monitoring instructions provided.',
  },
];

export function MedicalCodingPortal() {
  const {
    loading,
    error,
    success,
    codingResult,
    fileUploadResult,
    analyzeNotes,
    uploadFile,
    checkHealth,
    clearMessages,
    clearResults,
  } = useMedicalCoding();

  const [providerNotes, setProviderNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [selectedExample, setSelectedExample] = useState('custom');

  const handleProviderNotesChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProviderNotes(e.target.value);
    setSelectedExample('custom');
  }, []);

  const handleExampleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const exampleId = e.target.value;
    setSelectedExample(exampleId);
    
    const example = EXAMPLE_NOTES.find(ex => ex.id === exampleId);
    if (example) {
      setProviderNotes(example.content);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.name.endsWith('.txt')) {
        alert('Only .txt files are supported');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  }, []);

  const handleAnalyzeText = useCallback(async () => {
    if (!providerNotes.trim()) {
      alert('Please enter provider notes or select an example');
      return;
    }
    await analyzeNotes(providerNotes);
  }, [providerNotes, analyzeNotes]);

  const handleUploadFile = useCallback(async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }
    await uploadFile(selectedFile);
  }, [selectedFile, uploadFile]);

  const handleClear = useCallback(() => {
    setProviderNotes('');
    setSelectedFile(null);
    setSelectedExample('custom');
    clearResults();
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, [clearResults]);

  const handleHealthCheck = useCallback(async () => {
    await checkHealth();
  }, [checkHealth]);

  // Get current result based on active tab
  const currentResult = activeTab === 'text' ? codingResult : fileUploadResult;

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Medical Coding Portal</h1>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered ICD-10 & CPT Code Analyzer
          </p>
        </div>
        <Button
          label="Health Check"
          icon={<FaHeartbeat />}
          variant="secondary"
          onClick={handleHealthCheck}
          disabled={loading}
        />
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={clearMessages}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex justify-between items-center">
          <span>{success}</span>
          <button 
            onClick={clearMessages}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
            activeTab === 'text'
              ? `bg-[${AppColors.primary}] text-white`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={activeTab === 'text' ? { backgroundColor: AppColors.primary } : {}}
        >
          <FaClipboardList className="inline mr-2" />
          Text Input
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
            activeTab === 'file'
              ? `bg-[${AppColors.primary}] text-white`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={activeTab === 'file' ? { backgroundColor: AppColors.primary } : {}}
        >
          <FaFileUpload className="inline mr-2" />
          File Upload
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            {activeTab === 'text' ? 'Provider Notes' : 'Upload Notes File'}
          </h2>

          {activeTab === 'text' ? (
            <>
              {/* Example Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBook className="inline mr-2" />
                  Select Example or Type Custom Notes
                </label>
                <select
                  value={selectedExample}
                  onChange={handleExampleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={loading}
                >
                  {EXAMPLE_NOTES.map((example) => (
                    <option key={example.id} value={example.id}>
                      {example.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select an example case or choose "Custom Notes" to type your own
                </p>
              </div>

              {/* Text Area */}
              <LabeledInputField
                title="Provider Notes"
                value={providerNotes}
                onChange={handleProviderNotesChange}
                placeholder="Select an example above or type custom provider notes here..."
                multiline
                rows={12}
              />

              <div className="flex gap-3 mt-4">
                <Button
                  label={loading ? 'Analyzing...' : 'Analyze Notes'}
                  icon={<FaClipboardList />}
                  onClick={handleAnalyzeText}
                  disabled={loading || !providerNotes.trim()}
                />
                <Button
                  label="Clear"
                  icon={<FaTrash />}
                  variant="secondary"
                  onClick={handleClear}
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select TXT File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Only .txt files are supported. Maximum file size: 10MB
                </p>
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The system automatically detects and removes patient personal information (PII) before processing.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  label={loading ? 'Processing...' : 'Upload & Analyze'}
                  icon={<FaFileUpload />}
                  onClick={handleUploadFile}
                  disabled={loading || !selectedFile}
                />
                <Button
                  label="Clear"
                  icon={<FaTrash />}
                  variant="secondary"
                  onClick={handleClear}
                  disabled={loading}
                />
              </div>
            </>
          )}
        </div>

        {/* Output Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Analysis Results
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-gray-500">Analyzing provider notes...</div>
            </div>
          ) : currentResult ? (
            <div className="space-y-6">
              {/* File Upload Info */}
              {activeTab === 'file' && fileUploadResult && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-sm text-gray-700">
                    <strong>File:</strong> {fileUploadResult.filename}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Extracted Text Length:</strong> {fileUploadResult.extracted_text_length} characters
                  </p>
                </div>
              )}

              {/* Overall Summary */}
              {currentResult.overall_summary && (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Overall Summary</h3>
                  <p className="text-sm text-purple-800">{currentResult.overall_summary}</p>
                </div>
              )}

              {/* ICD-10 Codes */}
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold mr-2 px-2.5 py-0.5 rounded">
                    ICD-10
                  </span>
                  Diagnosis Codes
                </h3>
                {currentResult.icd_codes && currentResult.icd_codes.length > 0 ? (
                  <div className="space-y-3">
                    {currentResult.icd_codes.map((codeDetail, index) => (
                      <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <div className="flex items-start justify-between mb-2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-mono font-bold">
                            {codeDetail.code}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {codeDetail.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          {codeDetail.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No ICD-10 codes identified</p>
                )}
              </div>

              {/* CPT Codes */}
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-green-100 text-green-800 text-xs font-bold mr-2 px-2.5 py-0.5 rounded">
                    CPT
                  </span>
                  Procedure Codes
                </h3>
                {currentResult.cpt_codes && currentResult.cpt_codes.length > 0 ? (
                  <div className="space-y-3">
                    {currentResult.cpt_codes.map((codeDetail, index) => (
                      <div key={index} className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                        <div className="flex items-start justify-between mb-2">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-mono font-bold">
                            {codeDetail.code}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {codeDetail.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          {codeDetail.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No CPT codes identified</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <FaClipboardList className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">
                Select an example or enter custom notes to see analysis results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-900 mb-2">How It Works</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Example Cases:</strong> Choose from {EXAMPLE_NOTES.length - 1} pre-loaded medical scenarios for quick testing</li>
          <li>• <strong>Custom Input:</strong> Type your own provider notes for personalized analysis</li>
          <li>• <strong>File Upload:</strong> Upload .txt files containing provider notes (PII automatically removed)</li>
          <li>• <strong>AI-Powered:</strong> Advanced AI accurately identifies ICD-10 diagnosis and CPT procedure codes</li>
          <li>• <strong>Detailed Explanations:</strong> Understand the reasoning behind each code with descriptions</li>
        </ul>
      </div>
    </div>
  );
}