import React, { useEffect, useState } from 'react';
import {
  Swords,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { User, BattleHistoryItem, BattleHistoryStats } from '../types';

interface BattleHistoryViewProps {
  user: User;
  onNavigate: (view: string, param?: string) => void;
  onBackToDashboard?: () => void;
}

export const BattleHistoryView: React.FC<BattleHistoryViewProps> = ({
  user,
  onNavigate,
  onBackToDashboard,
}) => {
  const [battles, setBattles] = useState<BattleHistoryItem[]>([]);
  const [stats, setStats] = useState<BattleHistoryStats>({
    totalCompleted: 0,
    totalVictories: 0,
    totalDefeats: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'victory' | 'defeat'>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBattleHistory(5);
      if (res && res.battles) {
        setBattles(res.battles);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err: any) {
      console.error('Failed to load battle history:', err);
      setError(err.message || 'Unable to retrieve battle records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredBattles = battles.filter((b) => {
    if (filter === 'all') return true;
    return b.outcome === filter;
  });

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffHours >= 24) {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
      }
      if (diffHours >= 1) return `${diffHours}h ago`;
      if (diffMins >= 1) return `${diffMins}m ago`;
      return 'just now';
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2e2439]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-1 -ml-1 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#211A28] rounded-lg transition-colors cursor-pointer"
                title="Back to Dashboard"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs font-mono font-medium text-[#F97316] uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5" />
              1v1 Arena History
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#FAFAFA] tracking-tight">
            Recent Battle History
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Displaying the last 5 completed battles of @{user.username}, showing opponents and outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#211A28] hover:bg-[#2e2439] border border-[#2e2439] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh History"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => onNavigate('battle')}
            className="px-4 py-1.5 text-xs font-semibold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] rounded-lg shadow-sm shadow-[#A855F7]/30 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>New 1v1 Battle</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[#211A28] border border-[#2e2439] rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
            <span>Completed Duels</span>
            <Shield className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FAFAFA] tabular-nums">
            {stats.totalCompleted}
          </div>
          <p className="text-[11px] text-[#A1A1AA]">Recorded 1v1 matches</p>
        </div>

        <div className="p-4 bg-[#211A28] border border-[#2e2439] rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
            <span>Victories</span>
            <Trophy className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#22C55E] tabular-nums flex items-baseline gap-1">
            {stats.totalVictories}
            <span className="text-xs font-normal text-[#A1A1AA]">wins</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA]">+200 XP earned per win</p>
        </div>

        <div className="p-4 bg-[#211A28] border border-[#2e2439] rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
            <span>Defeats</span>
            <XCircle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#EF4444] tabular-nums flex items-baseline gap-1">
            {stats.totalDefeats}
            <span className="text-xs font-normal text-[#A1A1AA]">losses</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA]">Rival solved faster</p>
        </div>

        <div className="p-4 bg-[#211A28] border border-[#2e2439] rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
            <span>Win Rate</span>
            <Flame className="w-4 h-4 text-[#F97316] fill-[#F97316]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F59E0B] tabular-nums">
            {stats.winRate}%
          </div>
          <p className="text-[11px] text-[#A1A1AA]">Battle victory ratio</p>
        </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-[#17131C] border border-[#2e2439] rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#211A28] text-[#FAFAFA] shadow-sm font-semibold'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            All Battles ({battles.length})
          </button>
          <button
            onClick={() => setFilter('victory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === 'victory'
                ? 'bg-[#211A28] text-[#22C55E] shadow-sm font-semibold'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            Victories ({battles.filter((b) => b.outcome === 'victory').length})
          </button>
          <button
            onClick={() => setFilter('defeat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === 'defeat'
                ? 'bg-[#211A28] text-[#EF4444] shadow-sm font-semibold'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            Defeats ({battles.filter((b) => b.outcome === 'defeat').length})
          </button>
        </div>

        <span className="text-xs font-mono text-[#A1A1AA]">
          Showing {filteredBattles.length} of {battles.length} battles
        </span>
      </div>

      {/* Battle Cards List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 bg-[#211A28] border border-[#2e2439] rounded-2xl animate-pulse flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              <div className="space-y-2 w-full md:w-1/2">
                <div className="h-4 bg-[#17131C] rounded w-1/3" />
                <div className="h-5 bg-[#17131C] rounded w-2/3" />
                <div className="h-3 bg-[#17131C] rounded w-1/2" />
              </div>
              <div className="h-10 bg-[#17131C] rounded w-32" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-[#211A28] border border-[#EF4444]/30 rounded-2xl space-y-3">
          <XCircle className="w-8 h-8 text-[#EF4444] mx-auto" />
          <p className="text-sm font-semibold text-[#FAFAFA]">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 text-xs font-semibold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] rounded-xl transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : filteredBattles.length === 0 ? (
        <div className="p-12 text-center bg-[#211A28] border border-[#2e2439] rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#17131C] border border-[#2e2439] flex items-center justify-center mx-auto text-[#F97316]">
            <Swords className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#FAFAFA]">No Battle Records Found</h3>
            <p className="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
              {filter !== 'all'
                ? `You don't have any battles matching the "${filter}" filter.`
                : 'You have not completed any 1v1 battles yet. Queue into the arena to challenge real developers!'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('battle')}
            className="px-5 py-2.5 text-xs font-semibold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] rounded-xl shadow-md shadow-[#A855F7]/30 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span>Enter Battle Lobby</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBattles.map((battle, index) => {
            const isVictory = battle.outcome === 'victory';
            const isDefeat = battle.outcome === 'defeat';
            const primaryOpponent = battle.opponents[0];

            return (
              <div
                key={battle.id || index}
                className={`p-5 rounded-2xl border transition-all duration-200 bg-[#211A28] ${
                  isVictory
                    ? 'border-[#22C55E]/30 hover:border-[#22C55E]/50'
                    : isDefeat
                    ? 'border-[#EF4444]/30 hover:border-[#EF4444]/50'
                    : 'border-[#2e2439] hover:border-[#A1A1AA]/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Column: Outcome, Title & Problem Meta */}
                  <div className="space-y-2.5">
                    {/* Outcome Badge & Clean Typographic Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider ${
                          isVictory
                            ? 'bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E]'
                            : isDefeat
                            ? 'bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444]'
                            : 'bg-[#A1A1AA]/15 border border-[#A1A1AA]/40 text-[#A1A1AA]'
                        }`}
                      >
                        {isVictory ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Victory</span>
                          </>
                        ) : isDefeat ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Defeat</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Draw</span>
                          </>
                        )}
                      </div>

                      {/* Clean typographic metadata without pill enclosures */}
                      <span className="font-mono text-[#A1A1AA] flex items-center gap-1.5">
                        <span className="text-[#FAFAFA] font-semibold">{battle.code}</span>
                        <span aria-hidden="true" className="text-[#2e2439]">·</span>
                        <span>{battle.problemDifficulty}</span>
                        <span aria-hidden="true" className="text-[#2e2439]">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#A1A1AA]" />
                          {formatRelativeTime(battle.endedAt)}
                        </span>
                      </span>
                    </div>

                    {/* Battle & Problem Title */}
                    <div>
                      <h3 className="text-base font-bold text-[#FAFAFA] group-hover:text-[#A855F7] transition-colors">
                        {battle.title}
                      </h3>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        Challenge: <span className="text-[#FAFAFA] font-medium">{battle.problemTitle}</span>
                      </p>
                    </div>

                    {/* Match Score & Tests Passed Comparison */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-[#FAFAFA]">
                        <span className="text-[#A1A1AA]">Your Score:</span>
                        <span className="font-bold text-[#FAFAFA]">
                          {battle.userResult.testsPassed}/{battle.userResult.totalTests} tests
                        </span>
                        {battle.userResult.executionTimeMs > 0 && (
                          <span className="text-[#A1A1AA]/70 text-[11px]">
                            ({battle.userResult.executionTimeMs}ms)
                          </span>
                        )}
                      </div>

                      {isVictory && (
                        <span className="text-[#F59E0B] font-bold flex items-center gap-1 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-2 py-0.5 rounded">
                          <Zap className="w-3 h-3 fill-[#F59E0B]" />
                          +200 XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Opponent Card */}
                  <div className="p-3 bg-[#17131C] border border-[#2e2439] rounded-xl flex items-center gap-3.5 min-w-[240px]">
                    {primaryOpponent ? (
                      <>
                        <img
                          src={primaryOpponent.profileImage}
                          alt={primaryOpponent.username}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#2e2439]"
                        />
                        <div className="space-y-0.5 text-xs">
                          <div className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider">
                            Rival Opponent
                          </div>
                          <div className="font-bold text-[#FAFAFA]">
                            @{primaryOpponent.username}
                          </div>
                          <div className="font-mono text-[11px] text-[#A1A1AA]">
                            Passed: {primaryOpponent.testsPassed}/{primaryOpponent.totalTests} tests
                            {primaryOpponent.executionTimeMs > 0 && ` (${primaryOpponent.executionTimeMs}ms)`}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-[#A1A1AA] font-mono">
                        Solo / Unmatched Challenge
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => onNavigate('problem-detail', battle.problemId)}
                      className="px-3 py-2 text-xs font-medium text-[#FAFAFA] bg-[#17131C] hover:bg-[#2e2439] border border-[#2e2439] rounded-xl transition-colors cursor-pointer"
                      title="Inspect challenge problem"
                    >
                      View Problem
                    </button>

                    <button
                      onClick={() => onNavigate('battle')}
                      className="px-3.5 py-2 text-xs font-semibold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] rounded-xl shadow-sm shadow-[#A855F7]/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Queue into a rematch battle"
                    >
                      <span>Rematch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
