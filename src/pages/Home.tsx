import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Bot,
  BarChart3,
  Shield,
  Zap,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  Star,
  Globe,
  ChevronRight,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-950/80 via-surface-950/60 to-surface-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/40 to-accent-500/5" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-200">AI-Powered Influencer Marketing</span>
              <ChevronRight className="w-4 h-4 text-primary-400" />
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-white">Connect with the</span>
              <br />
              <span className="gradient-text">Perfect Influencers</span>
              <br />
              <span className="text-white">Using AI</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-surface-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Our AI engine analyzes millions of data points to match brands with influencers who drive real results. Smarter campaigns, better ROI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/register" className="gradient-btn text-lg !px-8 !py-4 flex items-center gap-2 w-full sm:w-auto justify-center">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="gradient-btn-outline text-lg !px-8 !py-4 flex items-center gap-2 w-full sm:w-auto justify-center">
                View Demo
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-surface-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-surface-950 flex items-center justify-center text-[10px] font-bold text-white"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm">2,500+ brands</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm ml-1">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-400" />
                <span className="text-sm">120+ countries</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="glass rounded-2xl p-2 glow">
              <img
                src="/images/dashboard-preview.jpg"
                alt="Platform Dashboard"
                className="w-full rounded-xl"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary-500/20 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-primary-950/10 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-400 mb-4">
              <Bot className="w-4 h-4" />
              POWERFUL FEATURES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything you need for{' '}
              <span className="gradient-text">influencer marketing</span>
            </h2>
            <p className="text-lg text-surface-400">
              From AI-powered matching to comprehensive analytics, we provide all the tools to run successful campaigns.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <GlassCard key={i} hover className="group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-400 mb-4">
              <Zap className="w-4 h-4" />
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Launch campaigns in{' '}
              <span className="gradient-text">three simple steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-500/50 to-transparent" />
                )}
                <GlassCard className="text-center relative" glow={i === 1}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-surface-400 leading-relaxed">{step.description}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Brands & Influencers */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-primary-950/10 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Brands */}
            <GlassCard className="relative overflow-hidden" glow>
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-400 mb-4 px-3 py-1 rounded-full bg-primary-500/10 uppercase tracking-wider">
                  <Target className="w-3 h-3" />
                  For Brands
                </span>
                <h3 className="text-2xl font-bold text-white mb-4">Find your perfect match</h3>
                <p className="text-surface-400 mb-6 leading-relaxed">
                  Our AI analyzes audience demographics, engagement patterns, and content quality to recommend influencers that align with your brand values.
                </p>
                <ul className="space-y-3 mb-8">
                  {['AI-powered influencer discovery', 'Campaign performance analytics', 'ROI tracking & reporting', 'Secure payment processing'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-surface-300">
                      <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="gradient-btn inline-flex items-center gap-2">
                  Register as Brand
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </GlassCard>

            {/* For Influencers */}
            <GlassCard className="relative overflow-hidden" glow>
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent-400 mb-4 px-3 py-1 rounded-full bg-accent-500/10 uppercase tracking-wider">
                  <Users className="w-3 h-3" />
                  For Influencers
                </span>
                <h3 className="text-2xl font-bold text-white mb-4">Grow your influence</h3>
                <p className="text-surface-400 mb-6 leading-relaxed">
                  Get discovered by top brands, manage collaborations effortlessly, and maximize your earning potential with data-driven insights.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Premium brand partnerships', 'AI-optimized pricing suggestions', 'Portfolio & media kit builder', 'Direct messaging with brands'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-surface-300">
                      <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="gradient-btn inline-flex items-center gap-2 !from-accent-600 !to-primary-600 !shadow-accent-900/50">
                  Register as Influencer
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-accent-500/5 to-primary-600/10" />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
                  <p className="text-sm text-surface-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-primary-950/10 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-400 mb-4">
              <TrendingUp className="w-4 h-4" />
              PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Plans that{' '}
              <span className="gradient-text">scale with you</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <GlassCard
                key={i}
                className={`relative ${plan.popular ? 'border-primary-500/50 glow' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-surface-400">/{plan.period}</span>}
                  </div>
                  <p className="text-sm text-surface-400 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-surface-300">
                      <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center ${plan.popular ? 'gradient-btn' : 'gradient-btn-outline'} w-full`}
                >
                  Get Started
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-3xl p-12 md:p-16 glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-accent-500/10 to-primary-600/20" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to transform your<br />
                <span className="gradient-text">influencer marketing?</span>
              </h2>
              <p className="text-lg text-surface-300 mb-8 max-w-xl mx-auto">
                Join thousands of brands and influencers already using InfluenceAI to create impactful partnerships.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="gradient-btn text-lg !px-8 !py-4 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-sm text-surface-400">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Data
// ============================================================

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Matching',
    description: 'Our machine learning algorithms analyze engagement, audience demographics, and content style to find your ideal influencer match.',
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track campaign performance, engagement rates, and ROI with comprehensive dashboards and automated reporting.',
    gradient: 'from-accent-500 to-accent-700',
  },
  {
    icon: Shield,
    title: 'Fraud Detection',
    description: 'AI-driven analysis detects fake followers, bot engagement, and fraudulent accounts to protect your investment.',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    icon: Zap,
    title: 'Campaign Automation',
    description: 'Automate outreach, contract management, content approval, and payment processing all in one platform.',
    gradient: 'from-emerald-500 to-emerald-700',
  },
  {
    icon: Users,
    title: 'Collaboration Tools',
    description: 'Built-in messaging, content calendars, and approval workflows keep brands and influencers aligned.',
    gradient: 'from-orange-500 to-orange-700',
  },
  {
    icon: TrendingUp,
    title: 'ROI Optimization',
    description: 'AI continuously learns from campaign data to suggest budget allocation and strategy improvements.',
    gradient: 'from-rose-500 to-rose-700',
  },
];

const steps = [
  {
    title: 'Create Your Campaign',
    description: 'Define your goals, budget, target audience, and content requirements. Our AI will handle the rest.',
  },
  {
    title: 'AI Finds Matches',
    description: 'Our engine analyzes millions of profiles to find influencers who align perfectly with your brand.',
  },
  {
    title: 'Collaborate & Grow',
    description: 'Manage the entire collaboration process, track results, and scale what works best.',
  },
];

const stats = [
  { value: '50K+', label: 'Active Influencers' },
  { value: '2,500+', label: 'Brands Using Us' },
  { value: '$120M+', label: 'Campaign Revenue' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: 'mo',
    description: 'Perfect for small brands',
    popular: false,
    features: [
      'Up to 5 campaigns/month',
      'Basic AI matching',
      'Email support',
      'Basic analytics',
      '10 influencer contacts',
    ],
  },
  {
    name: 'Professional',
    price: '$149',
    period: 'mo',
    description: 'For growing businesses',
    popular: true,
    features: [
      'Unlimited campaigns',
      'Advanced AI matching',
      'Priority support',
      'Advanced analytics',
      'Unlimited contacts',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: undefined,
    description: 'For large organizations',
    popular: false,
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'White-label solution',
      'SLA guarantee',
      'Custom AI models',
    ],
  },
];
