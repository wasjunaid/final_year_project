import React, { useState, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { useNavbar } from '../../hooks/useNavbar';
import type { NavbarConfig } from '../../models/navigation/model';

const InsurancePage: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    provider: '',
    planType: '',
    policyNumber: '',
    coverage: '',
    deductible: '',
    outOfPocket: '',
  });

  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Insurance Management',
    showSearch: true,
    searchPlaceholder: 'Search insurance plans...',
    actions: [
      {
        label: 'Add Insurance',
        icon: Plus,
        onClick: () => setShowAddDialog(true),
        variant: 'primary',
      },
    ],
  }), []);

  useNavbar(navbarConfig);
  useNavbar(navbarConfig);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding insurance plan:', formData);
    // TODO: Add API call to save insurance plan
    setShowAddDialog(false);
    setFormData({
      provider: '',
      planType: '',
      policyNumber: '',
      coverage: '',
      deductible: '',
      outOfPocket: '',
    });
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setFormData({
      provider: '',
      planType: '',
      policyNumber: '',
      coverage: '',
      deductible: '',
      outOfPocket: '',
    });
  };

  const mockInsurancePlans = [
    {
      id: 'INS-001',
      provider: 'BlueCross BlueShield',
      planType: 'PPO',
      policyNumber: 'BC-123456789',
      status: 'active',
      coverage: '80%',
      deductible: '$1,500',
      outOfPocket: '$5,000',
    },
    {
      id: 'INS-002',
      provider: 'Aetna',
      planType: 'HMO',
      policyNumber: 'AET-987654321',
      status: 'active',
      coverage: '90%',
      deductible: '$1,000',
      outOfPocket: '$3,000',
    },
    {
      id: 'INS-003',
      provider: 'United Healthcare',
      planType: 'EPO',
      policyNumber: 'UHC-456789123',
      status: 'pending',
      coverage: '75%',
      deductible: '$2,000',
      outOfPocket: '$6,000',
    },
    {
      id: 'INS-004',
      provider: 'Cigna',
      planType: 'PPO',
      policyNumber: 'CIG-789123456',
      status: 'active',
      coverage: '85%',
      deductible: '$1,200',
      outOfPocket: '$4,000',
    },
    {
      id: 'INS-005',
      provider: 'Kaiser Permanente',
      planType: 'HMO',
      policyNumber: 'KP-321654987',
      status: 'active',
      coverage: '95%',
      deductible: '$500',
      outOfPocket: '$2,500',
    },
    {
      id: 'INS-006',
      provider: 'Humana',
      planType: 'POS',
      policyNumber: 'HUM-654987321',
      status: 'pending',
      coverage: '70%',
      deductible: '$2,500',
      outOfPocket: '$7,000',
    },
  ];

  return (
    <>
      {/* Add Insurance Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Add Insurance Plan</h2>
              <button
                onClick={handleCloseDialog}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider *
                  </label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., BlueCross BlueShield"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type *
                  </label>
                  <select
                    name="planType"
                    value={formData.planType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Plan Type</option>
                    <option value="PPO">PPO</option>
                    <option value="HMO">HMO</option>
                    <option value="EPO">EPO</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., BC-123456789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Percentage *
                  </label>
                  <input
                    type="text"
                    name="coverage"
                    value={formData.coverage}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 80%"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deductible *
                  </label>
                  <input
                    type="text"
                    name="deductible"
                    value={formData.deductible}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., $1,500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Out of Pocket Max *
                  </label>
                  <input
                    type="text"
                    name="outOfPocket"
                    value={formData.outOfPocket}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., $5,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Add Insurance Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Insurance Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {mockInsurancePlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{plan.provider}</h3>
                  <p className="text-sm text-gray-500">{plan.planType} Plan</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    plan.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Policy Number:</span>
                  <span className="font-semibold text-gray-800">{plan.policyNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-semibold text-gray-800">{plan.coverage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deductible:</span>
                  <span className="font-semibold text-gray-800">{plan.deductible}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Out of Pocket Max:</span>
                  <span className="font-semibold text-gray-800">{plan.outOfPocket}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm">
                  View Details
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Verifications</h3>
          <div className="space-y-3">
            {[
              {
                patient: 'John Doe',
                provider: 'BlueCross BlueShield',
                status: 'verified',
                date: 'Nov 28, 2025',
              },
              {
                patient: 'Maria Silva',
                provider: 'Aetna',
                status: 'verified',
                date: 'Nov 27, 2025',
              },
              {
                patient: 'Fatima Ahmed',
                provider: 'United Healthcare',
                status: 'pending',
                date: 'Nov 30, 2025',
              },
              {
                patient: 'Ahmed Hassan',
                provider: 'Cigna',
                status: 'verified',
                date: 'Nov 29, 2025',
              },
              {
                patient: 'Sarah Johnson',
                provider: 'Kaiser Permanente',
                status: 'verified',
                date: 'Nov 30, 2025',
              },
              {
                patient: 'Emma Wilson',
                provider: 'Humana',
                status: 'pending',
                date: 'Nov 30, 2025',
              },
            ].map((verification, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                    {verification.patient
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {verification.patient}
                    </div>
                    <div className="text-xs text-gray-500">{verification.provider}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{verification.date}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      verification.status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default InsurancePage;
