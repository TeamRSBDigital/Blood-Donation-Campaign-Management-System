import React, { useEffect, useState } from 'react';
import { HeroSection } from './HeroSection.js';
import { StatsSection } from './StatsSection.js';
import { AboutSection } from './AboutSection.js';
import { WhyDonateSection } from './WhyDonateSection.js';
import { HowItWorksSection } from './HowItWorksSection.js';
import { BloodGroupSelectorSection } from './BloodGroupSelectorSection.js';
import { RecentDonorsSection } from './RecentDonorsSection.js';
import { LatestRequestsSection } from './LatestRequestsSection.js';
import { VolunteerSection } from './VolunteerSection.js';
import { GallerySection } from './GallerySection.js';
import { FaqSection } from './FaqSection.js';
import { ContactSection } from './ContactSection.js';

import { BloodGroup, Donor, BloodRequest } from '../../types/index.js';
import { donorService } from '../../services/donorService.js';
import { apiClient } from '../../services/apiClient.js';

interface HomePageProps {
  onSelectBloodGroup: (group: BloodGroup) => void;
  onNavigateTab: (tab: string) => void;
  onOpenRequestModal: () => void;
  onOpenDonorRegisterModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectBloodGroup,
  onNavigateTab,
  onOpenRequestModal,
  onOpenDonorRegisterModal,
}) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        setLoading(true);
        const [donorsRes, requestsRes] = await Promise.all([
          donorService.getAllDonors(),
          apiClient<BloodRequest[]>('/blood-requests'),
        ]);

        if (isMounted) {
          if (donorsRes && Array.isArray(donorsRes)) {
            setDonors(donorsRes);
          }
          if (requestsRes.data && Array.isArray(requestsRes.data)) {
            setBloodRequests(requestsRes.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load live home data, fallback will be used:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const criticalRequestsCount = bloodRequests.filter(
    (r) => r.priority === 'CRITICAL' || r.priority === 'URGENT'
  ).length;

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection
        onSelectBloodGroup={onSelectBloodGroup}
        onPostRequestClick={onOpenRequestModal}
        onBecomeDonorClick={onOpenDonorRegisterModal}
        criticalRequestsCount={criticalRequestsCount || 2}
      />

      {/* 2. Statistics Section */}
      <StatsSection
        stats={{
          totalDonors: donors.length > 0 ? donors.length : 2540,
          availableDonors: donors.filter((d) => d.status === 'AVAILABLE').length || 1420,
          totalRequests: bloodRequests.length > 0 ? bloodRequests.length : 890,
          totalDonations: 1850,
        }}
      />

      {/* 3. About Section */}
      <AboutSection />

      {/* 4. Why Donate Section */}
      <WhyDonateSection />

      {/* 5. How It Works Section */}
      <HowItWorksSection />

      {/* 6. Blood Group Selector Section */}
      <BloodGroupSelectorSection
        onSelectGroup={(group) => {
          onSelectBloodGroup(group);
          onNavigateTab('search');
        }}
      />

      {/* 7. Recent Donors Section */}
      <RecentDonorsSection
        donors={donors}
        onViewAllDonorsClick={() => onNavigateTab('search')}
      />

      {/* 8. Latest Blood Requests Section */}
      <LatestRequestsSection
        requests={bloodRequests}
        onOpenNewRequestModal={onOpenRequestModal}
        onViewAllRequestsClick={() => onNavigateTab('requests')}
      />

      {/* 9. Volunteer Section */}
      <VolunteerSection onJoinVolunteerClick={onOpenDonorRegisterModal} />

      {/* 10. Gallery Section */}
      <GallerySection />

      {/* 11. FAQ Section */}
      <FaqSection />

      {/* 12. Contact Section */}
      <ContactSection />
    </div>
  );
};
