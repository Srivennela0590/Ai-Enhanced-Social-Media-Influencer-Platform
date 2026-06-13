import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import * as db from '@/services/db';
import type { Influencer } from '@/types';
import {
  Search, Users, CheckCircle2, Eye, Send, MapPin, Star, Heart,
  TrendingUp, DollarSign, Filter, Bot,
} from 'lucide-react';

const CATEGORIES = ['All', 'Technology', 'Fashion & Beauty', 'Fitness & Health', 'Food & Cooking', 'Travel & Adventure', 'Gaming', 'Education', 'Lifestyle & Wellness'];

export default function SearchInfluencersPage() {
  const { user } = useAuthStore();
  const brand = user ? db.getBrandByUserId(user.id) : null;
  const [searchQ, setSearchQ] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState<Influencer | null>(null);
  const [inviteModal, setInviteModal] = useState<Influencer | null>(null);
  const [invCampaign, setInvCampaign] = useState('');
  const [invMessage, setInvMessage] = useState('');
  const [invSent, setInvSent] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const campaigns = useMemo(() => brand ? db.getCampaignsByBrand(brand.id).filter(c => c.status === 'active') : [], [brand, refresh]);

  const influencers = useMemo(() => {
    let list = db.getInfluencers();
    if (searchQ) list = list.filter(i => i.displayName.toLowerCase().includes(searchQ.toLowerCase()) || i.category?.toLowerCase().includes(searchQ.toLowerCase()) || i.niche?.toLowerCase().includes(searchQ.toLowerCase()));
    if (catFilter !== 'All') list = list.filter(i => i.category === catFilter);
    if (minFollowers) list = list.filter(i => i.totalFollowers >= Number(minFollowers));
    if (maxRate) list = list.filter(i => (i.pricePerPost || 0) <= Number(maxRate));
    return list;
  }, [searchQ, catFilter, minFollowers, maxRate, refresh]);

  const handleInvite = () => {
    if (!brand || !inviteModal || !invCampaign) return;
    try {
      const camp = db.getCampaignById(invCampaign);
      db.createInvitation({
        campaignId: invCampaign,
        campaignTitle: camp?.title || '',
        brandId: brand.id,
        brandName: brand.companyName,
        influencerId: inviteModal.id,
        influencerName: inviteModal.displayName,
        message: invMessage || 'We would love to collaborate with you!',
        status: 'pending',
      });
      setInvSent(true);
      setTimeout(() => { setInvSent(false); setInviteModal(null); setInvMessage(''); setInvCampaign(''); setRefresh(r => r + 1); }, 1500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Find Influencers</h1>
          <p className="text-surface-400 text-sm">Search and invite influencers to your campaigns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="gradient-btn-outline flex items-center gap-2 text-sm !py-2.5"><Filter className="w-4 h-4" />Filters</button>
          <button className="gradient-btn flex items-center gap-2 text-sm !py-2.5"><Bot className="w-4 h-4" />AI Recommend</button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search by name, category, niche..." className="input-field !pl-10 !py-2.5" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-field !py-2.5 !w-auto">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        {showFilters && (
          <GlassCard className="!p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><label className="text-[10px] text-surface-500 mb-1 block">Min Followers</label><input type="number" value={minFollowers} onChange={e => setMinFollowers(e.target.value)} className="input-field !py-2 text-sm" placeholder="e.g. 10000" /></div>
              <div><label className="text-[10px] text-surface-500 mb-1 block">Max Rate ($)</label><input type="number" value={maxRate} onChange={e => setMaxRate(e.target.value)} className="input-field !py-2 text-sm" placeholder="e.g. 1000" /></div>
              <div className="flex items-end"><button onClick={() => { setMinFollowers(''); setMaxRate(''); setCatFilter('All'); setSearchQ(''); }} className="text-xs text-primary-400 hover:text-primary-300">Clear all</button></div>
            </div>
          </GlassCard>
        )}
      </div>

      <p className="text-xs text-surface-500">{influencers.length} influencers found</p>

      {/* Influencer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {influencers.map(inf => (
          <GlassCard key={inf.id} className="group" hover>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-lg font-bold text-white shrink-0">{inf.displayName[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white flex items-center gap-1 truncate">{inf.displayName}{inf.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary-400 shrink-0" />}</p>
                <p className="text-[11px] text-surface-400">{inf.category || inf.niche}</p>
              </div>
              {inf.previousCampaignScore > 0 && (
                <div className="flex items-center gap-0.5 text-[10px] text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{inf.previousCampaignScore}</div>
              )}
            </div>
            <p className="text-xs text-surface-400 mb-3 line-clamp-2">{inf.bio}</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-sm font-bold text-white">{(inf.totalFollowers / 1000).toFixed(0)}K</p>
                <p className="text-[9px] text-surface-500">Followers</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-sm font-bold text-white">{inf.engagementRate}%</p>
                <p className="text-[9px] text-surface-500">Engagement</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-sm font-bold text-white">${inf.pricePerPost || '-'}</p>
                <p className="text-[9px] text-surface-500">Per Post</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-surface-500 mb-3">
              {inf.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{inf.location}</span>}
              <span>{inf.audienceAgeGroup} · {inf.audienceGender}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setInviteModal(inf)} className="flex-1 gradient-btn text-xs !py-2"><Send className="w-3 h-3 inline mr-1" />Invite</button>
              <button onClick={() => setViewModal(inf)} className="gradient-btn-outline text-xs !py-2 !px-3"><Eye className="w-3.5 h-3.5" /></button>
            </div>
          </GlassCard>
        ))}
      </div>

      {influencers.length === 0 && <GlassCard className="text-center py-12"><Users className="w-10 h-10 text-surface-600 mx-auto mb-3" /><p className="text-surface-400 text-sm">No influencers match your criteria</p></GlassCard>}

      {/* View Influencer */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Influencer Profile" wide>
        {viewModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-2xl font-bold text-white">{viewModal.displayName[0]}</div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1">{viewModal.displayName}{viewModal.verified && <CheckCircle2 className="w-4 h-4 text-primary-400" />}</h3>
                <p className="text-sm text-surface-400">{viewModal.category} · {viewModal.location}</p>
              </div>
            </div>
            <p className="text-sm text-surface-300">{viewModal.bio}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/5 text-center"><Heart className="w-4 h-4 text-pink-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">{(viewModal.totalFollowers / 1000).toFixed(0)}K</p><p className="text-[9px] text-surface-500">Followers</p></div>
              <div className="p-3 rounded-xl bg-white/5 text-center"><TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">{viewModal.engagementRate}%</p><p className="text-[9px] text-surface-500">Engagement</p></div>
              <div className="p-3 rounded-xl bg-white/5 text-center"><DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">${viewModal.pricePerPost}</p><p className="text-[9px] text-surface-500">Per Post</p></div>
              <div className="p-3 rounded-xl bg-white/5 text-center"><Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">{viewModal.previousCampaignScore}</p><p className="text-[9px] text-surface-500">Score</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Audience Age</p><p className="text-sm text-white">{viewModal.audienceAgeGroup}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Audience Gender</p><p className="text-sm text-white">{viewModal.audienceGender}</p></div>
            </div>
            {viewModal.socialLinks?.length > 0 && (
              <div><p className="text-xs font-medium text-surface-300 mb-2">Social Links</p>
                <div className="flex flex-wrap gap-2">{viewModal.socialLinks.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 transition-all">{l.platform}</a>)}</div>
              </div>
            )}
            <button onClick={() => { setViewModal(null); setInviteModal(viewModal); }} className="gradient-btn w-full text-sm"><Send className="w-4 h-4 inline mr-1" />Invite to Campaign</button>
          </div>
        )}
      </Modal>

      {/* Invite Modal */}
      <Modal open={!!inviteModal} onClose={() => { setInviteModal(null); setInvSent(false); }} title={invSent ? 'Invitation Sent!' : `Invite ${inviteModal?.displayName || ''}`}>
        {invSent ? (
          <div className="text-center py-6"><CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" /><p className="text-white font-medium">Invitation sent successfully!</p></div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-surface-300 mb-1.5 block">Select Campaign *</label>
              <select value={invCampaign} onChange={e => setInvCampaign(e.target.value)} className="input-field !py-2.5">
                <option value="">Choose a campaign...</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-300 mb-1.5 block">Personal Message</label>
              <textarea value={invMessage} onChange={e => setInvMessage(e.target.value)} className="input-field !py-2.5 resize-none" rows={3} placeholder="We'd love to work with you on..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setInviteModal(null)} className="gradient-btn-outline flex-1 text-sm !py-2.5">Cancel</button>
              <button onClick={handleInvite} disabled={!invCampaign} className="gradient-btn flex-1 text-sm !py-2.5 disabled:opacity-50">Send Invitation</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
