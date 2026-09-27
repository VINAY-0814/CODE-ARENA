import React, { useEffect, useState } from 'react';
import {
  Swords,
  X,
  Search,
  Zap,
  Flame,
  Trophy,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { AvailableOpponent } from '../types';

interface BattleInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  battleId?: string;
  problemId?: string;
  problemTitle?: string;
  defaultDifficulty?: string;
  onInviteSent?: (targetUsername: string, battleId: string) => void;
}

export const BattleInviteModal: React.FC<BattleInviteModalProps> = ({
  isOpen,
  onClose,
  battleId,
  problemId,
  problemTitle,
  defaultDifficulty = 'Easy',
  onInviteSent,
}) => {
  const [opponents, setOpponents] = useState<AvailableOpponent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>(defaultDifficulty);
  const [sendingToUserId, setSendingToUserId] = useState<string | null>(null);
  const [sentSuccessUserId, setSentSuccessUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);
    setErrorMessage(null);
    setSentSuccessUserId(null);

    async function loadOpponents() {
      try {
        const res = await api.getAvailableOpponents();
        if (mounted && res.users) {
          setOpponents(res.users);
        }
      } catch (err: any) {
        if (mounted) {
          setErrorMessage(err.message || 'Failed to load candidates.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOpponents();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOpponents = opponents.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendInvite = async (opp: AvailableOpponent) => {
    setSendingToUserId(opp.id);
    setErrorMessage(null);

    try {
      const res = await api.sendBattleInvite({
        toUserId: opp.id,
        battleId,
        problemId,
        difficulty,
      });

      setSentSuccessUserId(opp.id);
      if (onInviteSent) {
        onInviteSent(opp.username, res.battleId);
      }

      setTimeout(() => {
        setSentSuccessUserId(null);
        setSendingToUserId(null);
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send battle challenge.');
      setSendingToUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#211A28] border border-[#2e2439] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2e2439] flex items-center justify-between bg-[#17131C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F97316]/15 border border-[#F97316]/30 flex items-center justify-center text-[#F97316]">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FAFAFA]">
                Challenge to 1v1 Battle
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Send an instant real-time duel invite to an active developer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#211A28] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Challenge Config Row */}
        <div className="p-4 bg-[#17131C]/60 border-b border-[#2e2439] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono text-[#A1A1AA]">
              {problemTitle ? (
                <span>
                  Challenge Problem: <strong className="text-[#FAFAFA]">{problemTitle}</strong>
                </span>
              ) : (
                <span>Challenge Difficulty:</span>
              )}
            </span>

            {!problemTitle && (
              <div className="flex items-center gap-1">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
                          : diff === 'Medium'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                          : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                        : 'text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#211A28] border border-[#2e2439]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search developers by @username or name..."
              className="w-full pl-9 pr-3 py-2 bg-[#211A28] border border-[#2e2439] rounded-xl text-xs text-[#FAFAFA] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#A855F7] transition-all font-sans"
            />
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444]">
            {errorMessage}
          </div>
        )}

        {/* Opponents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-[#2e2439]/50">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-[#A855F7] animate-spin mx-auto" />
              <p className="text-xs text-[#A1A1AA]">Finding eligible challengers...</p>
            </div>
          ) : filteredOpponents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A1A1AA]">
              No matching opponents found.
            </div>
          ) : (
            filteredOpponents.map((opp) => {
              const isSending = sendingToUserId === opp.id;
              const isSuccess = sentSuccessUserId === opp.id;

              return (
                <div
                  key={opp.id}
                  className="pt-2 first:pt-0 flex items-center justify-between gap-3 hover:bg-[#17131C]/60 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={opp.profileImage}
                        alt={opp.username}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#2e2439]"
                      />
                      {opp.isOnline && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full ring-2 ring-[#211A28]"
                          title="Online now"
                        />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-[#FAFAFA] truncate">
                          {opp.name || opp.username}
                        </span>
                        <span className="font-mono text-[11px] text-[#A1A1AA]">
                          @{opp.username}
                        </span>
                        {opp.isOnline && (
                          <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.2 rounded border border-[#22C55E]/20">
                            online
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#A1A1AA]">
                        <span className="text-[#F59E0B] flex items-center gap-0.5">
                          <Zap className="w-3 h-3 fill-[#F59E0B]" />
                          Lv.{opp.level}
                        </span>
                        <span className="text-[#F97316] flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-[#F97316]" />
                          {opp.streak}d
                        </span>
                        <span className="text-[#A1A1AA]/60">Rank #{opp.rank}</span>
                      </div>
                    </div>
                  </div>

                  {/* Challenge Action Button */}
                  <div className="shrink-0">
                    {isSuccess ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 text-xs font-semibold rounded-lg font-mono animate-in zoom-in-90 duration-150">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Invited!</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendInvite(opp)}
                        disabled={isSending || !!sendingToUserId}
                        className="px-3.5 py-1.5 text-xs font-semibold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] active:scale-95 rounded-lg shadow-sm shadow-[#A855F7]/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Swords className="w-3.5 h-3.5" />
                            <span>Challenge</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#17131C] border-t border-[#2e2439] flex items-center justify-between text-xs text-[#A1A1AA]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F97316]" />
            Invited players receive a real-time notification alert
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#211A28] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
