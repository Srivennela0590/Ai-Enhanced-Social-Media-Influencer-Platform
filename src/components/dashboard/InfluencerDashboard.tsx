import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import BarChart from '@/components/ui/BarChart';
import DonutChart from '@/components/ui/DonutChart';
import * as db from '@/services/db';
import {
  Heart, TrendingUp, DollarSign, Briefcase, ArrowUpRight, Bot, Zap, Send,
  Clock, CheckCircle2, XCircle, Star, Calendar, Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InfluencerOverview() {
  const { user } = useAuthStore();
  const inf = user ? db.getInfluencerByUserId(user.id) : null;

  const apps = useMemo(() => inf ? db.getApplicationsByInfluencer(inf.id) : [], [inf]);
  const collabs = useMemo(() => inf ? db.getCollaborationsByInfluencer(inf.id) : [], [inf]);
  const invitations = useMemo(() => inf ? db.getInvitationsByInfluencer(inf.id) : [], [inf]);
  const pendingInv = invitations.filter(i => i.status === 'pending').length;

  const totalEarned = collabs.filter(c => c.status === 'completed').reduce((s, c) => s + c.agreedRate, 0);
  const activeCollabs = collabs.filter(c => c.status !== 'completed' && c.status !== 'disputed').length;
  const completedCollabs = collabs.filter(c => c.status === 'completed').length;

  const weeklyEngagement = [
    { label: 'Mon', value: 4200 }, { label: 'Tue', value: 5800 }, { label: 'Wed', value: 3900 },
    { label: 'Thu', value: 7200 }, { label: 'Fri', value: 6100 }, { label: 'Sat', value: 8400 }, { label: 'Sun', value: 5500 },
  ];

  const monthlyEarnings = [
    { label: 'Jan', value: 400 }, { label: 'Feb', value: 850 }, { label: 'Mar', value: 600 },
    { label: 'Apr', value: 1200 }, { label: 'May', value: 750 }, { label: 'Jun', value: 1600 },
    { label: 'Jul', value: 900 }, { label: 'Aug', value: 1400 }, { label: 'Sep', value: 1100 },
    { label: 'Oct', value: 1800 }, { label: 'Nov', value: 950 }, { label: 'Dec', value: 700 },
  ];

  const statusIcon = (s: string) => s === 'pending' ? <Clock className="w-3 h-3" /> : s === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />;
  const statusColor = (s: string) => s === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : s === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400';
  const collabColor = (s: string) => s === 'in_progress' ? 'bg-blue-500/10 text-blue-400' : s === 'content_review' ? 'bg-yellow-500/10 text-yellow-400' : s === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-500/10 text-surface-400';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary-500/25">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{inf?.displayName || user?.firstName}</h1>
            <p className="text-surface-400 text-sm">{inf?.category || inf?.niche} · {inf?.location || 'Location not set'}</p>
          </div>
        </div>
        <Link to="/dashboard/campaigns" className="gradient-btn flex items-center gap-2 text-sm self-start">
          <Send className="w-4 h-4" /> Browse Campaigns
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Heart} label="Followers" value={inf ? `${(inf.totalFollowers / 1000).toFixed(0)}K` : '0'} change="+5.2K" positive color="pink" />
        <StatCard icon={TrendingUp} label="Engagement" value={`${inf?.engagementRate || 0}%`} change="+0.4%" positive color="purple" />
        <StatCard icon={DollarSign} label="Earnings" value={`$${totalEarned.toLocaleString()}`} change="+18%" positive color="green" />
        <StatCard icon={Briefcase} label="Collaborations" value={collabs.length} change={`${pendingInv} invites`} positive color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <BarChart data={weeklyEngagement} title="Weekly Engagement" subtitle="Interactions across all platforms" height={200} gradient={['#ec4899', '#a855f7']} />
        </GlassCard>
        <GlassCard>
          <h4 className="text-sm font-semibold text-white mb-4">Application Status</h4>
          <DonutChart
            segments={[
              { label: 'Pending', value: Math.max(apps.filter(a => a.status === 'pending').length, 0), color: '#f59e0b' },
              { label: 'Accepted', value: Math.max(apps.filter(a => a.status === 'accepted').length, 0), color: '#10b981' },
              { label: 'Rejected', value: Math.max(apps.filter(a => a.status === 'rejected').length, 0), color: '#ef4444' },
            ]}
            size={150}
            centerValue={String(apps.length)}
            centerLabel="Total"
          />
        </GlassCard>
      </div>

      {/* Applied Campaigns Table & Invitations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applied Campaigns */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2"><Target className="w-4 h-4 text-primary-400" /> Applied Campaigns</h4>
            <Link to="/dashboard/applications" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          {apps.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-6">No applications yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Campaign</th>
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Rate</th>
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-white/5">
                  {apps.slice(0, 5).map(app => (
                    <tr key={app.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-3 text-xs text-white max-w-[180px] truncate">{app.campaignTitle}</td>
                      <td className="py-2.5 pr-3 text-xs text-surface-300">${app.proposedRate}</td>
                      <td className="py-2.5"><span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${statusColor(app.status)}`}>{statusIcon(app.status)}{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Pending Invitations */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2"><Send className="w-4 h-4 text-accent-400" /> Invitations</h4>
            <Link to="/dashboard/invitations" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          {invitations.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-6">No invitations yet</p>
          ) : (
            <div className="space-y-2.5">
              {invitations.slice(0, 5).map(inv => (
                <div key={inv.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{(inv.brandName || 'B')[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{inv.campaignTitle}</p>
                    <p className="text-[10px] text-surface-500">{inv.brandName}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${inv.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{inv.status}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Earnings Analytics & Collaboration History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <GlassCard className="lg:col-span-2">
          <BarChart data={monthlyEarnings} title="Monthly Earnings" subtitle="Revenue from completed campaigns" height={180} gradient={['#10b981', '#a855f7']} />
        </GlassCard>

        {/* Quick Stats Summary */}
        <GlassCard>
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Performance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-xs text-surface-400">Campaign Score</span>
              <span className="text-sm font-bold text-white">{inf?.previousCampaignScore || 0}/100</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-xs text-surface-400">Active Collabs</span>
              <span className="text-sm font-bold text-blue-400">{activeCollabs}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-xs text-surface-400">Completed</span>
              <span className="text-sm font-bold text-emerald-400">{completedCollabs}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-xs text-surface-400">Avg. Rate</span>
              <span className="text-sm font-bold text-white">${inf?.pricePerPost || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-xs text-surface-400">Total Earned</span>
              <span className="text-sm font-bold gradient-text">${totalEarned.toLocaleString()}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Collaboration History Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-400" /> Collaboration History</h4>
          <Link to="/dashboard/history" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">Full history <ArrowUpRight className="w-3 h-3" /></Link>
        </div>
        {collabs.length === 0 ? (
          <p className="text-sm text-surface-500 text-center py-6">No collaborations yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Campaign</th>
                <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Brand</th>
                <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Rate</th>
                <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">End Date</th>
                <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Status</th>
                <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Rating</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {collabs.slice(0, 6).map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3 text-xs text-white max-w-[160px] truncate">{c.campaignTitle}</td>
                    <td className="py-2.5 pr-3 text-xs text-surface-300">{c.brandName}</td>
                    <td className="py-2.5 pr-3 text-xs text-emerald-400 font-medium">${c.agreedRate}</td>
                    <td className="py-2.5 pr-3 text-xs text-surface-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{c.endDate || 'TBD'}</td>
                    <td className="py-2.5 pr-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${collabColor(c.status)}`}>{c.status.replace('_', ' ')}</span></td>
                    <td className="py-2.5">{c.rating ? <span className="flex items-center gap-0.5 text-xs text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{c.rating}</span> : <span className="text-[10px] text-surface-600">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* AI Growth Tips */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <h4 className="text-sm font-semibold text-white">AI Growth Tips</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Post Reels between 6-8 PM for 34% more engagement with your audience.',
              'Your tech content outperforms lifestyle posts — double down on reviews.',
              `You have ${pendingInv} pending invitation${pendingInv !== 1 ? 's' : ''} from brands — respond soon!`,
              'Consider updating your rate — creators with similar stats charge 20% more.',
              'Video content generates 3.2x more engagement than static posts.',
              'Brands in your niche are increasing Q4 budgets by 40% on average.',
            ].map((tip, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-accent-400 mt-0.5 shrink-0" /><p className="text-[11px] text-surface-300 leading-relaxed">{tip}</p></div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
