import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Sparkles, Menu, X, LogOut, LayoutDashboard, User, ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">InfluenceAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive('/dashboard') ? 'text-white bg-white/10' : 'text-surface-300 hover:text-white hover:bg-white/5'}`}>Dashboard</Link>
              </>
            ) : (
              <>
                <button onClick={() => scrollTo('features')} className="px-4 py-2 rounded-lg text-sm font-medium text-surface-300 hover:text-white hover:bg-white/5 transition-all duration-300">Features</button>
                <button onClick={() => scrollTo('how-it-works')} className="px-4 py-2 rounded-lg text-sm font-medium text-surface-300 hover:text-white hover:bg-white/5 transition-all duration-300">How It Works</button>
                <button onClick={() => scrollTo('pricing')} className="px-4 py-2 rounded-lg text-sm font-medium text-surface-300 hover:text-white hover:bg-white/5 transition-all duration-300">Pricing</button>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <span className="text-sm font-medium text-surface-200">{user.firstName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 font-semibold uppercase tracking-wider">{user.role}</span>
                  <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 overflow-hidden z-50" style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
                      <div className="p-3" style={{ borderBottom: '1px solid #374151' }}>
                        <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-surface-400">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-white rounded-lg transition-all" onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1F2937')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-white rounded-lg transition-all" onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1F2937')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <User className="w-4 h-4" /> Settings
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg transition-all" onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-surface-300 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="gradient-btn text-sm !px-5 !py-2">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-surface-300 hover:text-white transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden" style={{ backgroundColor: '#111827', borderTop: '1px solid #374151' }}>
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-surface-300 hover:text-white hover:bg-white/5 transition-all">Dashboard</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => scrollTo('features')} className="w-full text-left px-4 py-3 rounded-lg text-surface-300 hover:text-white hover:bg-white/5 transition-all">Features</button>
                <button onClick={() => scrollTo('how-it-works')} className="w-full text-left px-4 py-3 rounded-lg text-surface-300 hover:text-white hover:bg-white/5 transition-all">How It Works</button>
                <button onClick={() => scrollTo('pricing')} className="w-full text-left px-4 py-3 rounded-lg text-surface-300 hover:text-white hover:bg-white/5 transition-all">Pricing</button>
                <div className="pt-3 space-y-2 border-t border-white/10">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center px-4 py-3 rounded-xl border border-white/10 text-surface-200 hover:bg-white/5 transition-all">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-center gradient-btn">Get Started Free</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
