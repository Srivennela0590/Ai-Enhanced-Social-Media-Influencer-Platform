import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import BarChart from '@/components/ui/BarChart';
import DonutChart from '@/components/ui/DonutChart';
import * as db from '@/services/db';
import { DollarSign, Users, Target, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const brand = user ? db.getBrandByUserId(user.id) : null;

  const campaigns = useMemo(() => brand ? db.getCampaignsByBrand(brand.id) : [], [brand]);
  const collabs = useMemo(() => brand ? db.getCollaborationsByBrand(brand.id) : [], [brand]);
  const allApps = useMemo(() => {
    const ids = campaigns.map(c => c.id);
    return db.getApplications().filter(a => ids.includes(a.campaignId));
  }, [campaigns]);

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = collabs.reduce((s, c) => s + c.agreedRate, 0);
  const avgEngagement = allApps.length > 0 ? (allApps.reduce((s, a) => s + (a.influencerEngagement || 0), 0) / allApps.length).toFixed(1) : '0';

  const budgetByCategory: Record<string, number> = {};
  campaigns.forEach(c => { budgetByCategory[c.category] = (budgetByCategory[c.category] || 0) + c.budget; });
  const catColors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const budgetSegments = Object.entries(budgetByCategory).map(([label, value], i) => ({ label, value, color: catColors[i % catColors.length] }));

  const monthlySpend = [
    { label: 'Jan', value: 2500 }, { label: 'Feb', value: 4200 }, { label: 'Mar', value: 1800 },
    { label: 'Apr', value: 6500 }, { label: 'May', value: 3200 }, { label: 'Jun', value: 8000 },
    { label: 'Jul', value: 5500 }, { label: 'Aug', value: 7200 }, { label: 'Sep', value: 4800 },
    { label: 'Oct', value: 9100 }, { label: 'Nov', value: 6300 }, { label: 'Dec', value: 3500 },
  ];

  const platformApps: Record<string, number> = {};
  campaigns.forEach(c => c.platforms?.forEach(p => { platformApps[p] = (platformApps[p] || 0) + db.getApplicationsByCampaign(c.id).length; }));
  const platformData = Object.entries(platformApps).map(([label, value]) => ({ label, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-surface-400 text-sm">Campaign performance and spending insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Budget" value={`$${(totalBudget / 1000).toFixed(0)}K`} color="green" />
        <StatCard icon={Target} label="Total Spent" value={`$${totalSpent.toLocaleString()}`} color="purple" />
        <StatCard icon={Users} label="Total Applicants" value={allApps.length} color="pink" />
        <StatCard icon={TrendingUp} label="Avg. Engagement" value={`${avgEngagement}%`} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <BarChart data={monthlySpend} title="Monthly Spending" subtitle="Budget distribution over time" height={220} />
        </GlassCard>
        <GlassCard>
          <h4 className="text-sm font-semibold text-white mb-4">Budget by Category</h4>
          <DonutChart segments={budgetSegments.length > 0 ? budgetSegments : [{ label: 'None', value: 1, color: '#71717a' }]} size={180} thickness={24} centerValue={`$${(totalBudget / 1000).toFixed(0)}K`} centerLabel="Total Budget" />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <BarChart data={platformData.length > 0 ? platformData : [{ label: 'N/A', value: 0 }]} title="Applicants by Platform" subtitle="Which platforms attract the most influencers" height={180} gradient={['#3b82f6', '#a855f7']} />
        </GlassCard>
        <GlassCard>
          <h4 className="text-sm font-semibold text-white mb-4">Campaign Performance</h4>
          <div className="space-y-3">
            {campaigns.slice(0, 5).map(c => {
              const apps = db.getApplicationsByCampaign(c.id).length;
              const accepted = db.getApplicationsByCampaign(c.id).filter(a => a.status === 'accepted').length;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{c.title}</p>
                    <div className="w-full h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${apps > 0 ? Math.min((accepted / apps) * 100, 100) : 0}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-surface-400 shrink-0">{accepted}/{apps}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
