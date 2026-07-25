import React from 'react';
import { AdminLayout as AdminControlCenter } from '../components/admin/AdminLayout.js';

interface AdminLayoutWrapperProps {
  onBackToPublicSite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutWrapperProps> = ({ onBackToPublicSite }) => {
  return <AdminControlCenter onBackToPublicSite={onBackToPublicSite} />;
};
