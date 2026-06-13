import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import BarChart from '@/components/ui/BarChart';
import DonutChart from '@/components/ui/DonutChart';
import * as db from '@/services/db';
import { predictMatch, INFLUENCER_CATEGORIES, CAMPAIGN_CATEGORIES, type MLPredictionOutput } from '@/services/ml';
import { Target, Users, DollarSign, Briefcase, ArrowUpRight, Bot, Zap, Brain, CheckCircle2, AlertTriangle, XCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BrandOverview() {
  const { user } = useAuthStore();
  const brand = user ? db.getBrandByUserId(user.id) : null;

  const campaigns = useMemo(() => brand ? db.getCampaignsByBrand(brand.id) : [], [brand]);
  const collabs = useMemo(() => brand ? db.getCollaborationsByBrand(brand.id) : [], [brand]);
  const allApps = useMemo(() => {
    const ids = campaigns.map(c => c.id);
    return db.getApplications().filter(a => ids.includes(a.campaignId));
  }, [campaigns]);

  const active = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const pendingApps = allApps.filter(a => a.status === 'pending').length;
  const totalSpent = collabs.reduce((s, c) => s + c.agreedRate, 0);

  const statusCounts = {
    active: campaigns.filter(c => c.status === 'active').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
  };

  const monthlyData = [
    { label: 'Jan', value: 2 }, { label: 'Feb', value: 3 }, { label: 'Mar', value: 1 },
    { label: 'Apr', value: 4 }, { label: 'May', value: 2 }, { label: 'Jun', value: 5 },
    { label: 'Jul', value: 3 }, { label: 'Aug', value: 6 }, { label: 'Sep', value: 4 },
    { label: 'Oct', value: 3 }, { label: 'Nov', value: 5 }, { label: 'Dec', value: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName} 👋</h1>
          <p className="text-surface-400 text-sm mt-1">{brand?.companyName} · Here's your brand overview</p>
        </div>
        <Link to="/dashboard/campaigns" className="gradient-btn flex items-center gap-2 text-sm self-start">
          <Target className="w-4 h-4" /> Manage Campaigns
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Total Campaigns" value={campaigns.length} change={`${active} active`} positive color="purple" />
        <StatCard icon={Users} label="Pending Applicants" value={pendingApps} change={`${allApps.length} total`} positive color="pink" />
        <StatCard icon={DollarSign} label="Total Budget" value={`$${(totalBudget / 1000).toFixed(0)}K`} change="+12%" positive color="green" />
        <StatCard icon={Briefcase} label="Collaborations" value={collabs.length} change={`$${totalSpent.toLocaleString()} spent`} positive color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <BarChart data={monthlyData} title="Campaign Activity" subtitle="Campaigns launched per month" height={200} />
        </GlassCard>
        <GlassCard>
          <h4 className="text-sm font-semibold text-white mb-4">Campaign Status</h4>
          <DonutChart
            segments={[
              { label: 'Active', value: statusCounts.active, color: '#10b981' },
              { label: 'Draft', value: statusCounts.draft, color: '#71717a' },
              { label: 'Paused', value: statusCounts.paused, color: '#f59e0b' },
              { label: 'Completed', value: statusCounts.completed, color: '#a855f7' },
            ]}
            size={150}
            centerValue={String(campaigns.length)}
            centerLabel="Total"
          />
        </GlassCard>
      </div>

      {/* Recent Activity & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">Recent Applications</h4>
              <Link to="/dashboard/applicants" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
            {allApps.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-8">No applications yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-white/5">
                    <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Influencer</th>
                    <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Campaign</th>
                    <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Rate</th>
                    <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {allApps.slice(0, 5).map(app => (
                      <tr key={app.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-[10px] font-bold text-white">{(app.influencerName || 'U')[0]}</div>
                            <div>
                              <p className="text-xs font-medium text-white">{app.influencerName || 'Unknown'}</p>
                              <p className="text-[10px] text-surface-500">{((app.influencerFollowers || 0) / 1000).toFixed(0)}K followers</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-xs text-surface-300 max-w-[120px] truncate">{app.campaignTitle}</td>
                        <td className="py-3 pr-3 text-xs text-surface-300">${app.proposedRate}</td>
                        <td className="py-3">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                            app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>{app.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        {/* AI Insights */}
        <GlassCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-white">AI Insights</h4>
            </div>
            <div className="space-y-3">
              {[
                'Your "Summer Launch" campaign has 3 pending applications with high engagement scores.',
                'Fitness & Health influencers have 23% higher conversion rates for your audience.',
                'Consider increasing your Back to School budget — demand is trending up.',
                'Top-performing posts from your collaborations peak between 6-8 PM EST.',
              ].map((tip, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-surface-300 leading-relaxed">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ML Quick Predict Widget */}
      <MLQuickPredict />

      {/* AI Generator Quick Widget */}
      <GlassCard className="relative overflow-hidden border border-accent-500/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-primary-500 to-accent-500" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">AI Content Generator</h4>
                <p className="text-[10px] text-surface-500">Captions · Proposals · Outreach Messages</p>
              </div>
            </div>
            <Link to="/dashboard/ai-generator" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              Open Generator <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/dashboard/ai-generator" className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-primary-500/20 transition-all group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center mb-2 group-hover:bg-primary-500/20 transition-colors"><Bot className="w-4 h-4 text-primary-400" /></div>
              <p className="text-xs font-medium text-white mb-0.5">Social Captions</p>
              <p className="text-[10px] text-surface-500">Generate platform-optimized captions for your campaigns</p>
            </Link>
            <Link to="/dashboard/ai-generator" className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-primary-500/20 transition-all group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center mb-2 group-hover:bg-accent-500/20 transition-colors"><Zap className="w-4 h-4 text-accent-400" /></div>
              <p className="text-xs font-medium text-white mb-0.5">Campaign Proposals</p>
              <p className="text-[10px] text-surface-500">Create compelling proposals for influencer collaborations</p>
            </Link>
            <Link to="/dashboard/ai-generator" className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-primary-500/20 transition-all group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2 group-hover:bg-blue-500/20 transition-colors"><Target className="w-4 h-4 text-blue-400" /></div>
              <p className="text-xs font-medium text-white mb-0.5">Outreach Messages</p>
              <p className="text-[10px] text-surface-500">Personalized invitation & follow-up messages</p>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Active Collaborations */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white">Active Collaborations</h4>
          <Link to="/dashboard/collaborations" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
        </div>
        {collabs.length === 0 ? (
          <p className="text-sm text-surface-500 text-center py-8">No collaborations yet</p>
        ) : (
          <div className="space-y-3">
            {collabs.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white shrink-0">{(c.influencerName || 'U')[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.campaignTitle}</p>
                  <p className="text-[10px] text-surface-500">{c.influencerName} · ${c.agreedRate}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  c.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                  c.status === 'content_review' ? 'bg-yellow-500/10 text-yellow-400' :
                  c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-surface-500/10 text-surface-400'
                }`}>{c.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ─── ML Quick Predict Widget ─────────────────────────────────
function MLQuickPredict() {
  const [infCat, setInfCat] = useState('Fitness');
  const [campCat, setCampCat] = useState('Fitness');
  const [followers, setFollowers] = useState('50000');
  const [engagement, setEngagement] = useState('6.5');
  const [audience, setAudience] = useState('85');
  const [prevPerf, setPrevPerf] = useState('90');
  const [result, setResult] = useState<MLPredictionOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      const r = predictMatch({
        influencer_category: infCat,
        followers_count: Number(followers),
        engagement_rate: Number(engagement),
        campaign_category: campCat,
        audience_match_score: Number(audience),
        previous_performance: Number(prevPerf),
      });
      setResult(r);
      setLoading(false);
    }, 400);
  };

  const predStyle = (p: string) => p === 'Strong Match'
    ? { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', Icon: CheckCircle2 }
    : p === 'Moderate Match'
    ? { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', Icon: AlertTriangle }
    : { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', Icon: XCircle };

  return (
    <GlassCard className="relative overflow-hidden border border-primary-500/10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">AI Match Predictor</h4>
              <p className="text-[10px] text-surface-500">KNN Model · 93.5% accuracy</p>
            </div>
          </div>
          <Link to="/dashboard/ml-predict" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            Full Predictor <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div>
            <label className="text-[10px] text-surface-500 mb-1 block">Influencer Cat.</label>
            <select value={infCat} onChange={e => setInfCat(e.target.value)} className="input-field !py-1.5 !text-xs !rounded-lg">{INFLUENCER_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div>
            <label className="text-[10px] text-surface-500 mb-1 block">Campaign Cat.</label>
            <select value={campCat} onChange={e => setCampCat(e.target.value)} className="input-field !py-1.5 !text-xs !rounded-lg">{CAMPAIGN_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div>
            <label className="text-[10px] text-surface-500 mb-1 block">Followers</label>
            <input type="number" value={followers} onChange={e => setFollowers(e.target.value)} className="input-field !py-1.5 !text-xs !rounded-lg" />
          </div>
          <div>
            <label className="text-[10px] text-surface-500 mb-1 block">Engagement %</label>
            <input type="number" step="0.1" value={engagement} onChange={e => setEngagement(e.target.value)} className="input-field !py-1.5 !text-xs !rounded-lg" />
          </div>
          <div>
            <label className="text-[10px] text-surface-500 mb-1 block">Audience Score</label>
            <input type="number" value={audience} onChange={e => setAudience(e.target.value)} className="input-field !py-1.5 !text-xs !rounded-lg" />
          </div>
          <div>
            <label className="text-[10px] text-surface-500 mb-1 block">Prev. Performance</label>
            <input type="number" value={prevPerf} onChange={e => setPrevPerf(e.target.value)} className="input-field !py-1.5 !text-xs !rounded-lg" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <button onClick={handlePredict} disabled={loading} className="gradient-btn !py-2 text-xs flex items-center gap-1.5 disabled:opacity-50">
            {loading ? <><Sparkles className="w-3.5 h-3.5 animate-spin" /> Running KNN...</> : <><Bot className="w-3.5 h-3.5" /> Predict Match</>}
          </button>

          {result && (() => {
            const s = predStyle(result.prediction);
            return (
              <div className={`flex-1 flex items-center gap-4 p-3 rounded-xl ${s.bg} border ${s.border}`}>
                <s.Icon className={`w-8 h-8 ${s.text} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${s.text}`}>{result.prediction}</p>
                  <p className="text-[10px] text-surface-400">Confidence: {result.confidence} · Score: {result.matchScore}/100</p>
                </div>
                <div className="hidden sm:flex gap-1.5 shrink-0">
                  {Object.entries(result.probabilities).map(([label, pct]) => {
                    const ps = predStyle(label);
                    return <span key={label} className={`text-[9px] px-1.5 py-0.5 rounded ${ps.bg} ${ps.text}`}>{pct}</span>;
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </GlassCard>
  );
}
