import React, { useState, lazy, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';

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
import { BloodGroup } from './types/index.js';
import { Loader2 } from 'lucide-react';

// Lazy load admin module for optimized initial bundle size
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.js').then(module => ({ default: module.AdminLayout })));

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      if (
        pathname.includes('/dashboard') ||
        pathname.includes('/admin') ||
        pathname.includes('/automation') ||
        pathname.includes('/system-health') ||
        pathname.includes('/backup')
      ) {
        return 'admin';
      }

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
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400">এডমিন ড্যাশবোর্ড লোড হচ্ছে...</p>
          </div>
        }
      >
        <AdminLayout onBackToPublicSite={() => setActiveTab('home')} />
      </Suspense>
    );
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
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
