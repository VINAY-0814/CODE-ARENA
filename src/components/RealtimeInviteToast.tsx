import React from 'react';
import { Swords, X, Check, ArrowRight, Clock } from 'lucide-react';
import { BattleInvite } from '../types';

interface RealtimeInviteToastProps {
  invite: BattleInvite | null;
  onAccept: (invite: BattleInvite) => void;
  onDecline: (invite: BattleInvite) => void;
  onDismiss: () => void;
}

export const RealtimeInviteToast: React.FC<RealtimeInviteToastProps> = ({
  invite,
  onAccept,
  onDecline,
  onDismiss,
}) => {
  if (!invite) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="p-4 bg-[#211A28] border-2 border-[#F97316] rounded-2xl shadow-2xl shadow-black/90 space-y-3 relative overflow-hidden backdrop-blur-md">
        {/* Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F97316] via-[#A855F7] to-[#F59E0B]" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5 text-[#F97316] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F97316]">
                  1v1 Duel Challenge!
                </span>
              </div>
              <p className="text-xs font-bold text-[#FAFAFA] truncate">
                @{invite.fromUsername} challenged you
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#17131C] rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Problem details */}
        <div className="p-2.5 bg-[#17131C] border border-[#2e2439] rounded-xl flex items-center justify-between text-xs font-mono">
          <span className="text-[#FAFAFA] font-medium truncate max-w-[200px]">
            {invite.problemTitle}
          </span>
          <span className="text-[#F97316] text-[10px] bg-[#F97316]/10 px-2 py-0.5 rounded border border-[#F97316]/20 shrink-0">
            {invite.problemDifficulty}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAccept(invite)}
            className="flex-1 py-2 px-3 bg-[#22C55E] hover:bg-[#16a34a] text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#22C55E]/30 cursor-pointer active:scale-95"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Accept Duel</span>
          </button>

          <button
            onClick={() => onDecline(invite)}
            className="py-2 px-3 bg-[#17131C] hover:bg-[#2e2439] text-[#A1A1AA] hover:text-[#EF4444] border border-[#2e2439] hover:border-[#EF4444]/40 font-medium text-xs rounded-xl transition-all cursor-pointer"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};
