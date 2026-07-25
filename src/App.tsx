import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';

import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './components/home/HomePage.js';
import { DonorSearch } from './components/DonorSearch.js';
import { PublicRequestBoard } from './components/PublicRequestBoard.js';
import { PublicBloodRequestPage } from './components/PublicBloodRequestPage.js';
import { PublicBloodRequestForm } from './components/PublicBloodRequestForm.js';
import { CampaignsSection } from './components/CampaignsSection.js';
import { BecomeDonorSection } from './components/BecomeDonorSection.js';
import { EmergencyDirectory } from './components/EmergencyDirectory.js';
import { AdminLoginModal } from './components/AdminLoginModal.js';
import { AdminLayout } from './components/admin/AdminLayout.js';

import { BloodGroup } from './types/index.js';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      if (
        pathname.includes('/request-blood') ||
        pathname.includes('/request_blood')
      ) {
        return 'request-blood';
      }
      if (
        pathname.includes('/search') ||
        searchParams.has('blood_group') ||
        searchParams.has('bloodGroup')
      ) {
        return 'search';
      }
    }
    return 'home';
  });

  // Selected blood group filter passed from Hero or Request board to DonorSearch
  const [heroSelectedGroup, setHeroSelectedGroup] = useState<BloodGroup | null>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const groupParam = searchParams.get('blood_group') || searchParams.get('bloodGroup');
      if (groupParam) return groupParam as BloodGroup;
    }
    return null;
  });

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Handle hero or request matcher clicking a blood group
  const handleSelectBloodGroup = (group: BloodGroup) => {
    setHeroSelectedGroup(group);
    setActiveTab('search');
  };

  // If in admin view mode and authenticated
  if (activeTab === 'admin' && user) {
    return <AdminLayout onBackToPublicSite={() => setActiveTab('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-red-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'admin') {
            if (user) {
              setActiveTab('admin');
            } else {
              setIsLoginModalOpen(true);
            }
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenPublicRequestModal={() => setActiveTab('request-blood')}
      />

      {/* Main View Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onSelectBloodGroup={handleSelectBloodGroup}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenRequestModal={() => setIsRequestModalOpen(true)}
            onOpenDonorRegisterModal={() => setActiveTab('register')}
          />
        )}

        {activeTab === 'search' && (
          <DonorSearch initialBloodGroup={heroSelectedGroup} />
        )}

        {activeTab === 'requests' && (
          <PublicRequestBoard
            onOpenNewRequestModal={() => setActiveTab('request-blood')}
            onFilterDonorsForGroup={(group) => handleSelectBloodGroup(group)}
          />
        )}

        {activeTab === 'request-blood' && (
          <PublicBloodRequestPage onNavigateRequests={() => setActiveTab('requests')} />
        )}

        {activeTab === 'campaigns' && <CampaignsSection />}

        {activeTab === 'register' && <BecomeDonorSection />}

        {activeTab === 'emergency' && <EmergencyDirectory />}
      </main>

      {/* Footer */}
      <Footer onTabChange={(tab) => setActiveTab(tab)} />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={() => setActiveTab('admin')}
      />

      {/* Public Blood Request Post Modal */}
      <PublicBloodRequestForm
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestSubmitted={() => {
          setActiveTab('requests');
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
