import React from 'react';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

interface PublicLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenDonorRegisterModal?: () => void;
  onOpenRequestModal?: () => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  activeTab = 'home',
  onTabChange,
  onOpenDonorRegisterModal,
  onOpenRequestModal,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={onTabChange || (() => {})}
        onOpenDonorRegisterModal={onOpenDonorRegisterModal || (() => {})}
        onOpenRequestModal={onOpenRequestModal || (() => {})}
      />

      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer
        setActiveTab={onTabChange || (() => {})}
      />
    </div>
  );
};
