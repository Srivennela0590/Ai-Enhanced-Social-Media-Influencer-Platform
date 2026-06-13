import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import * as db from '@/services/db';
import type { SocialLink } from '@/types';
import {
  Save, CheckCircle2, Camera, User, Mail, MapPin, DollarSign,
  Plus, Trash2, Globe, Star, Heart, TrendingUp, Upload,
} from 'lucide-react';

const CATEGORIES = ['Technology', 'Fashion & Beauty', 'Fitness & Health', 'Food & Cooking', 'Travel & Adventure', 'Gaming & Esports', 'Education', 'Lifestyle & Wellness', 'Business', 'Entertainment', 'Music', 'Art & Design'];
const PLATFORMS_LIST = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Twitch', 'Pinterest', 'Blog'];
const AGE_GROUPS = ['13-17', '18-24', '18-34', '25-34', '25-44', '35-44', '45+', 'Mixed'];
const GENDER_OPTIONS = ['Mostly Male', 'Mostly Female', '48% Male', '52% Male', '55% Male', '58% Male', '64% Male', '68% Female', '72% Female', '78% Female', 'Mixed/Balanced'];

export default function InfluencerProfilePage() {
  const { user } = useAuthStore();
  const inf = user ? db.getInfluencerByUserId(user.id) : null;
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState(() => ({
    displayName: inf?.displayName || '',
    email: inf?.email || user?.email || '',
    bio: inf?.bio || '',
    category: inf?.category || 'Technology',
    niche: inf?.niche || '',
    totalFollowers: inf?.totalFollowers || 0,
    engagementRate: inf?.engagementRate || 0,
    pricePerPost: inf?.pricePerPost || 0,
    location: inf?.location || '',
    audienceAgeGroup: inf?.audienceAgeGroup || '18-34',
    audienceGender: inf?.audienceGender || 'Mixed/Balanced',
    socialLinks: inf?.socialLinks || [] as SocialLink[],
  }));

  const handleSave = () => {
    if (!inf) return;
    db.updateInfluencer(inf.id, {
      displayName: form.displayName,
      email: form.email,
      bio: form.bio,
      category: form.category,
      niche: form.niche,
      totalFollowers: Number(form.totalFollowers),
      engagementRate: Number(form.engagementRate),
      pricePerPost: Number(form.pricePerPost),
      location: form.location,
      audienceAgeGroup: form.audienceAgeGroup,
      audienceGender: form.audienceGender,
      socialLinks: form.socialLinks,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addLink = () => setForm(f => ({ ...f, socialLinks: [...f.socialLinks, { platform: 'Instagram', url: '' }] }));
  const removeLink = (i: number) => setForm(f => ({ ...f, socialLinks: f.socialLinks.filter((_, idx) => idx !== i) }));
  const updateLink = (i: number, field: keyof SocialLink, val: string) => {
    setForm(f => {
      const links = [...f.socialLinks];
      links[i] = { ...links[i], [field]: val };
      return { ...f, socialLinks: links };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">My Profile</h1>
        <p className="text-surface-400 text-sm">Update your influencer profile and media kit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <GlassCard className="text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-600/30 to-accent-500/20" />
          <div className="relative pt-10">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-lg">{form.displayName?.[0] || 'U'}</div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg hover:bg-primary-400 transition-colors"><Camera className="w-4 h-4" /></button>
            </div>
            <h3 className="text-lg font-bold text-white mt-3">{form.displayName || 'Your Name'}</h3>
            <p className="text-sm text-surface-400">{form.category}</p>
            <p className="text-xs text-surface-500 mt-1">{form.location || 'No location set'}</p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="p-2 rounded-lg bg-white/5"><Heart className="w-3.5 h-3.5 text-pink-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">{(Number(form.totalFollowers) / 1000).toFixed(0)}K</p><p className="text-[8px] text-surface-500">Followers</p></div>
              <div className="p-2 rounded-lg bg-white/5"><TrendingUp className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">{form.engagementRate}%</p><p className="text-[8px] text-surface-500">Engagement</p></div>
              <div className="p-2 rounded-lg bg-white/5"><Star className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">{inf?.previousCampaignScore || 0}</p><p className="text-[8px] text-surface-500">Score</p></div>
            </div>
            {/* Upload area */}
            <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-primary-500/30 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-surface-500 mx-auto mb-1" />
              <p className="text-[10px] text-surface-500">Upload profile image</p>
            </div>
          </div>
        </GlassCard>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Display Name *</label>
                  <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className="input-field !pl-10 !py-2.5" /></div>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Email</label>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field !pl-10 !py-2.5" /></div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-surface-300 mb-1.5 block">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="input-field !py-2.5 resize-none" rows={3} placeholder="Tell brands about yourself..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field !py-2.5">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Location</label>
                  <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input-field !pl-10 !py-2.5" placeholder="City, Country" /></div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-surface-300 mb-1.5 block">Total Followers</label>
                <input type="number" value={form.totalFollowers} onChange={e => setForm(f => ({ ...f, totalFollowers: Number(e.target.value) }))} className="input-field !py-2.5" />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-300 mb-1.5 block">Engagement Rate (%)</label>
                <input type="number" step="0.1" value={form.engagementRate} onChange={e => setForm(f => ({ ...f, engagementRate: Number(e.target.value) }))} className="input-field !py-2.5" />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-300 mb-1.5 block">Price Per Post ($)</label>
                <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input type="number" value={form.pricePerPost} onChange={e => setForm(f => ({ ...f, pricePerPost: Number(e.target.value) }))} className="input-field !pl-10 !py-2.5" /></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-4">Audience Demographics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-surface-300 mb-1.5 block">Audience Age Group</label>
                <select value={form.audienceAgeGroup} onChange={e => setForm(f => ({ ...f, audienceAgeGroup: e.target.value }))} className="input-field !py-2.5">{AGE_GROUPS.map(a => <option key={a}>{a}</option>)}</select>
              </div>
              <div>
                <label className="text-xs font-medium text-surface-300 mb-1.5 block">Audience Gender</label>
                <select value={form.audienceGender} onChange={e => setForm(f => ({ ...f, audienceGender: e.target.value }))} className="input-field !py-2.5">{GENDER_OPTIONS.map(g => <option key={g}>{g}</option>)}</select>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Social Links</h3>
              <button onClick={addLink} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add Link</button>
            </div>
            {form.socialLinks.length === 0 ? (
              <p className="text-xs text-surface-500 text-center py-4">No social links added yet</p>
            ) : (
              <div className="space-y-3">
                {form.socialLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select value={link.platform} onChange={e => updateLink(i, 'platform', e.target.value)} className="input-field !py-2 !w-auto text-sm">
                      {PLATFORMS_LIST.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <div className="relative flex-1"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} className="input-field !pl-10 !py-2 text-sm" placeholder="https://..." /></div>
                    <button onClick={() => removeLink(i)} className="p-2 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <button onClick={handleSave} className="gradient-btn flex items-center gap-2 text-sm">
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Profile Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
