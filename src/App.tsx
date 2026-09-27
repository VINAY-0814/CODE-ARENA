import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import { User, NotificationItem, BattleInvite } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AnimatedBackground } from './components/AnimatedBackground';
import { AuthModal } from './components/AuthModal';
import { RealtimeInviteToast } from './components/RealtimeInviteToast';
import { getStoredTheme } from './services/theme';
import { realtimeNotificationService } from './services/realtime';
import { Swords } from 'lucide-react';

// Views
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { ChallengesView } from './views/ChallengesView';
import { ProblemDetailView } from './views/ProblemDetailView';
import { BattleView } from './views/BattleView';
import { LeaderboardView } from './views/LeaderboardView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Notifications & Real-time Invites
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingInvites, setPendingInvites] = useState<BattleInvite[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [incomingInviteToast, setIncomingInviteToast] = useState<BattleInvite | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Restore user session & initialize theme on startup
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', getStoredTheme());

    async function restoreSession() {
      if (api.getToken()) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setCurrentUser(res.user);
            // Default to dashboard when authenticated user visits root
            if (currentView === 'landing') {
              setCurrentView('dashboard');
            }
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          api.setToken(null);
        }
      }
    }
    restoreSession();
  }, []);

  // Fetch notifications & pending invites
  const refreshNotifications = async () => {
    if (!currentUser) return;
    try {
      const [notifsRes, invitesRes] = await Promise.all([
        api.getNotifications(),
        api.getPendingBattleInvites(),
      ]);
      setNotifications(notifsRes.notifications || []);
      setUnreadCount(notifsRes.unreadCount || 0);
      setPendingInvites(invitesRes.invites || []);
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  };

  // Real-time EventSource Connection & Listener
  useEffect(() => {
    if (currentUser) {
      refreshNotifications();
      realtimeNotificationService.connect();

      const unsubscribe = realtimeNotificationService.subscribe((event) => {
        if (event.type === 'NEW_BATTLE_INVITE' && event.invite) {
          setIncomingInviteToast(event.invite);
          setPendingInvites((prev) => {
            if (prev.some((i) => i.id === event.invite!.id)) return prev;
            return [event.invite!, ...prev];
          });
          refreshNotifications();
        } else if (event.type === 'INVITE_ACCEPTED') {
          setStatusToast(
            `⚔️ @${event.acceptedBy?.username || 'Opponent'} accepted your 1v1 duel challenge!`
          );
          setTimeout(() => setStatusToast(null), 5000);
          refreshNotifications();
        } else if (event.type === 'INVITE_DECLINED') {
          setStatusToast(
            `Opponent @${event.declinedBy?.username || 'user'} declined the challenge.`
          );
          setTimeout(() => setStatusToast(null), 4000);
          refreshNotifications();
        } else if (event.type === 'sync') {
          if (event.pendingInvites) {
            setPendingInvites(event.pendingInvites);
          }
          if (typeof event.unreadCount === 'number') {
            setUnreadCount(event.unreadCount);
          }
        }
      });

      // Safety polling interval every 6s to ensure synchronization
      const interval = setInterval(refreshNotifications, 6000);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    } else {
      realtimeNotificationService.disconnect();
      setNotifications([]);
      setPendingInvites([]);
      setUnreadCount(0);
      setIncomingInviteToast(null);
    }
  }, [currentUser]);

  const handleNavigate = (view: string, param?: string) => {
    // Guards
    if (
      (view === 'dashboard' ||
        view === 'profile' ||
        view === 'battle/history' ||
        view === '/battle/history' ||
        view === 'battle-history') &&
      !currentUser
    ) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    if (view === 'battle/history' || view === '/battle/history' || view === 'battle-history') {
      setCurrentView('battle-history');
      setViewParam(undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'admin') {
      if (!currentUser) {
        setAuthModalMode('login');
        setAuthModalOpen(true);
        return;
      }
      if (currentUser.role !== 'admin') {
        alert('Access denied: Administrator privileges required.');
        return;
      }
    }

    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAcceptInvite = async (invite: BattleInvite) => {
    setIncomingInviteToast(null);
    try {
      const res = await api.acceptBattleInvite(invite.id);
      refreshNotifications();
      handleNavigate('battle', res.battleId || invite.battleId);
    } catch (err: any) {
      console.error('Failed to accept invite:', err);
    }
  };

  const handleDeclineInvite = async (invite: BattleInvite) => {
    setIncomingInviteToast(null);
    try {
      await api.declineBattleInvite(invite.id);
      refreshNotifications();
    } catch (err: any) {
      console.error('Failed to decline invite:', err);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    refreshNotifications();
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-neutral-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative">
      {/* Animated Programming-Themed Background Component */}
      <AnimatedBackground />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        user={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        notifications={notifications}
        pendingInvites={pendingInvites}
        unreadCount={unreadCount}
        onRefreshNotifications={refreshNotifications}
        onAcceptInvite={handleAcceptInvite}
      />

      {/* Real-time Floating Challenge Toast for Incoming Battle Invites */}
      <RealtimeInviteToast
        invite={incomingInviteToast}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
        onDismiss={() => setIncomingInviteToast(null)}
      />

      {/* Real-time Status Toast for Challenge Events */}
      {statusToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#211A28] border border-[#A855F7]/40 text-[#FAFAFA] text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Swords className="w-4 h-4 text-[#F97316] shrink-0" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full relative z-10 pb-16">
        {currentView === 'landing' && (
          <LandingView onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {(currentView === 'dashboard' || currentView === 'battle-history' || currentView === 'battle/history' || currentView === '/battle/history') && currentUser && (
          <DashboardView
            user={currentUser}
            onNavigate={handleNavigate}
            initialTab={currentView.includes('battle') ? 'battle-history' : 'overview'}
          />
        )}

        {currentView === 'challenges' && (
          <ChallengesView user={currentUser} onNavigate={handleNavigate} />
        )}

        {currentView === 'problem-detail' && (
          <ProblemDetailView
            problemId={viewParam || 'two-sum'}
            user={currentUser}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onUserUpdate={setCurrentUser}
          />
        )}

        {currentView === 'battle' && (
          <BattleView
            user={currentUser}
            onOpenAuth={handleOpenAuth}
            onNavigate={handleNavigate}
            initialBattleId={currentView === 'battle' ? viewParam : undefined}
          />
        )}

        {currentView === 'leaderboard' && <LeaderboardView />}

        {currentView === 'profile' && currentUser && (
          <ProfileView currentUser={currentUser} onUserUpdate={setCurrentUser} />
        )}

        {currentView === 'admin' && currentUser && currentUser.role === 'admin' && (
          <AdminView currentUser={currentUser} onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
