import React, { useState, lazy, Suspense, useEffect } from 'react';
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
import { GallerySection } from './components/home/GallerySection.js';
import { ContactSection } from './components/home/ContactSection.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { AdminLoginPage } from './components/AdminLoginPage.js';
import { BloodGroup } from './types/index.js';
import { Loader2 } from 'lucide-react';

// Lazy load admin module for optimized initial bundle size
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.js').then(module => ({ default: module.AdminLayout })));

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
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
      if (pathname.includes('/gallery')) {
        return 'gallery';
      }
      if (pathname.includes('/contact')) {
        return 'contact';
      }
    }
    return 'home';
  });

  // Handle URL changes & popstate
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname.toLowerCase();
        if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
          setActiveTab('admin');
        } else if (pathname.includes('/search')) {
          setActiveTab('search');
        } else if (pathname.includes('/request-blood')) {
          setActiveTab('request-blood');
        } else if (pathname.includes('/campaigns')) {
          setActiveTab('campaigns');
        } else if (pathname.includes('/register')) {
          setActiveTab('register');
        } else if (pathname.includes('/emergency')) {
          setActiveTab('emergency');
        } else if (pathname.includes('/gallery')) {
          setActiveTab('gallery');
        } else if (pathname.includes('/contact')) {
          setActiveTab('contact');
        } else if (pathname === '/' || pathname === '') {
          setActiveTab('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Selected blood group filter
  const [heroSelectedGroup, setHeroSelectedGroup] = useState<BloodGroup | null>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const groupParam = searchParams.get('blood_group') || searchParams.get('bloodGroup');
      if (groupParam) return groupParam as BloodGroup;
    }
    return null;
  });

  // Modal state for public blood requests
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Handle hero or request matcher clicking a blood group
  const handleSelectBloodGroup = (group: BloodGroup) => {
    setHeroSelectedGroup(group);
    setActiveTab('search');
  };

  // If activeTab is 'admin' (e.g. visiting /admin/login or /dashboard)
  if (activeTab === 'admin') {
    if (!isAuthenticated) {
      return (
        <AdminLoginPage
          onSuccessLogin={() => setActiveTab('admin')}
          onGoHome={() => {
            setActiveTab('home');
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
          }}
        />
      );
    }

    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            <p className="text-xs font-bold text-gray-600">এডমিন ড্যাশবোর্ড লোড হচ্ছে...</p>
          </div>
        }
      >
        <AdminLayout onBackToPublicSite={() => {
          setActiveTab('home');
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
        }} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-red-600 selection:text-white pb-16 md:pb-0">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
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

        {activeTab === 'gallery' && <GallerySection />}

        {activeTab === 'contact' && <ContactSection />}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Mobile Bottom Navigation Bar & Sheet (Mobile only < 768px) */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

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
