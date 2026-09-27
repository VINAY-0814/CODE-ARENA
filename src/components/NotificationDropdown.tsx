import React, { useState } from 'react';
import {
  Award,
  Swords,
  Flame,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NotificationItem, BattleInvite } from '../types';
import { api } from '../services/api';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  pendingInvites?: BattleInvite[];
  onClose: () => void;
  onRefresh: () => void;
  onNavigate: (view: string, param?: string) => void;
  onAcceptInvite?: (invite: BattleInvite) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  pendingInvites = [],
  onClose,
  onRefresh,
  onNavigate,
  onAcceptInvite,
}) => {
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await api.markAllNotificationsAsRead();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptInvite = async (invite: BattleInvite, e: React.MouseEvent) => {
    e.stopPropagation();
    setProcessingInviteId(invite.id);
    try {
      const res = await api.acceptBattleInvite(invite.id);
      onRefresh();
      onClose();
      if (onAcceptInvite) {
        onAcceptInvite(invite);
      } else {
        onNavigate('battle', res.battleId || invite.battleId);
      }
    } catch (err) {
      console.error('Failed to accept invite:', err);
      setProcessingInviteId(null);
    }
  };

  const handleDeclineInvite = async (invite: BattleInvite, e: React.MouseEvent) => {
    e.stopPropagation();
    setProcessingInviteId(invite.id);
    try {
      await api.declineBattleInvite(invite.id);
      onRefresh();
      setProcessingInviteId(null);
    } catch (err) {
      console.error('Failed to decline invite:', err);
      setProcessingInviteId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-4 h-4 text-[#F59E0B]" />;
      case 'battle_invite':
      case 'battle':
        return <Swords className="w-4 h-4 text-[#F97316]" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-[#F97316]" />;
      default:
        return <Bell className="w-4 h-4 text-[#A855F7]" />;
    }
  };

  const totalCount = notifications.length + pendingInvites.length;
  const unreadCount =
    notifications.filter((n) => !n.isRead).length + pendingInvites.length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-[410px] bg-[#17131C] border border-[#2e2439] rounded-2xl shadow-2xl shadow-black/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Dropdown Header */}
      <div className="px-4 py-3 border-b border-[#2e2439] flex items-center justify-between bg-[#211A28]/80">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-[#FAFAFA]">Notifications</span>
          {totalCount > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#17131C] text-[#FAFAFA] border border-[#2e2439]">
              {unreadCount > 0 ? `${unreadCount} new` : totalCount}
            </span>
          )}
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAll}
            className="text-[11px] text-[#A855F7] hover:text-[#9333ea] flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-[#2e2439]/60">
        {/* Section 1: Pending 1v1 Battle Invites */}
        {pendingInvites.length > 0 && (
          <div className="p-3 bg-gradient-to-b from-[#F97316]/10 to-transparent border-b border-[#2e2439] space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F97316] flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" />
                Pending 1v1 Duel Invites ({pendingInvites.length})
              </span>
              <span className="text-[10px] font-mono text-[#FAFAFA] bg-[#F97316]/20 px-1.5 py-0.2 rounded border border-[#F97316]/30 animate-pulse">
                Action required
              </span>
            </div>

            <div className="space-y-2">
              {pendingInvites.map((invite) => {
                const isBusy = processingInviteId === invite.id;

                return (
                  <div
                    key={invite.id}
                    className="p-3 bg-[#211A28] border border-[#F97316]/40 hover:border-[#F97316]/60 rounded-xl transition-all shadow-md shadow-black/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={invite.fromProfileImage}
                          alt={invite.fromUsername}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#F97316]/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-[#FAFAFA]">
                              @{invite.fromUsername}
                            </span>
                            <span className="text-[10px] text-[#A1A1AA]">
                              challenged you!
                            </span>
                          </div>
                          <div className="text-[11px] font-medium text-[#FAFAFA] truncate">
                            {invite.problemTitle}
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 text-[10px] font-mono text-[#F97316] bg-[#F97316]/15 border border-[#F97316]/30 px-2 py-0.5 rounded">
                        {invite.problemDifficulty}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#2e2439]">
                      <button
                        onClick={(e) => handleAcceptInvite(invite, e)}
                        disabled={isBusy}
                        className="flex-1 py-1.5 px-3 bg-[#22C55E] hover:bg-[#16a34a] text-black font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-[#22C55E]/30 cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Swords className="w-3.5 h-3.5" />
                            <span>Accept Duel</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => handleDeclineInvite(invite, e)}
                        disabled={isBusy}
                        className="py-1.5 px-3 bg-[#17131C] hover:bg-[#2e2439] text-[#A1A1AA] hover:text-[#EF4444] border border-[#2e2439] hover:border-[#EF4444]/40 font-medium text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Standard Notifications List */}
        {notifications.length === 0 && pendingInvites.length === 0 ? (
          <div className="py-10 text-center text-[#A1A1AA] text-xs space-y-2">
            <Bell className="w-6 h-6 text-[#A1A1AA]/40 mx-auto" />
            <p>No notifications yet.</p>
            <p className="text-[11px] text-[#A1A1AA]/60">
              Complete coding challenges and duels to earn trophies &amp; invites!
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.isRead) api.markNotificationAsRead(notif.id).then(onRefresh);
                if (notif.type === 'battle' || notif.type === 'battle_invite') onNavigate('battle');
                if (notif.type === 'achievement') onNavigate('profile');
                onClose();
              }}
              className={`p-3.5 flex gap-3 text-left transition-colors cursor-pointer hover:bg-[#211A28]/60 ${
                !notif.isRead ? 'bg-[#A855F7]/10' : ''
              }`}
            >
              <div className="mt-0.5 w-7 h-7 rounded-lg bg-[#211A28] border border-[#2e2439] flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p
                    className={`text-xs truncate ${
                      !notif.isRead ? 'font-semibold text-[#FAFAFA]' : 'text-[#A1A1AA]'
                    }`}
                  >
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-[#A1A1AA]/70 shrink-0 font-mono">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] line-clamp-2 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.isRead && (
                <button
                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                  title="Mark as read"
                  className="self-center p-1 text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-2.5 bg-[#211A28]/80 border-t border-[#2e2439] flex items-center justify-between text-[11px] text-[#A1A1AA] px-4">
        <button
          onClick={() => {
            onClose();
            onNavigate('battle/history');
          }}
          className="hover:text-[#FAFAFA] transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>View 1v1 Battle History</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => {
            onClose();
            onNavigate('battle');
          }}
          className="text-[#F97316] hover:text-[#ea580c] font-semibold transition-colors cursor-pointer flex items-center gap-1"
        >
          <Swords className="w-3 h-3" />
          <span>Arena Lobby</span>
        </button>
      </div>
    </div>
  );
};
