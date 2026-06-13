import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import * as db from '@/services/db';
import { Star, CheckCircle2, XCircle, Clock, DollarSign, Trash2 } from 'lucide-react';

export default function ApplicationsPage() {
  const { user } = useAuthStore();
  const inf = user ? db.getInfluencerByUserId(user.id) : null;
  const [filterStatus, setFilterStatus] = useState('all');
  const [refresh, setRefresh] = useState(0);

  const apps = useMemo(() => {
    let list = inf ? db.getApplicationsByInfluencer(inf.id) : [];
    if (filterStatus !== 'all') list = list.filter(a => a.status === filterStatus);
    return list;
  }, [inf, filterStatus, refresh]);

  const handleWithdraw = (id: string) => {
    db.updateApplicationStatus(id, 'withdrawn');
    setRefresh(r => r + 1);
  };

  const statusColor = (s: string) => s === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : s === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : s === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-surface-500/10 text-surface-400';
  const statusIcon = (s: string) => s === 'pending' ? <Clock className="w-3 h-3" /> : s === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">My Applications</h1>
        <p className="text-surface-400 text-sm">Track all your campaign applications ({apps.filter(a => a.status === 'pending').length} pending)</p>
      </div>

      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field !py-2.5 !w-auto">
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
        <option value="withdrawn">Withdrawn</option>
      </select>

      {apps.length === 0 ? (
        <GlassCard className="text-center py-16"><Star className="w-10 h-10 text-surface-600 mx-auto mb-3" /><p className="text-surface-400 text-sm">No applications yet</p><p className="text-surface-500 text-xs mt-1">Browse campaigns and submit your first application</p></GlassCard>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <GlassCard key={app.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{app.campaignTitle}</p>
                  <p className="text-xs text-surface-400 mt-0.5">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium"><DollarSign className="w-3 h-3" />{app.proposedRate}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor(app.status)}`}>{statusIcon(app.status)}{app.status}</span>
                  {app.status === 'pending' && (
                    <button onClick={() => handleWithdraw(app.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400 transition-all" title="Withdraw"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-white/5">
                <p className="text-[10px] text-surface-500 mb-1">Your Proposal</p>
                <p className="text-xs text-surface-300">{app.proposal}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
