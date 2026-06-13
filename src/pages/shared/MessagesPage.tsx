import GlassCard from '@/components/ui/GlassCard';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Messages</h1>
        <p className="text-surface-400 text-sm">Direct messaging with brands and influencers</p>
      </div>
      <GlassCard className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
        <p className="text-surface-400 text-sm max-w-sm mx-auto">Direct messaging with real-time chat, file sharing, and contract management will be available in the next update.</p>
      </GlassCard>
    </div>
  );
}
