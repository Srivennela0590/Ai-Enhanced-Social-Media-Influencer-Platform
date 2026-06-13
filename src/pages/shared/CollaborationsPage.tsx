import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import * as db from '@/services/db';
import {
  Search, Briefcase, CheckCircle2, Clock, AlertTriangle,
  DollarSign, Calendar, ChevronDown, Star,
} from 'lucide-react';

export default function CollaborationsPage() {
  const { user } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isBrand = user?.role === 'brand';
  const brand = user ? db.getBrandByUserId(user.id) : null;
  const influencer = user ? db.getInfluencerByUserId(user.id) : null;

  const collaborations = useMemo(() => {
    let list = isBrand && brand
      ? db.getCollaborationsByBrand(brand.id)
      : influencer
        ? db.getCollaborationsByInfluencer(influencer.id)
        : [];
    if (filterStatus !== 'all') list = list.filter(c => c.status === filterStatus);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(c =>
        (c.campaignTitle || '').toLowerCase().includes(q) ||
        (c.influencerName || '').toLowerCase().includes(q) ||
        (c.brandName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [isBrand, brand, influencer, filterStatus, searchQ, refresh]);

  const statusColor = (s: string) => {
    switch (s) {
      case 'in_progress': return 'bg-blue-500/10 text-blue-400';
      case 'content_review': return 'bg-yellow-500/10 text-yellow-400';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400';
      case 'disputed': return 'bg-red-500/10 text-red-400';
      default: return 'bg-surface-500/10 text-surface-400';
    }
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case 'in_progress': return <Clock className="w-3 h-3" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'disputed': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    db.updateCollaborationStatus(id, status as any);
    setRefresh(r => r + 1);
  };

  const totalEarnings = collaborations.filter(c => c.status === 'completed').reduce((s, c) => s + c.agreedRate, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Collaborations</h1>
          <p className="text-surface-400 text-sm">{collaborations.length} total · ${totalEarnings.toLocaleString()} {isBrand ? 'spent' : 'earned'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search collaborations..." className="input-field !pl-10 !py-2.5" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field !py-2.5 !w-auto">
          <option value="all">All Status</option>
          <option value="negotiation">Negotiation</option>
          <option value="in_progress">In Progress</option>
          <option value="content_review">Content Review</option>
          <option value="completed">Completed</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {collaborations.length === 0 ? (
        <GlassCard className="text-center py-16"><Briefcase className="w-10 h-10 text-surface-600 mx-auto mb-3" /><p className="text-surface-400 text-sm">No collaborations yet</p></GlassCard>
      ) : (
        <div className="space-y-3">
          {collaborations.map(c => (
            <GlassCard key={c.id} className="!p-0 overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {((isBrand ? c.influencerName : c.brandName) || 'U')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{c.campaignTitle}</p>
                    <p className="text-xs text-surface-400">{isBrand ? c.influencerName : c.brandName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium"><DollarSign className="w-3 h-3" />{c.agreedRate}</span>
                  <span className="flex items-center gap-1 text-surface-400"><Calendar className="w-3 h-3" />{c.endDate || 'TBD'}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>{statusIcon(c.status)}{c.status.replace('_', ' ')}</span>
                  {c.rating && <span className="flex items-center gap-0.5 text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{c.rating}</span>}
                </div>
                <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-400 shrink-0">
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === c.id ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {expandedId === c.id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Deliverables</p><p className="text-sm text-surface-300">{c.deliverables || '-'}</p></div>
                    <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Start Date</p><p className="text-sm text-white">{c.startDate || '-'}</p></div>
                    <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">End Date</p><p className="text-sm text-white">{c.endDate || '-'}</p></div>
                  </div>
                  {c.status !== 'completed' && c.status !== 'disputed' && (
                    <div className="flex gap-2">
                      {c.status === 'in_progress' && <button onClick={() => handleStatusChange(c.id, 'content_review')} className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">Submit for Review</button>}
                      {c.status === 'content_review' && isBrand && <button onClick={() => handleStatusChange(c.id, 'completed')} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Mark Complete</button>}
                      {c.status === 'negotiation' && <button onClick={() => handleStatusChange(c.id, 'in_progress')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Start Work</button>}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
