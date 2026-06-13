import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import * as db from '@/services/db';
import type { Campaign, CampaignStatus } from '@/types';
import {
  Plus, Search, Target, DollarSign, Calendar, Users,
  Pencil, Trash2, Eye, Pause, Play,
} from 'lucide-react';

const CATEGORIES = ['Technology', 'Fashion & Beauty', 'Fitness & Health', 'Food & Cooking', 'Travel & Adventure', 'Gaming', 'Education', 'Lifestyle', 'Business', 'Entertainment'];
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn'];

export default function BrandCampaignsPage() {
  const { user } = useAuthStore();
  const brand = user ? db.getBrandByUserId(user.id) : null;
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [refresh, setRefresh] = useState(0);

  const campaigns = useMemo(() => {
    if (!brand) return [];
    let list = db.getCampaignsByBrand(brand.id);
    if (filterStatus !== 'all') list = list.filter(c => c.status === filterStatus);
    if (searchQ) list = list.filter(c => c.title.toLowerCase().includes(searchQ.toLowerCase()));
    return list;
    // eslint-disable-next-line
  }, [brand, searchQ, filterStatus, refresh]);

  // Form state
  const empty = { title: '', description: '', category: 'Technology', budget: '', targetAudience: '', requirements: '', startDate: '', endDate: '', status: 'draft' as CampaignStatus, platforms: ['Instagram'] as string[] };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setForm(empty); setModal('create'); };
  const openEdit = (c: Campaign) => {
    setSelected(c);
    setForm({ title: c.title, description: c.description, category: c.category || 'Technology', budget: String(c.budget), targetAudience: c.targetAudience || '', requirements: c.requirements || '', startDate: c.startDate, endDate: c.endDate, status: c.status, platforms: c.platforms || ['Instagram'] });
    setModal('edit');
  };
  const openView = (c: Campaign) => { setSelected(c); setModal('view'); };
  const openDelete = (c: Campaign) => { setSelected(c); setModal('delete'); };

  const handleSave = () => {
    if (!brand || !form.title || !form.budget) return;
    setSaving(true);
    if (modal === 'create') {
      db.createCampaign({ brandId: brand.id, brandName: brand.companyName, title: form.title, description: form.description, category: form.category, budget: Number(form.budget), targetAudience: form.targetAudience, requirements: form.requirements, startDate: form.startDate, endDate: form.endDate, status: form.status, platforms: form.platforms });
    } else if (modal === 'edit' && selected) {
      db.updateCampaign(selected.id, { title: form.title, description: form.description, category: form.category, budget: Number(form.budget), targetAudience: form.targetAudience, requirements: form.requirements, startDate: form.startDate, endDate: form.endDate, status: form.status, platforms: form.platforms });
    }
    setSaving(false);
    setModal(null);
    setRefresh(r => r + 1);
  };

  const handleDelete = () => {
    if (selected) { db.deleteCampaign(selected.id); setModal(null); setRefresh(r => r + 1); }
  };

  const toggleStatus = (c: Campaign) => {
    const next: CampaignStatus = c.status === 'active' ? 'paused' : c.status === 'paused' ? 'active' : c.status === 'draft' ? 'active' : c.status;
    db.updateCampaign(c.id, { status: next });
    setRefresh(r => r + 1);
  };

  const togglePlatform = (p: string) => {
    setForm(f => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p] }));
  };

  const statusColor = (s: string) => s === 'active' ? 'bg-emerald-500/10 text-emerald-400' : s === 'draft' ? 'bg-surface-500/10 text-surface-400' : s === 'paused' ? 'bg-yellow-500/10 text-yellow-400' : s === 'completed' ? 'bg-primary-500/10 text-primary-300' : 'bg-red-500/10 text-red-400';

  const appsCount = (campaignId: string) => db.getApplicationsByCampaign(campaignId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Campaigns</h1>
          <p className="text-surface-400 text-sm">Create, manage, and track all your campaigns</p>
        </div>
        <button onClick={openCreate} className="gradient-btn flex items-center gap-2 text-sm self-start">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search campaigns..." className="input-field !pl-10 !py-2.5" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field !py-2.5 !w-auto">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Campaign Cards */}
      {campaigns.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Target className="w-12 h-12 text-surface-600 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No campaigns found</p>
          <p className="text-surface-500 text-sm">Create your first campaign to get started</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <GlassCard key={c.id} className="group">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${statusColor(c.status)}`}>{c.status}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openView(c)} className="p-1.5 rounded-lg hover:bg-white/10 text-surface-400 hover:text-white"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10 text-surface-400 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toggleStatus(c)} className="p-1.5 rounded-lg hover:bg-white/10 text-surface-400 hover:text-white">
                    {c.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => openDelete(c)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-white mb-1 cursor-pointer hover:text-primary-300 transition-colors" onClick={() => openView(c)}>{c.title}</h3>
              <p className="text-xs text-surface-400 mb-3 line-clamp-2">{c.description}</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-[11px] text-surface-400"><DollarSign className="w-3 h-3 text-emerald-400" />${c.budget.toLocaleString()}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-surface-400"><Users className="w-3 h-3 text-blue-400" />{appsCount(c.id)} applicants</div>
                <div className="flex items-center gap-1.5 text-[11px] text-surface-400"><Calendar className="w-3 h-3 text-primary-400" />{c.endDate || 'TBD'}</div>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.platforms?.map(p => <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-surface-400">{p}</span>)}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-300">{c.category}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Create Campaign' : 'Edit Campaign'} wide>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field !py-2.5" placeholder="Campaign title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field !py-2.5 resize-none" rows={3} placeholder="Describe your campaign..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field !py-2.5">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Budget ($) *</label>
              <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="input-field !py-2.5" placeholder="10000" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Target Audience</label>
            <input value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))} className="input-field !py-2.5" placeholder="e.g. 18-34 tech enthusiasts" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Requirements</label>
            <textarea value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} className="input-field !py-2.5 resize-none" rows={2} placeholder="List campaign requirements..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field !py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field !py-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as CampaignStatus }))} className="input-field !py-2.5">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Platforms</label>
            <div className="flex flex-wrap gap-2">{PLATFORMS.map(p => (
              <button key={p} type="button" onClick={() => togglePlatform(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${form.platforms.includes(p) ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-white/10 text-surface-400 hover:bg-white/5'}`}>{p}</button>
            ))}</div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="gradient-btn-outline flex-1 !py-2.5 text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title || !form.budget} className="gradient-btn flex-1 !py-2.5 text-sm disabled:opacity-50">{saving ? 'Saving...' : modal === 'create' ? 'Create Campaign' : 'Save Changes'}</button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Campaign Details" wide>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${statusColor(selected.status)}`}>{selected.status}</span>
              <span className="text-xs text-surface-500">Created {new Date(selected.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{selected.title}</h3>
            <p className="text-sm text-surface-300">{selected.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Category</p><p className="text-sm text-white">{selected.category}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Budget</p><p className="text-sm text-white">${selected.budget.toLocaleString()}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Target Audience</p><p className="text-sm text-white">{selected.targetAudience || '-'}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Applicants</p><p className="text-sm text-white">{appsCount(selected.id)}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Start Date</p><p className="text-sm text-white">{selected.startDate || '-'}</p></div>
              <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">End Date</p><p className="text-sm text-white">{selected.endDate || '-'}</p></div>
            </div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-1">Requirements</p><p className="text-sm text-surface-300">{selected.requirements || '-'}</p></div>
            <div className="flex flex-wrap gap-1.5">{selected.platforms?.map(p => <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300">{p}</span>)}</div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Delete Campaign">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-400" /></div>
          <p className="text-white font-medium mb-2">Delete "{selected?.title}"?</p>
          <p className="text-sm text-surface-400 mb-6">This will also remove all applications and collaborations. This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="gradient-btn-outline flex-1 !py-2.5 text-sm">Cancel</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl px-6 py-2.5 transition-all text-sm">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
