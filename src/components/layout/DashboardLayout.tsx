import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { LucideIcon } from 'lucide-react';
import {
  Sparkles, LayoutDashboard, Target, Users, MessageSquare, Settings,
  LogOut, ChevronLeft, ChevronRight, Search, Bell, Briefcase, Star,
  History, UserCircle, Send, BarChart3, Menu, Brain, Wand2,
  User,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const brandNav: NavItem[] = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/campaigns', label: 'Campaigns', icon: Target, badge: 6 },
    { path: '/dashboard/influencers', label: 'Find Influencers', icon: Search },
    { path: '/dashboard/applicants', label: 'Applicants', icon: Users, badge: 3 },
    { path: '/dashboard/collaborations', label: 'Collaborations', icon: Briefcase },
    { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/dashboard/ml-predict', label: 'AI Predictions', icon: Brain },
    { path: '/dashboard/ai-generator', label: 'AI Generator', icon: Wand2 },
    { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const influencerNav: NavItem[] = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/profile', label: 'My Profile', icon: UserCircle },
    { path: '/dashboard/invitations', label: 'Invitations', icon: Send, badge: 2 },
    { path: '/dashboard/campaigns', label: 'Browse Campaigns', icon: Target },
    { path: '/dashboard/applications', label: 'My Applications', icon: Star },
    { path: '/dashboard/collaborations', label: 'Collaborations', icon: Briefcase },
    { path: '/dashboard/history', label: 'History', icon: History },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = user.role === 'brand' ? brandNav : influencerNav;
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Demo notifications
  const notifications = [
    { id: '1', text: 'New application received for Summer Launch', time: '2 min ago', unread: true },
    { id: '2', text: 'Emma Wilson accepted your invitation', time: '1 hour ago', unread: true },
    { id: '3', text: 'Campaign "Back to School" is trending', time: '3 hours ago', unread: false },
    { id: '4', text: 'Ryan Patel submitted content for review', time: '5 hours ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-2 px-4 h-16 border-b border-white/5 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="text-lg font-bold gradient-text whitespace-nowrap">InfluenceAI</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
              isActive(item.path)
                ? 'bg-primary-500/15 text-primary-300 shadow-sm shadow-primary-500/10'
                : 'text-surface-400 hover:text-white hover:bg-white/5'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive(item.path) ? 'text-primary-400' : ''}`} />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-primary-500/20 text-primary-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
            {collapsed && item.badge && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary-400" />
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3 space-y-2 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-surface-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-surface-500 hover:text-white hover:bg-white/5 transition-all justify-center"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-white/5 bg-surface-950/80 backdrop-blur-xl transition-all duration-300 shrink-0 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-surface-950 border-r border-white/5 z-50 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0 bg-surface-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-surface-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-64 pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-surface-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ── NOTIFICATION BELL ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 text-surface-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden z-50" style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #374151' }}>
                    <h4 className="text-sm font-semibold text-white">Notifications</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300">{unreadCount} new</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 cursor-pointer transition-colors" style={{ borderBottom: '1px solid #1F2937', backgroundColor: n.unread ? 'rgba(108,77,246,0.08)' : 'transparent' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1F2937')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = n.unread ? 'rgba(108,77,246,0.08)' : 'transparent')}>
                        <div className="flex items-start gap-2">
                          {n.unread && <span className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />}
                          <div className={n.unread ? '' : 'ml-4'}>
                            <p className="text-xs text-white leading-relaxed">{n.text}</p>
                            <p className="text-[10px] text-surface-500 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2" style={{ borderTop: '1px solid #374151' }}>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-primary-400 hover:text-primary-300 w-full text-center py-1"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Home Link ── */}
            <Link to="/" className="p-2 text-surface-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 hidden sm:block">
              <span className="text-xs">← Home</span>
            </Link>

            {/* ── PROFILE AVATAR DROPDOWN ── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:shadow-lg hover:shadow-primary-500/30 transition-shadow"
              >
                {user.firstName[0]}{user.lastName[0]}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden z-50" style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #374151' }}>
                    <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-surface-400 mt-0.5">{user.email}</p>
                    <span className="inline-block mt-1.5 text-[9px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 font-semibold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <div className="p-1">
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-white rounded-lg transition-all" style={{ }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1F2937')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to={user.role === 'influencer' ? '/dashboard/profile' : '/dashboard/settings'} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-white rounded-lg transition-all" onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1F2937')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <User className="w-4 h-4" /> {user.role === 'influencer' ? 'My Profile' : 'Settings'}
                    </Link>
                    <Link to="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-white rounded-lg transition-all" onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1F2937')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg transition-all" onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
