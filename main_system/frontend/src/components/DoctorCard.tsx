import React from 'react';
import type { AssociatedDoctorModel } from '../models/associatedStaff/doctors/model';

type Props = { doctor?: AssociatedDoctorModel | null };

const DoctorCard: React.FC<Props> = ({ doctor }) => {
  if (!doctor) return null;

  // support both DTO shapes and internal model fields
  const first = (doctor as any).fullName ?? (doctor as any).doctor_first_name ?? (doctor as any).firstName ?? '';
  const last = (doctor as any).doctor_last_name ?? (doctor as any).lastName ?? '';
  const name = (doctor as any).fullName ?? `${first} ${last}`.trim() ?? 'Doctor';
  const specialization = (doctor as any).specialization ?? (doctor as any).doctor_specialization ?? '—';
  const start = (doctor as any).sitting_start ?? (doctor as any).sittingStart ?? '';
  const end = (doctor as any).sitting_end ?? (doctor as any).sittingEnd ?? '';
  const licenseNo = (doctor as any).license_number ?? (doctor as any).licenseNumber ?? '—';
  const years = (doctor as any).years_of_experience ?? (doctor as any).yearsOfExperience ?? null;
  const hospital = (doctor as any).hospital_name ?? (doctor as any).hospitalName ?? '';


  return (
    <div className="bg-white dark:bg-[#2b2b2b] rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-4 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold">{name}</h4>
          <div className="text-sm text-gray-600 dark:text-[#bdbdbd]">{specialization}</div>
          {hospital && <div className="text-sm text-gray-500 mt-1">{hospital}</div>}

          <div className="mt-3 text-sm grid grid-cols-2 gap-2">
            <div className="text-xs text-gray-500">License</div>
            <div className="text-xs font-medium">{licenseNo}</div>

            <div className="text-xs text-gray-500">Experience</div>
            <div className="text-xs font-medium">{years != null ? `${years} yrs` : '—'}</div>

            <div className="text-xs text-gray-500">Sitting</div>
            <div className="text-xs font-medium">{(start || end) ? `${start}${start && end ? ' - ' : ''}${end}` : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;