import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  User,
  Building2,
  Star,
  CheckCircle2,
  Globe,
  Palette,
} from 'lucide-react';

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('brand');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Brand
    companyName: '',
    industry: '',
    website: '',
    // Influencer
    displayName: '',
    niche: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role,
        companyName: formData.companyName,
        industry: formData.industry,
        website: formData.website,
        displayName: formData.displayName,
        niche: formData.niche,
        bio: formData.bio,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-surface-950" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">InfluenceAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-surface-400">Join the future of influencer marketing</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= 1 ? 'bg-primary-500/20 text-primary-300' : 'text-surface-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-surface-700 text-surface-400'}`}>
              {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            Account
          </div>
          <div className={`w-8 h-px ${step >= 2 ? 'bg-primary-500' : 'bg-surface-700'}`} />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= 2 ? 'bg-primary-500/20 text-primary-300' : 'text-surface-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-surface-700 text-surface-400'}`}>
              2
            </div>
            Profile
          </div>
        </div>

        {/* Form */}
        <div className="glass-strong rounded-2xl p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-3">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('brand')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      role === 'brand'
                        ? 'border-primary-500 bg-primary-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-surface-400 hover:bg-white/10'
                    }`}
                  >
                    <Building2 className={`w-6 h-6 ${role === 'brand' ? 'text-primary-400' : ''}`} />
                    <span className="text-sm font-medium">Brand</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('influencer')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      role === 'influencer'
                        ? 'border-accent-500 bg-accent-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-surface-400 hover:bg-white/10'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${role === 'influencer' ? 'text-accent-400' : ''}`} />
                    <span className="text-sm font-medium">Influencer</span>
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder="John"
                      required
                      className="input-field !pl-11"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                    className="input-field"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field !pl-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    className="input-field !pl-11 !pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength.score ? strength.color : 'bg-surface-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-surface-400">{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field !pl-11"
                  />
                </div>
              </div>

              <button type="button" onClick={handleNext} className="gradient-btn w-full flex items-center justify-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {role === 'brand' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => updateField('companyName', e.target.value)}
                        placeholder="Your Company"
                        required
                        className="input-field !pl-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Industry</label>
                    <div className="relative">
                      <Palette className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <select
                        value={formData.industry}
                        onChange={(e) => updateField('industry', e.target.value)}
                        required
                        className="input-field !pl-11 appearance-none"
                      >
                        <option value="">Select industry</option>
                        {industries.map((ind) => (
                          <option key={ind} value={ind.toLowerCase()}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Website (optional)</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        placeholder="https://yourcompany.com"
                        className="input-field !pl-11"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Display Name</label>
                    <div className="relative">
                      <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => updateField('displayName', e.target.value)}
                        placeholder="Your creator name"
                        required
                        className="input-field !pl-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Content Niche</label>
                    <div className="relative">
                      <Palette className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <select
                        value={formData.niche}
                        onChange={(e) => updateField('niche', e.target.value)}
                        required
                        className="input-field !pl-11 appearance-none"
                      >
                        <option value="">Select your niche</option>
                        {niches.map((n) => (
                          <option key={n} value={n.toLowerCase()}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Bio (optional)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="Tell brands about yourself..."
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                </>
              )}

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500/50"
                />
                <span className="text-sm text-surface-400">
                  I agree to the{' '}
                  <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="gradient-btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-btn flex-[2] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Login link */}
        <p className="text-center mt-8 text-sm text-surface-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const industries = [
  'Technology', 'Fashion', 'Beauty', 'Food & Beverage', 'Health & Fitness',
  'Travel', 'Gaming', 'Education', 'Finance', 'Entertainment', 'Automotive', 'Real Estate',
];

const niches = [
  'Technology', 'Fashion', 'Beauty', 'Fitness', 'Food',
  'Travel', 'Gaming', 'Education', 'Lifestyle', 'Business', 'Music', 'Art',
];
