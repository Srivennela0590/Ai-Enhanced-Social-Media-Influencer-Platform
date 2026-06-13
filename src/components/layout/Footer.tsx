import { Link } from 'react-router-dom';
import { Sparkles, Mail, Globe, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-surface-950">
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950/20 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">InfluenceAI</span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed mb-6">
              AI-powered platform connecting brands with the perfect influencers for impactful collaborations.
            </p>
            <div className="flex gap-3">
              {[MessageCircle, Globe, Sparkles, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-surface-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'AI Matching', 'Analytics', 'API'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-surface-400 hover:text-primary-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Press', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-surface-400 hover:text-primary-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-surface-400 hover:text-primary-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-surface-500">
            © 2024 InfluenceAI. All rights reserved.
          </p>
          <p className="text-xs text-surface-600">
            Built with React · TypeScript · Tailwind CSS · Drizzle ORM
          </p>
        </div>
      </div>
    </footer>
  );
}
