import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import BarChart from '@/components/ui/BarChart';
import * as db from '@/services/db';
import { History, DollarSign, Star, CheckCircle2, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const inf = user ? db.getInfluencerByUserId(user.id) : null;

  const collabs = useMemo(() => {
    return inf ? db.getCollaborationsByInfluencer(inf.id).filter(c => c.status === 'completed') : [];
  }, [inf]);

  const totalEarned = collabs.reduce((s, c) => s + c.agreedRate, 0);

  const earningsChart = [
    { label: 'Jan', value: 800 }, { label: 'Feb', value: 1200 }, { label: 'Mar', value: 600 },
    { label: 'Apr', value: 1500 }, { label: 'May', value: 900 }, { label: 'Jun', value: 2000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Collaboration History</h1>
        <p className="text-surface-400 text-sm">Review your completed campaigns and earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard><p className="text-xs text-surface-400 mb-1">Total Earned</p><p className="text-2xl font-bold gradient-text">${totalEarned.toLocaleString()}</p></GlassCard>
        <GlassCard><p className="text-xs text-surface-400 mb-1">Completed Campaigns</p><p className="text-2xl font-bold text-white">{collabs.length}</p></GlassCard>
        <GlassCard><p className="text-xs text-surface-400 mb-1">Avg. Per Campaign</p><p className="text-2xl font-bold text-white">${collabs.length ? Math.round(totalEarned / collabs.length) : 0}</p></GlassCard>
      </div>

      <GlassCard>
        <BarChart data={earningsChart} title="Earnings Over Time" subtitle="Monthly earnings from completed campaigns" height={180} gradient={['#10b981', '#a855f7']} />
      </GlassCard>

      {collabs.length === 0 ? (
        <GlassCard className="text-center py-12"><History className="w-10 h-10 text-surface-600 mx-auto mb-3" /><p className="text-surface-400 text-sm">No completed collaborations yet</p></GlassCard>
      ) : (
        <div className="space-y-3">
          {collabs.map(c => (
            <GlassCard key={c.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-primary-500 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{c.campaignTitle}</p>
                    <p className="text-xs text-surface-400">{c.brandName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium"><DollarSign className="w-3 h-3" />{c.agreedRate}</span>
                  <span className="flex items-center gap-1 text-surface-400"><Calendar className="w-3 h-3" />{c.endDate}</span>
                  {c.rating && <span className="flex items-center gap-0.5 text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{c.rating}/5</span>}
                </div>
              </div>
              {c.deliverables && (
                <div className="mt-2 p-2 rounded-lg bg-white/5"><p className="text-[10px] text-surface-500">Deliverables: <span className="text-surface-300">{c.deliverables}</span></p></div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
