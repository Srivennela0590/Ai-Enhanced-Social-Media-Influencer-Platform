import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import { Save, CheckCircle2, Lock, Bell, Shield, User, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'account' | 'security' | 'notifications'>('account');

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  if (!user) return null;

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-surface-400 text-sm">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 p-1 glass rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400 hover:text-white hover:bg-white/5'}`}><t.icon className="w-4 h-4" />{t.label}</button>
        ))}
      </div>

      {tab === 'account' && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-white mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-surface-300 mb-1.5 block">First Name</label><input defaultValue={user.firstName} className="input-field !py-2.5" /></div>
              <div><label className="text-xs font-medium text-surface-300 mb-1.5 block">Last Name</label><input defaultValue={user.lastName} className="input-field !py-2.5" /></div>
            </div>
            <div><label className="text-xs font-medium text-surface-300 mb-1.5 block">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input defaultValue={user.email} className="input-field !pl-10 !py-2.5" /></div></div>
            <button onClick={handleSave} className="gradient-btn text-sm flex items-center gap-2">{saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}{saved ? 'Saved!' : 'Save Changes'}</button>
          </div>
        </GlassCard>
      )}

      {tab === 'security' && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-white mb-4">Change Password</h3>
          <div className="space-y-4 max-w-md">
            <div><label className="text-xs font-medium text-surface-300 mb-1.5 block">Current Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input type="password" className="input-field !pl-10 !py-2.5" placeholder="••••••••" /></div></div>
            <div><label className="text-xs font-medium text-surface-300 mb-1.5 block">New Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input type="password" className="input-field !pl-10 !py-2.5" placeholder="••••••••" /></div></div>
            <div><label className="text-xs font-medium text-surface-300 mb-1.5 block">Confirm New Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input type="password" className="input-field !pl-10 !py-2.5" placeholder="••••••••" /></div></div>
            <button onClick={handleSave} className="gradient-btn text-sm flex items-center gap-2">{saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}{saved ? 'Updated!' : 'Update Password'}</button>
          </div>
        </GlassCard>
      )}

      {tab === 'notifications' && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {[
              { title: 'Campaign Matches', desc: 'Get notified about new matching campaigns', on: true },
              { title: 'Application Updates', desc: 'Updates on your applications', on: true },
              { title: 'Messages', desc: 'New messages from brands/influencers', on: true },
              { title: 'Payment Alerts', desc: 'Payment status changes', on: true },
              { title: 'Weekly Digest', desc: 'Weekly activity summary', on: false },
              { title: 'Marketing', desc: 'Tips, updates, and promotions', on: false },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div><p className="text-sm text-white">{n.title}</p><p className="text-[10px] text-surface-500">{n.desc}</p></div>
                <label className="relative inline-flex cursor-pointer">
                  <input type="checkbox" defaultChecked={n.on} className="sr-only peer" />
                  <div className="w-10 h-5 bg-surface-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
                </label>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
