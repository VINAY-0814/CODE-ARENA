import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Flame, Zap, CheckCircle2, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';
import { LeaderboardEntry } from '../types';
import { SkeletonTable } from '../components/SkeletonLoader';

export const LeaderboardView: React.FC = () => {
  const [type, setType] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLeaderboard = async (selectedType: 'global' | 'weekly' | 'monthly') => {
    setLoading(true);
    try {
      const res = await api.getLeaderboard(selectedType);
      setLeaders(res.leaderboard || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(type);
  }, [type]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono ring-1 ring-amber-400/40">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 flex items-center justify-center font-bold text-xs font-mono ring-1 ring-slate-300/40">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 flex items-center justify-center font-bold text-xs font-mono ring-1 ring-amber-600/40">
            🥉
          </div>
        );
      default:
        return <span className="font-mono text-neutral-400 text-xs pl-1">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold mb-1">
            <Trophy className="w-4 h-4" />
            <span>Developer Hall of Fame</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real rankings calculated from MongoDB submissions and XP milestones.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setType('global')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              type === 'global' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => setType('weekly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              type === 'weekly' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setType('monthly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              type === 'monthly' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <SkeletonTable rows={8} cols={6} />
      ) : leaders.length === 0 ? (
        <div className="py-16 text-center bg-neutral-900/30 border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
          No rankings found in this bracket.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/70 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-16">Rank</th>
                <th className="py-3.5 px-4">Developer</th>
                <th className="py-3.5 px-4 text-center">Level</th>
                <th className="py-3.5 px-4 text-right">Total XP</th>
                <th className="py-3.5 px-4 text-center">Solved</th>
                <th className="py-3.5 px-4 text-center">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40 text-neutral-300">
              {leaders.map((leader) => (
                <tr key={leader.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3.5 px-4">{getRankBadge(leader.rank)}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={leader.profileImage}
                        alt={leader.username}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-700"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="font-semibold text-white">{leader.name}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          @{leader.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Lv.{leader.level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {leader.xp.toLocaleString()} XP
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-neutral-400">
                    {leader.problemsSolved}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-amber-400 text-xs">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{leader.streak}d</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
