import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import * as db from '@/services/db';
import {
  predictMatch, batchPredict, getModelInfo,
  INFLUENCER_CATEGORIES, CAMPAIGN_CATEGORIES,
  type MLPredictionOutput,
} from '@/services/ml';
import {
  Bot, Sparkles, Users, Zap,
  CheckCircle2, AlertTriangle, XCircle, BarChart3, Brain,
  RefreshCw, Info,
} from 'lucide-react';

export default function MLPredictionPage() {
  const { user } = useAuthStore();
  // brand context available for future use
  void (user ? db.getBrandByUserId(user.id) : null);

  // Form state
  const [form, setForm] = useState({
    influencer_category: 'Fitness',
    followers_count: '50000',
    engagement_rate: '6.5',
    campaign_category: 'Fitness',
    audience_match_score: '85',
    previous_performance: '90',
  });
  const [result, setResult] = useState<MLPredictionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<(MLPredictionOutput & { name: string })[]>([]);

  const modelInfo = useMemo(() => getModelInfo(), []);

  const handlePredict = () => {
    setLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      const pred = predictMatch({
        influencer_category: form.influencer_category,
        followers_count: Number(form.followers_count),
        engagement_rate: Number(form.engagement_rate),
        campaign_category: form.campaign_category,
        audience_match_score: Number(form.audience_match_score),
        previous_performance: Number(form.previous_performance),
      });
      setResult(pred);
      setLoading(false);
    }, 600);
  };

  const handleBatchPredict = () => {
    const influencers = db.getInfluencers();
    if (influencers.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      const inputs = influencers.map(inf => ({
        category: inf.category || inf.niche || 'Lifestyle',
        followers: inf.totalFollowers,
        engagement: inf.engagementRate,
        audienceMatch: inf.previousCampaignScore > 0 ? Math.min(inf.previousCampaignScore + 5, 100) : 50,
        prevScore: inf.previousCampaignScore || 50,
      }));

      const results = batchPredict(inputs, form.campaign_category);
      const named = results.map((r, i) => ({
        ...r,
        name: influencers[i]?.displayName || `Influencer ${i + 1}`,
      }));

      // Sort by match score descending
      named.sort((a, b) => b.matchScore - a.matchScore);
      setBatchResults(named);
      setShowBatch(true);
      setLoading(false);
    }, 800);
  };

  const predColor = (pred: string) => {
    if (pred === 'Strong Match') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: CheckCircle2 };
    if (pred === 'Moderate Match') return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: AlertTriangle };
    return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle };
  };

  const contribColor = (c: string) => c === 'High' ? 'text-emerald-400' : c === 'Medium' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Match Prediction</h1>
            <p className="text-surface-400 text-sm">KNN Machine Learning model · {modelInfo.accuracy} accuracy</p>
          </div>
        </div>
        <button onClick={() => setShowModel(!showModel)} className="gradient-btn-outline flex items-center gap-2 text-sm !py-2.5 self-start">
          <Info className="w-4 h-4" /> Model Info
        </button>
      </div>

      {/* Model Info Collapsible */}
      {showModel && (
        <GlassCard className="border-primary-500/20">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Model Specifications</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-0.5">Algorithm</p><p className="text-sm font-medium text-white">{modelInfo.algorithm}</p></div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-0.5">K Neighbors</p><p className="text-sm font-medium text-white">{modelInfo.k}</p></div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-0.5">Accuracy</p><p className="text-sm font-medium text-emerald-400">{modelInfo.accuracy}</p></div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-0.5">F1 Score</p><p className="text-sm font-medium text-emerald-400">{modelInfo.f1Score}</p></div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-0.5">Precision</p><p className="text-sm font-medium text-blue-400">{modelInfo.precision}</p></div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-0.5">Recall</p><p className="text-sm font-medium text-blue-400">{modelInfo.recall}</p></div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-0.5">Training Samples</p><p className="text-sm font-medium text-white">{modelInfo.trainingSize}</p></div>
            <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-surface-500 mb-0.5">Features</p><p className="text-sm font-medium text-white">{modelInfo.features}</p></div>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-white/5">
            <p className="text-[10px] text-surface-500 mb-1">Classes</p>
            <div className="flex gap-2">{modelInfo.classes.map(c => {
              const s = predColor(c);
              return <span key={c} className={`text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{c}</span>;
            })}</div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Prediction Input</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Influencer Category</label>
                  <select value={form.influencer_category} onChange={e => setForm(f => ({ ...f, influencer_category: e.target.value }))} className="input-field !py-2.5">
                    {INFLUENCER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Followers Count</label>
                  <input type="number" value={form.followers_count} onChange={e => setForm(f => ({ ...f, followers_count: e.target.value }))} className="input-field !py-2.5" />
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Engagement Rate (%)</label>
                  <input type="number" step="0.1" value={form.engagement_rate} onChange={e => setForm(f => ({ ...f, engagement_rate: e.target.value }))} className="input-field !py-2.5" />
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Campaign Category</label>
                  <select value={form.campaign_category} onChange={e => setForm(f => ({ ...f, campaign_category: e.target.value }))} className="input-field !py-2.5">
                    {CAMPAIGN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Audience Match Score (0-100)</label>
                  <input type="number" min="0" max="100" value={form.audience_match_score} onChange={e => setForm(f => ({ ...f, audience_match_score: e.target.value }))} className="input-field !py-2.5" />
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">Previous Performance (0-100)</label>
                  <input type="number" min="0" max="100" value={form.previous_performance} onChange={e => setForm(f => ({ ...f, previous_performance: e.target.value }))} className="input-field !py-2.5" />
                </div>

                <button onClick={handlePredict} disabled={loading} className="gradient-btn w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Predicting...</> : <><Bot className="w-4 h-4" /> Run Prediction</>}
                </button>

                <button onClick={handleBatchPredict} disabled={loading} className="gradient-btn-outline w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  <Users className="w-4 h-4" /> Batch Predict All Influencers
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Result */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <>
              {/* Main Result Card */}
              <GlassCard className={`border ${predColor(result.prediction).border} relative overflow-hidden`}>
                <div className={`absolute inset-0 ${predColor(result.prediction).bg} opacity-20`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-surface-400 flex items-center gap-1"><Zap className="w-3 h-3" />KNN Prediction Result</span>
                    <span className="text-xs text-surface-500">API Response</span>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    {(() => {
                      const s = predColor(result.prediction);
                      const Icon = s.icon;
                      return (
                        <div className={`w-16 h-16 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                          <Icon className={`w-8 h-8 ${s.text}`} />
                        </div>
                      );
                    })()}
                    <div>
                      <p className={`text-2xl font-bold ${predColor(result.prediction).text}`}>{result.prediction}</p>
                      <p className="text-sm text-surface-400">Confidence: <span className="text-white font-semibold">{result.confidence}</span></p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-3xl font-bold gradient-text">{result.matchScore}</p>
                      <p className="text-[10px] text-surface-500">Match Score</p>
                    </div>
                  </div>

                  {/* Probability Bars */}
                  <div className="space-y-2 mb-6">
                    <p className="text-xs font-medium text-surface-300 mb-2">Class Probabilities</p>
                    {Object.entries(result.probabilities).map(([label, pct]) => {
                      const val = parseFloat(pct);
                      const s = predColor(label);
                      return (
                        <div key={label} className="flex items-center gap-3">
                          <span className="text-[11px] text-surface-400 w-28 shrink-0">{label}</span>
                          <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${s.bg.replace('/10', '/40')}`} style={{ width: `${val}%` }} />
                          </div>
                          <span className={`text-xs font-semibold w-12 text-right ${s.text}`}>{pct}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feature Contributions */}
                  <div>
                    <p className="text-xs font-medium text-surface-300 mb-3">Feature Analysis</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5">
                          <div className="flex-1">
                            <p className="text-[11px] text-surface-400">{f.label}</p>
                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700" style={{ width: `${f.value}%` }} />
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold ${contribColor(f.contribution)}`}>{f.contribution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* API Response JSON */}
              <GlassCard className="!p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-surface-500 font-mono">POST /api/ml/predict</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">200 OK</span>
                </div>
                <pre className="text-[11px] text-surface-300 font-mono bg-black/30 rounded-lg p-3 overflow-x-auto">
{JSON.stringify({
  prediction: result.prediction,
  confidence: result.confidence,
  match_score: result.matchScore,
  probabilities: result.probabilities,
}, null, 2)}
                </pre>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="text-center py-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-5">
                  <Brain className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Predict</h3>
                <p className="text-sm text-surface-400 max-w-sm mx-auto mb-4">Enter influencer and campaign details, then click "Run Prediction" to get an AI-powered match analysis.</p>
                <div className="flex items-center justify-center gap-6 text-xs text-surface-500">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" />Strong Match</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-400" />Moderate Match</span>
                  <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" />Low Match</span>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Batch Results */}
      {showBatch && batchResults.length > 0 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-white">Batch Prediction Results</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300">{batchResults.length} influencers</span>
            </div>
            <span className="text-xs text-surface-500">Campaign: {form.campaign_category}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2 pr-3">Rank</th>
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2 pr-3">Influencer</th>
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2 pr-3">Prediction</th>
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2 pr-3">Confidence</th>
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2 pr-3">Score</th>
                  <th className="text-left text-[10px] font-medium text-surface-500 uppercase pb-2">Probabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {batchResults.map((r, i) => {
                  const s = predColor(r.prediction);
                  const Icon = s.icon;
                  return (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="py-3 pr-3">
                        <span className={`text-xs font-bold ${i < 3 ? 'text-primary-400' : 'text-surface-500'}`}>#{i + 1}</span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-[10px] font-bold text-white">{r.name[0]}</div>
                          <span className="text-xs font-medium text-white">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${s.bg} ${s.text}`}>
                          <Icon className="w-3 h-3" />{r.prediction}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-surface-300 font-medium">{r.confidence}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${r.matchScore}%` }} />
                          </div>
                          <span className="text-xs text-white font-medium">{r.matchScore}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5">
                          {Object.entries(r.probabilities).map(([label, pct]) => (
                            <span key={label} className={`text-[9px] px-1.5 py-0.5 rounded ${predColor(label).bg} ${predColor(label).text}`}>{pct}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
