import React from 'react';

type Props = {
  hospital?: any | null;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

const HospitalCard: React.FC<Props> = ({ hospital}) => {
  if (!hospital) return null;

  const id = String(hospital.hospital_id ?? hospital.id ?? hospital.hospitalId ?? '');
  const name = hospital.name ?? hospital.hospital_name ?? `Hospital ${id}`;
  const address = hospital.address ?? hospital.location ?? hospital.hospital_address ?? '';
  const phone = hospital.phone ?? hospital.contact ?? '';

  return (
    <div className="bg-white dark:bg-[#2b2b2b] rounded-xl shadow-md border p-4 border-gray-200 dark:border-[#404040]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{name.toUpperCase()}</div>
          {address && <div className="text-xs text-gray-500 mt-1">{address}</div>}
          {phone && <div className="text-xs text-gray-500 mt-1">{phone}</div>}
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;
