import React from 'react';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

interface PublicLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenAdminLogin?: () => void;
  onOpenDonorRegisterModal?: () => void;
  onOpenRequestModal?: () => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  activeTab = 'home',
  onTabChange,
  onOpenAdminLogin,
  onOpenDonorRegisterModal,
  onOpenRequestModal,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={onTabChange || (() => {})}
        onOpenAdminLogin={onOpenAdminLogin || (() => {})}
        onOpenDonorRegisterModal={onOpenDonorRegisterModal || (() => {})}
        onOpenRequestModal={onOpenRequestModal || (() => {})}
      />

      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer
        setActiveTab={onTabChange || (() => {})}
        onOpenAdminLogin={onOpenAdminLogin || (() => {})}
      />
    </div>
  );
};
