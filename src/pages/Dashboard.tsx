import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Brand pages
import BrandOverview from '@/components/dashboard/BrandDashboard';
import BrandCampaignsPage from '@/pages/brand/CampaignsPage';
import SearchInfluencersPage from '@/pages/brand/SearchInfluencersPage';
import ApplicantsPage from '@/pages/brand/ApplicantsPage';
import AnalyticsPage from '@/pages/brand/AnalyticsPage';
import MLPredictionPage from '@/pages/brand/MLPredictionPage';
import AIGeneratorPage from '@/pages/brand/AIGeneratorPage';

// Influencer pages
import InfluencerOverview from '@/components/dashboard/InfluencerDashboard';
import InfluencerProfilePage from '@/pages/influencer/ProfilePage';
import InvitationsPage from '@/pages/influencer/InvitationsPage';
import BrowseCampaignsPage from '@/pages/influencer/BrowseCampaignsPage';
import ApplicationsPage from '@/pages/influencer/ApplicationsPage';
import HistoryPage from '@/pages/influencer/HistoryPage';

// Shared pages
import CollaborationsPage from '@/pages/shared/CollaborationsPage';
import SettingsPage from '@/pages/shared/SettingsPage';
import MessagesPage from '@/pages/shared/MessagesPage';

export default function Dashboard() {
  const { user } = useAuthStore();
  if (!user) return null;

  const isBrand = user.role === 'brand';

  return (
    <DashboardLayout>
      <Routes>
        {/* Overview (role-based) */}
        <Route index element={isBrand ? <BrandOverview /> : <InfluencerOverview />} />

        {/* Brand-only routes */}
        {isBrand && (
          <>
            <Route path="campaigns" element={<BrandCampaignsPage />} />
            <Route path="influencers" element={<SearchInfluencersPage />} />
            <Route path="applicants" element={<ApplicantsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="ml-predict" element={<MLPredictionPage />} />
            <Route path="ai-generator" element={<AIGeneratorPage />} />
          </>
        )}

        {/* Influencer-only routes */}
        {!isBrand && (
          <>
            <Route path="profile" element={<InfluencerProfilePage />} />
            <Route path="invitations" element={<InvitationsPage />} />
            <Route path="campaigns" element={<BrowseCampaignsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="history" element={<HistoryPage />} />
          </>
        )}

        {/* Shared routes */}
        <Route path="collaborations" element={<CollaborationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="messages" element={<MessagesPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
