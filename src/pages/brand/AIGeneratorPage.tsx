import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import {
  generateCaption, generateProposal, generateOutreach,
  isGeminiAvailable,
  type CaptionInput, type CaptionOutput,
  type ProposalInput, type ProposalOutput,
  type OutreachInput, type OutreachOutput,
} from '@/services/ai';
import {
  Sparkles, MessageSquare, FileText, Send,
  Copy, CheckCircle2, RefreshCw, Wand2, Hash,
  Smile, Type, Globe,
} from 'lucide-react';

type Tab = 'caption' | 'proposal' | 'outreach';

export default function AIGeneratorPage() {
  const [tab, setTab] = useState<Tab>('caption');
  const geminiOn = isGeminiAvailable();

  const tabs: { id: Tab; label: string; icon: typeof Sparkles; desc: string }[] = [
    { id: 'caption', label: 'Captions', icon: MessageSquare, desc: 'Social media captions' },
    { id: 'proposal', label: 'Proposals', icon: FileText, desc: 'Campaign proposals' },
    { id: 'outreach', label: 'Outreach', icon: Send, desc: 'Outreach messages' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Content Generator</h1>
            <p className="text-surface-400 text-sm">
              {geminiOn
                ? <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Powered by Google Gemini</span>
                : <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Smart Template Engine (set VITE_GEMINI_API_KEY for Gemini)</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400 hover:text-white hover:bg-white/5'}`}>
            <t.icon className="w-4 h-4" /><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'caption' && <CaptionGenerator />}
      {tab === 'proposal' && <ProposalGenerator />}
      {tab === 'outreach' && <OutreachGenerator />}
    </div>
  );
}

// ──── COPY BUTTON ────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
      {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${source === 'gemini' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
      {source === 'gemini' ? '✦ Gemini AI' : '⚡ Smart Template'}
    </span>
  );
}

// ──── CAPTION GENERATOR ──────────────────────────────────────
function CaptionGenerator() {
  const [form, setForm] = useState<CaptionInput>({
    platform: 'Instagram', niche: 'Technology', topic: 'AI-Powered Marketing Tools',
    tone: 'professional', includeHashtags: true, includeEmojis: true,
  });
  const [result, setResult] = useState<CaptionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const u = (f: Partial<CaptionInput>) => setForm(p => ({ ...p, ...f }));

  const run = async () => {
    setLoading(true);
    const r = await generateCaption(form);
    setResult(r); setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary-400" /> Caption Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-surface-500 mb-1 block">Platform</label>
              <select value={form.platform} onChange={e => u({ platform: e.target.value })} className="input-field !py-2">
                {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn'].map(p => <option key={p}>{p}</option>)}
              </select></div>
            <div><label className="text-[10px] text-surface-500 mb-1 block">Tone</label>
              <select value={form.tone} onChange={e => u({ tone: e.target.value })} className="input-field !py-2">
                {['professional', 'casual', 'humorous', 'inspirational', 'educational'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select></div>
          </div>
          <div><label className="text-[10px] text-surface-500 mb-1 block">Niche / Industry</label>
            <input value={form.niche} onChange={e => u({ niche: e.target.value })} className="input-field !py-2" placeholder="e.g. Technology" /></div>
          <div><label className="text-[10px] text-surface-500 mb-1 block">Topic / Subject</label>
            <input value={form.topic} onChange={e => u({ topic: e.target.value })} className="input-field !py-2" placeholder="e.g. AI-Powered Marketing Tools" /></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.includeHashtags} onChange={e => u({ includeHashtags: e.target.checked })} className="rounded border-surface-600 bg-surface-800 text-primary-500" /><Hash className="w-3.5 h-3.5 text-surface-400" /><span className="text-xs text-surface-300">Hashtags</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.includeEmojis} onChange={e => u({ includeEmojis: e.target.checked })} className="rounded border-surface-600 bg-surface-800 text-primary-500" /><Smile className="w-3.5 h-3.5 text-surface-400" /><span className="text-xs text-surface-300">Emojis</span></label>
          </div>
          <button onClick={run} disabled={loading || !form.topic} className="gradient-btn w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Caption</>}
          </button>
        </div>
      </GlassCard>

      <GlassCard className="relative overflow-hidden">
        {result ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Type className="w-4 h-4 text-primary-400" /><span className="text-sm font-semibold text-white">Generated Caption</span></div>
              <div className="flex items-center gap-2"><SourceBadge source={result.source} /><CopyBtn text={result.caption} /></div>
            </div>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5 whitespace-pre-wrap text-sm text-surface-200 leading-relaxed">{result.caption}</div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-surface-500">
              <span>{result.characterCount} characters</span>
              {result.hashtags.length > 0 && <span>{result.hashtags.length} hashtags</span>}
            </div>
            <button onClick={run} disabled={loading} className="mt-3 gradient-btn-outline text-xs !py-2 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Regenerate</button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-3"><MessageSquare className="w-7 h-7 text-primary-400" /></div>
            <p className="text-white font-medium mb-1">Ready to Generate</p>
            <p className="text-xs text-surface-500 max-w-xs">Fill in the settings and click Generate to create a platform-optimized caption.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ──── PROPOSAL GENERATOR ─────────────────────────────────────
function ProposalGenerator() {
  const [form, setForm] = useState<ProposalInput>({
    influencerName: 'Alex Rivera', influencerNiche: 'Technology', influencerFollowers: 125000,
    campaignTitle: 'Summer Product Launch 2024', campaignCategory: 'Technology',
    campaignBudget: 15000, campaignDescription: 'Showcase our new AI-powered gadget line with unboxing and review content.',
    proposedRate: 500,
  });
  const [result, setResult] = useState<ProposalOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const u = (f: Partial<ProposalInput>) => setForm(p => ({ ...p, ...f }));

  const run = async () => { setLoading(true); const r = await generateProposal(form); setResult(r); setLoading(false); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-primary-400" /> Proposal Details</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-surface-500 mb-1 block">Influencer Name</label><input value={form.influencerName} onChange={e => u({ influencerName: e.target.value })} className="input-field !py-2" /></div>
            <div><label className="text-[10px] text-surface-500 mb-1 block">Niche</label><input value={form.influencerNiche} onChange={e => u({ influencerNiche: e.target.value })} className="input-field !py-2" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-surface-500 mb-1 block">Followers</label><input type="number" value={form.influencerFollowers} onChange={e => u({ influencerFollowers: Number(e.target.value) })} className="input-field !py-2" /></div>
            <div><label className="text-[10px] text-surface-500 mb-1 block">Proposed Rate ($)</label><input type="number" value={form.proposedRate} onChange={e => u({ proposedRate: Number(e.target.value) })} className="input-field !py-2" /></div>
          </div>
          <div><label className="text-[10px] text-surface-500 mb-1 block">Campaign Title</label><input value={form.campaignTitle} onChange={e => u({ campaignTitle: e.target.value })} className="input-field !py-2" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-surface-500 mb-1 block">Category</label><input value={form.campaignCategory} onChange={e => u({ campaignCategory: e.target.value })} className="input-field !py-2" /></div>
            <div><label className="text-[10px] text-surface-500 mb-1 block">Budget ($)</label><input type="number" value={form.campaignBudget} onChange={e => u({ campaignBudget: Number(e.target.value) })} className="input-field !py-2" /></div>
          </div>
          <div><label className="text-[10px] text-surface-500 mb-1 block">Campaign Description</label><textarea value={form.campaignDescription} onChange={e => u({ campaignDescription: e.target.value })} className="input-field !py-2 resize-none" rows={2} /></div>
          <button onClick={run} disabled={loading} className="gradient-btn w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Proposal</>}
          </button>
        </div>
      </GlassCard>
      <GlassCard className="relative overflow-hidden">
        {result ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-primary-400" /> Generated Proposal</span>
              <div className="flex items-center gap-2"><SourceBadge source={result.source} /><CopyBtn text={result.proposal} /></div>
            </div>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5 whitespace-pre-wrap text-sm text-surface-200 leading-relaxed max-h-[420px] overflow-y-auto">{result.proposal}</div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-surface-500"><span>{result.wordCount} words</span></div>
            <button onClick={run} disabled={loading} className="mt-3 gradient-btn-outline text-xs !py-2 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Regenerate</button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-3"><FileText className="w-7 h-7 text-primary-400" /></div>
            <p className="text-white font-medium mb-1">Proposal Generator</p>
            <p className="text-xs text-surface-500 max-w-xs">Enter campaign and influencer details to generate a professional collaboration proposal.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ──── OUTREACH GENERATOR ─────────────────────────────────────
function OutreachGenerator() {
  const [form, setForm] = useState<OutreachInput>({
    brandName: 'TechVibe Inc.', brandIndustry: 'Technology',
    influencerName: 'Emma Wilson', influencerNiche: 'Fashion & Beauty', influencerFollowers: 245000,
    campaignTitle: 'Summer Product Launch 2024', campaignGoal: 'Increase brand awareness among 18-34 demographic',
    messageType: 'initial',
  });
  const [result, setResult] = useState<OutreachOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const u = (f: Partial<OutreachInput>) => setForm(p => ({ ...p, ...f }));

  const run = async () => { setLoading(true); const r = await generateOutreach(form); setResult(r); setLoading(false); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-primary-400" /> Outreach Settings</h3>
        <div className="space-y-3">
          <div><label className="text-[10px] text-surface-500 mb-1 block">Message Type</label>
            <select value={form.messageType} onChange={e => u({ messageType: e.target.value as OutreachInput['messageType'] })} className="input-field !py-2">
              <option value="initial">Initial Outreach</option>
              <option value="follow_up">Follow-Up</option>
              <option value="negotiation">Negotiation</option>
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-surface-500 mb-1 block">Brand Name</label><input value={form.brandName} onChange={e => u({ brandName: e.target.value })} className="input-field !py-2" /></div>
            <div><label className="text-[10px] text-surface-500 mb-1 block">Industry</label><input value={form.brandIndustry} onChange={e => u({ brandIndustry: e.target.value })} className="input-field !py-2" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-surface-500 mb-1 block">Influencer Name</label><input value={form.influencerName} onChange={e => u({ influencerName: e.target.value })} className="input-field !py-2" /></div>
            <div><label className="text-[10px] text-surface-500 mb-1 block">Influencer Niche</label><input value={form.influencerNiche} onChange={e => u({ influencerNiche: e.target.value })} className="input-field !py-2" /></div>
          </div>
          <div><label className="text-[10px] text-surface-500 mb-1 block">Followers</label><input type="number" value={form.influencerFollowers} onChange={e => u({ influencerFollowers: Number(e.target.value) })} className="input-field !py-2" /></div>
          <div><label className="text-[10px] text-surface-500 mb-1 block">Campaign Title</label><input value={form.campaignTitle} onChange={e => u({ campaignTitle: e.target.value })} className="input-field !py-2" /></div>
          <div><label className="text-[10px] text-surface-500 mb-1 block">Campaign Goal</label><input value={form.campaignGoal} onChange={e => u({ campaignGoal: e.target.value })} className="input-field !py-2" /></div>
          <button onClick={run} disabled={loading} className="gradient-btn w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Message</>}
          </button>
        </div>
      </GlassCard>
      <GlassCard className="relative overflow-hidden">
        {result ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white flex items-center gap-2"><Send className="w-4 h-4 text-primary-400" /> Generated Message</span>
              <div className="flex items-center gap-2"><SourceBadge source={result.source} /><CopyBtn text={`Subject: ${result.subject}\n\n${result.message}`} /></div>
            </div>
            <div className="p-3 rounded-lg bg-primary-500/5 border border-primary-500/20 mb-3">
              <p className="text-[10px] text-surface-500 mb-0.5">Subject Line</p>
              <p className="text-sm text-white font-medium">{result.subject}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5 whitespace-pre-wrap text-sm text-surface-200 leading-relaxed max-h-[360px] overflow-y-auto">{result.message}</div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-surface-500"><span>{result.wordCount} words</span></div>
            <button onClick={run} disabled={loading} className="mt-3 gradient-btn-outline text-xs !py-2 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Regenerate</button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-3"><Globe className="w-7 h-7 text-primary-400" /></div>
            <p className="text-white font-medium mb-1">Outreach Generator</p>
            <p className="text-xs text-surface-500 max-w-xs">Create personalized outreach messages for influencer collaborations.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
