import React from 'react';
import type { PatientInsuranceModel } from '../../../../models/insurance/model';
import { Edit, Trash2, CheckCircle, BadgeCheck } from 'lucide-react';

interface InsuranceCardProps {
  insurance: PatientInsuranceModel;
  onEdit: (insurance: PatientInsuranceModel) => void;
  onDelete: (insuranceId: number) => void;
  onVerify: (insuranceId: number) => void;
}

export const InsuranceCard: React.FC<InsuranceCardProps> = ({
  insurance,
  onEdit,
  onDelete,
  onVerify,
}) => {
  // Determine gradient color based on type
  const gradientColor = insurance.is_primary 
    ? 'from-blue-600 to-blue-800' 
    : 'from-purple-600 to-purple-800';

  return (
    <div className={`bg-linear-to-br ${gradientColor} rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-white relative overflow-hidden`}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10"></div>
      
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
              {insurance.is_primary ? 'Primary' : 'Secondary'}
            </div>
            <div className="text-lg font-bold">
              {insurance.insurance_company_name}
            </div>
          </div>
          {insurance.is_verified && (
            <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1">
              <BadgeCheck size={12} />
              Verified
            </div>
          )}
        </div>

        {/* Insurance Details */}
        <div className="space-y-2 mb-4">
          <div>
            <div className="text-xs opacity-80">Member ID</div>
            <div className="text-sm font-mono font-semibold">
              {insurance.insurance_number}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="opacity-80">Policy Holder</div>
              <div className="font-semibold capitalize truncate">{insurance.policy_holder_name}</div>
            </div>
            <div>
              <div className="opacity-80">Relationship</div>
              <div className="font-semibold capitalize">{insurance.relationship_to_holder}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-white/20">
          {!insurance.is_verified && (
            <button
              onClick={() => onVerify(insurance.patient_insurance_id)}
              className="flex-1 flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2 py-1.5 rounded text-xs font-semibold transition-colors"
              title="Verify Insurance"
            >
              <CheckCircle size={14} />
              Verify
            </button>
          )}
          <button
            onClick={() => onEdit(insurance)}
            className="flex-1 flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2 py-1.5 rounded text-xs font-semibold transition-colors"
            title="Edit Insurance"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(insurance.patient_insurance_id)}
            className="flex-1 flex items-center justify-center gap-1 bg-white/20 hover:bg-red-500/30 backdrop-blur-sm px-2 py-1.5 rounded text-xs font-semibold transition-colors"
            title="Delete Insurance"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
