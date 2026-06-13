import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import * as db from '@/services/db';
import {
  Search, Users, CheckCircle2, XCircle, Clock, DollarSign,
  TrendingUp, ChevronDown,
} from 'lucide-react';

export default function ApplicantsPage() {
  const { user } = useAuthStore();
  const brand = user ? db.getBrandByUserId(user.id) : null;
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const campaigns = useMemo(() => brand ? db.getCampaignsByBrand(brand.id) : [], [brand]);
  const applications = useMemo(() => {
    const cIds = campaigns.map(c => c.id);
    let apps = db.getApplications().filter(a => cIds.includes(a.campaignId));
    if (filterStatus !== 'all') apps = apps.filter(a => a.status === filterStatus);
    if (filterCampaign !== 'all') apps = apps.filter(a => a.campaignId === filterCampaign);
    if (searchQ) apps = apps.filter(a => (a.influencerName || '').toLowerCase().includes(searchQ.toLowerCase()));
    return apps;
    // eslint-disable-next-line
  }, [campaigns, filterStatus, filterCampaign, searchQ, refresh]);

  const handleAccept = (id: string) => {
    db.updateApplicationStatus(id, 'accepted');
    // Create collaboration
    const app = db.getApplications().find(a => a.id === id);
    if (app && brand) {
      const camp = db.getCampaignById(app.campaignId);
      db.createCollaboration({
        campaignId: app.campaignId, campaignTitle: camp?.title || '',
        brandId: brand.id, brandName: brand.companyName,
        influencerId: app.influencerId, influencerName: app.influencerName || '',
        status: 'in_progress', agreedRate: app.proposedRate,
        deliverables: 'As per campaign requirements',
        startDate: camp?.startDate || '', endDate: camp?.endDate || '',
      });
    }
    setRefresh(r => r + 1);
  };

  const handleReject = (id: string) => { db.updateApplicationStatus(id, 'rejected'); setRefresh(r => r + 1); };

  const statusIcon = (s: string) => s === 'pending' ? <Clock className="w-3 h-3" /> : s === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />;
  const statusColor = (s: string) => s === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : s === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400';

  const pending = applications.filter(a => a.status === 'pending').length;
  const accepted = applications.filter(a => a.status === 'accepted').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Applicants</h1>
        <p className="text-surface-400 text-sm">Review and manage influencer applications ({pending} pending, {accepted} accepted)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search by influencer name..." className="input-field !pl-10 !py-2.5" />
        </div>
        <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)} className="input-field !py-2.5 !w-auto">
          <option value="all">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field !py-2.5 !w-auto">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {applications.length === 0 ? (
        <GlassCard className="text-center py-16"><Users className="w-10 h-10 text-surface-600 mx-auto mb-3" /><p className="text-surface-400 text-sm">No applications found</p></GlassCard>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <GlassCard key={app.id} className="!p-0 overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-sm font-bold text-white shrink-0">{(app.influencerName || 'U')[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white flex items-center gap-1.5 truncate">{app.influencerName || 'Unknown'}<span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColor(app.status)} flex items-center gap-0.5`}>{statusIcon(app.status)}{app.status}</span></p>
                    <p className="text-xs text-surface-400 truncate">{app.campaignTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-400 shrink-0">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{((app.influencerFollowers || 0) / 1000).toFixed(0)}K</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{app.influencerEngagement || 0}%</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium"><DollarSign className="w-3 h-3" />{app.proposedRate}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => handleAccept(app.id)} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Accept</button>
                      <button onClick={() => handleReject(app.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all flex items-center gap-1"><XCircle className="w-3 h-3" />Reject</button>
                    </>
                  )}
                  <button onClick={() => setExpandedId(expandedId === app.id ? null : app.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-400"><ChevronDown className={`w-4 h-4 transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`} /></button>
                </div>
              </div>
              {expandedId === app.id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Category</p><p className="text-sm text-white">{app.influencerCategory || '-'}</p></div>
                    <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Applied</p><p className="text-sm text-white">{new Date(app.createdAt).toLocaleDateString()}</p></div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Proposal</p><p className="text-sm text-surface-300">{app.proposal}</p></div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
