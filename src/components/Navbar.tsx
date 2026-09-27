import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Code2, LayoutDashboard, Shield, Bell, Flame, Zap, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { User, NotificationItem, BattleInvite } from '../types';
import { NotificationDropdown } from './NotificationDropdown';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  pendingInvites?: BattleInvite[];
  unreadCount: number;
  onRefreshNotifications: () => void;
  onAcceptInvite?: (invite: BattleInvite) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  notifications,
  pendingInvites = [],
  unreadCount,
  onRefreshNotifications,
  onAcceptInvite,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container') && !target.closest('.notif-container')) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'battle', label: 'Coding Battle' },
    ...(user ? [{ id: 'dashboard', label: 'Dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#211A28] bg-[#17131C]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Title Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2 group text-left transition-transform active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#A855F7] to-[#F97316] flex items-center justify-center shadow-sm shadow-[#A855F7]/30 ring-1 ring-white/10 group-hover:shadow-[#A855F7]/50 transition-all">
              <Code2 className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="font-mono text-base font-bold tracking-tight text-[#FAFAFA] group-hover:text-[#A855F7] transition-colors">
              &lt;CodeArena /&gt;
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md relative whitespace-nowrap ${
                    isActive
                      ? 'text-[#FAFAFA] bg-[#211A28] border border-[#2e2439] font-semibold'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#211A28]/50'
                  }`}
                >
                  {item.label}
                  {item.id === 'battle' && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold text-[#F97316] bg-[#F97316]/10 border border-[#F97316]/30 rounded">
                      1v1
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Zone 3: Actions & User State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Color Palette Selector */}
          <ThemeSelector />

          {user ? (
            <div className="flex items-center gap-2">
              {/* Gamification Stats: Streak & Level */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#211A28] border border-[#2e2439] rounded-lg text-xs font-mono">
                <div className="flex items-center gap-1 text-[#F97316]" title={`Current streak: ${user.streak} days`}>
                  <Flame className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                  <span className="font-bold">{user.streak}d</span>
                </div>
                <span className="text-[#A1A1AA]/40">|</span>
                <div className="flex items-center gap-1 text-[#F59E0B]" title={`Level ${user.level} (${user.xp} XP)`}>
                  <Zap className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-bold">Lv.{user.level}</span>
                  <span className="text-[#A1A1AA] text-[11px]">({user.xp} XP)</span>
                </div>
              </div>

              {/* Notification Bell with Realtime Battle Invite Badge */}
              <div className="relative notif-container">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-lg transition-all cursor-pointer ${
                    pendingInvites.length > 0
                      ? 'text-[#F97316] bg-[#F97316]/10 hover:bg-[#F97316]/20 border border-[#F97316]/40 shadow-sm shadow-[#F97316]/25 animate-pulse'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#211A28]'
                  }`}
                  aria-label="Notifications"
                  title={
                    pendingInvites.length > 0
                      ? `${pendingInvites.length} pending 1v1 battle challenge${pendingInvites.length > 1 ? 's' : ''}!`
                      : `${unreadCount} notifications`
                  }
                >
                  <Bell className="w-4 h-4" />
                  {pendingInvites.length > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-[18px] px-1 items-center justify-center bg-[#F97316] text-black font-mono font-extrabold text-[10px] rounded-full ring-2 ring-[#17131C] shadow-md shadow-[#F97316]/50">
                      {pendingInvites.length}
                    </span>
                  ) : unreadCount > 0 ? (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#A855F7] rounded-full ring-2 ring-[#0D0B0F] animate-pulse" />
                  ) : null}
                </button>

                {showNotifications && (
                  <NotificationDropdown
                    notifications={notifications}
                    pendingInvites={pendingInvites}
                    onClose={() => setShowNotifications(false)}
                    onRefresh={onRefreshNotifications}
                    onNavigate={onNavigate}
                    onAcceptInvite={onAcceptInvite}
                  />
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors"
                >
                  <img
                    src={user.profileImage}
                    alt={user.username}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-700"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-neutral-200 truncate max-w-[100px]">
                    {user.username}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl shadow-black/60 py-1.5 text-xs text-neutral-300 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2.5 border-b border-neutral-800">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-neutral-500 text-[11px] truncate">@{user.username}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800/70 hover:text-white transition-colors text-left"
                    >
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800/70 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('battle/history');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800/70 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <Swords className="w-4 h-4 text-[#F97316]" />
                      Battle History
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800/70 text-indigo-300 transition-colors text-left"
                      >
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="my-1 border-t border-neutral-800" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#211A28] rounded-lg transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] rounded-lg shadow-sm shadow-[#A855F7]/30 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                currentView === item.id ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-sm text-neutral-300 bg-neutral-900 rounded-lg"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
