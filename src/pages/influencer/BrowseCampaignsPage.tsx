import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import * as db from '@/services/db';
import {
  Search, Target, DollarSign, Calendar, Users, Eye, Send,
  CheckCircle2, Bot,
} from 'lucide-react';

const CATEGORIES = ['All', 'Technology', 'Fashion & Beauty', 'Fitness & Health', 'Food & Cooking', 'Travel & Adventure', 'Gaming', 'Education', 'Lifestyle'];

export default function BrowseCampaignsPage() {
  const { user } = useAuthStore();
  const inf = user ? db.getInfluencerByUserId(user.id) : null;
  const [searchQ, setSearchQ] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [viewModal, setViewModal] = useState<ReturnType<typeof db.getCampaignById> | null>(null);
  const [applyModal, setApplyModal] = useState<ReturnType<typeof db.getCampaignById> | null>(null);
  const [proposal, setProposal] = useState('');
  const [rate, setRate] = useState('');
  const [applied, setApplied] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const campaigns = useMemo(() => {
    let list = db.getCampaigns().filter(c => c.status === 'active');
    if (searchQ) list = list.filter(c => c.title.toLowerCase().includes(searchQ.toLowerCase()) || c.description.toLowerCase().includes(searchQ.toLowerCase()));
    if (catFilter !== 'All') list = list.filter(c => c.category === catFilter);
    return list;
  }, [searchQ, catFilter, refresh]);

  const myApps = useMemo(() => inf ? db.getApplicationsByInfluencer(inf.id) : [], [inf, refresh]);
  const hasApplied = (campaignId: string) => myApps.some(a => a.campaignId === campaignId);

  const handleApply = () => {
    if (!inf || !applyModal || !proposal) return;
    try {
      db.createApplication({
        campaignId: applyModal.id,
        campaignTitle: applyModal.title,
        influencerId: inf.id,
        influencerName: inf.displayName,
        influencerFollowers: inf.totalFollowers,
        influencerEngagement: inf.engagementRate,
        influencerCategory: inf.category,
        status: 'pending',
        proposal,
        proposedRate: Number(rate) || inf.pricePerPost || 0,
      });
      setApplied(true);
      setTimeout(() => { setApplied(false); setApplyModal(null); setProposal(''); setRate(''); setRefresh(r => r + 1); }, 1500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Browse Campaigns</h1>
          <p className="text-surface-400 text-sm">Find campaigns that match your profile and apply</p>
        </div>
        <button className="gradient-btn flex items-center gap-2 text-sm !py-2.5 self-start"><Bot className="w-4 h-4" />AI Match</button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search campaigns..." className="input-field !pl-10 !py-2.5" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-field !py-2.5 !w-auto">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
      </div>

      {campaigns.length === 0 ? (
        <GlassCard className="text-center py-16"><Target className="w-10 h-10 text-surface-600 mx-auto mb-3" /><p className="text-surface-400 text-sm">No active campaigns found</p></GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map(c => {
            const alreadyApplied = hasApplied(c.id);
            return (
              <GlassCard key={c.id} hover>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 uppercase">{c.status}</span>
                  {alreadyApplied && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />Applied</span>}
                </div>
                <h3 className="text-base font-semibold text-white mb-0.5">{c.title}</h3>
                <p className="text-[11px] text-primary-400 mb-2">{c.brandName || 'Brand'} · {c.category}</p>
                <p className="text-xs text-surface-400 mb-3 line-clamp-2">{c.description}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="flex items-center gap-1 text-[11px] text-surface-400"><DollarSign className="w-3 h-3 text-emerald-400" />${c.budget.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-[11px] text-surface-400"><Calendar className="w-3 h-3 text-primary-400" />{c.endDate || 'TBD'}</div>
                  <div className="flex items-center gap-1 text-[11px] text-surface-400"><Users className="w-3 h-3 text-blue-400" />{db.getApplicationsByCampaign(c.id).length} applied</div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">{c.platforms?.map(p => <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-surface-400">{p}</span>)}</div>
                <div className="flex gap-2">
                  <button onClick={() => setApplyModal(c)} disabled={alreadyApplied} className={`flex-1 text-xs !py-2 ${alreadyApplied ? 'gradient-btn-outline opacity-50 cursor-not-allowed' : 'gradient-btn'}`}>
                    {alreadyApplied ? 'Already Applied' : <><Send className="w-3 h-3 inline mr-1" />Apply Now</>}
                  </button>
                  <button onClick={() => setViewModal(c)} className="gradient-btn-outline text-xs !py-2 !px-3"><Eye className="w-3.5 h-3.5" /></button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Campaign Details" wide>
        {viewModal && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">{viewModal.title}</h3>
            <p className="text-sm text-primary-400">{viewModal.brandName} · {viewModal.category}</p>
            <p className="text-sm text-surface-300">{viewModal.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Budget</p><p className="text-sm text-white">${viewModal.budget.toLocaleString()}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Target Audience</p><p className="text-sm text-white">{viewModal.targetAudience || '-'}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Start Date</p><p className="text-sm text-white">{viewModal.startDate || '-'}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">End Date</p><p className="text-sm text-white">{viewModal.endDate || '-'}</p></div>
            </div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Requirements</p><p className="text-sm text-surface-300">{viewModal.requirements || '-'}</p></div>
          </div>
        )}
      </Modal>

      {/* Apply Modal */}
      <Modal open={!!applyModal} onClose={() => { setApplyModal(null); setApplied(false); }} title={applied ? 'Application Sent!' : `Apply to: ${applyModal?.title || ''}`}>
        {applied ? (
          <div className="text-center py-6"><CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" /><p className="text-white font-medium">Application submitted successfully!</p></div>
        ) : (
          <div className="space-y-4">
            <div><label className="text-xs font-medium text-surface-300 mb-1.5 block">Your Proposal *</label><textarea value={proposal} onChange={e => setProposal(e.target.value)} className="input-field !py-2.5 resize-none" rows={4} placeholder="Describe how you would approach this campaign..." /></div>
            <div><label className="text-xs font-medium text-surface-300 mb-1.5 block">Proposed Rate ($)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} className="input-field !py-2.5" placeholder={String(inf?.pricePerPost || 0)} /></div>
            <div className="flex gap-3">
              <button onClick={() => setApplyModal(null)} className="gradient-btn-outline flex-1 text-sm !py-2.5">Cancel</button>
              <button onClick={handleApply} disabled={!proposal} className="gradient-btn flex-1 text-sm !py-2.5 disabled:opacity-50">Submit Application</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
