import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import * as db from '@/services/db';
import { Send, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';

export default function InvitationsPage() {
  const { user } = useAuthStore();
  const inf = user ? db.getInfluencerByUserId(user.id) : null;
  const [filterStatus, setFilterStatus] = useState('all');
  const [refresh, setRefresh] = useState(0);

  const invitations = useMemo(() => {
    let list = inf ? db.getInvitationsByInfluencer(inf.id) : [];
    if (filterStatus !== 'all') list = list.filter(i => i.status === filterStatus);
    return list;
  }, [inf, filterStatus, refresh]);

  const handleAccept = (id: string) => {
    const inv = db.getInvitations().find(i => i.id === id);
    db.updateInvitationStatus(id, 'accepted');
    // Create an application automatically
    if (inv && inf) {
      try {
        db.createApplication({
          campaignId: inv.campaignId,
          campaignTitle: inv.campaignTitle,
          influencerId: inf.id,
          influencerName: inf.displayName,
          influencerFollowers: inf.totalFollowers,
          influencerEngagement: inf.engagementRate,
          influencerCategory: inf.category,
          status: 'accepted',
          proposal: 'Accepted via invitation',
          proposedRate: inf.pricePerPost || 0,
        });
      } catch {}
    }
    setRefresh(r => r + 1);
  };

  const handleDecline = (id: string) => {
    db.updateInvitationStatus(id, 'declined');
    setRefresh(r => r + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Invitations</h1>
        <p className="text-surface-400 text-sm">View and respond to brand invitations ({invitations.filter(i => i.status === 'pending').length} pending)</p>
      </div>

      <div className="flex gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field !py-2.5 !w-auto">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {invitations.length === 0 ? (
        <GlassCard className="text-center py-16"><Send className="w-10 h-10 text-surface-600 mx-auto mb-3" /><p className="text-surface-400 text-sm">No invitations yet</p><p className="text-surface-500 text-xs mt-1">Brands will send you invitations based on your profile</p></GlassCard>
      ) : (
        <div className="space-y-3">
          {invitations.map(inv => (
            <GlassCard key={inv.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white shrink-0">{(inv.brandName || 'B')[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{inv.campaignTitle}</p>
                    <p className="text-xs text-surface-400">{inv.brandName} · {new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                  inv.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                  inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {inv.status === 'pending' ? <Clock className="w-3 h-3" /> : inv.status === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {inv.status}
                </span>
              </div>
              {inv.message && (
                <div className="mt-3 p-3 rounded-xl bg-white/5 flex items-start gap-2"><MessageSquare className="w-3.5 h-3.5 text-surface-500 mt-0.5 shrink-0" /><p className="text-xs text-surface-300">{inv.message}</p></div>
              )}
              {inv.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAccept(inv.id)} className="gradient-btn text-xs !py-2 flex-1 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" />Accept</button>
                  <button onClick={() => handleDecline(inv.id)} className="gradient-btn-outline text-xs !py-2 flex-1 flex items-center justify-center gap-1"><XCircle className="w-3 h-3" />Decline</button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
