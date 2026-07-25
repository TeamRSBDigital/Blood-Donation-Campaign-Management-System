import React from 'react';
import { Donor } from '../../../types/index.js';
import { DonorProfile } from '../../donor/DonorProfile.js';

interface DonorProfileModalProps {
  donor: Donor | null;
  onClose: () => void;
  onEdit: (donor: Donor) => void;
  onRecordDonation: (donor: Donor) => void;
}

export const DonorProfileModal: React.FC<DonorProfileModalProps> = ({
  donor,
  onClose,
  onEdit,
  onRecordDonation
}) => {
  if (!donor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="my-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl">
        <DonorProfile
          donor={donor}
          onClose={onClose}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
};

