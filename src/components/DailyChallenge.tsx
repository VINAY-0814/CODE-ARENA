import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Flame,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { api } from '../services/api';
import { Problem, User } from '../types';

interface DailyChallengeProps {
  user: User | null;
  onNavigate: (view: string, param?: string) => void;
  onSolve?: (problemId: string) => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  user,
  onNavigate,
  onSolve,
}) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Calculate time remaining until midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch GET /api/problems/daily
  const fetchDailyProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDailyProblem();
      if (res.problem) {
        setProblem(res.problem);
      } else {
        setError('No daily challenge available right now.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch today\'s daily challenge.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyProblem();
  }, []);

  const isSolved = user && problem && user.solvedProblemIds?.includes(problem.id);

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Expert':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-neutral-400 bg-neutral-800 border-neutral-700';
    }
  };

  const handleSolveNow = () => {
    if (!problem) return;
    if (onSolve) {
      onSolve(problem.slug || problem.id);
    } else {
      onNavigate('problem-detail', problem.slug || problem.id);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-r from-neutral-900/90 via-indigo-950/20 to-neutral-900/90 border border-neutral-800 rounded-2xl animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-neutral-800 rounded w-36" />
          <div className="h-4 bg-neutral-800 rounded w-20" />
        </div>
        <div className="h-6 bg-neutral-800 rounded w-1/2" />
        <div className="h-3 bg-neutral-800/60 rounded w-3/4" />
        <div className="h-9 bg-neutral-800 rounded w-32 mt-2" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex items-center justify-between text-xs text-neutral-400">
        <span>{error || 'Unable to retrieve today\'s challenge.'}</span>
        <button
          onClick={fetchDailyProblem}
          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section
      aria-label="Daily Challenge"
      className="relative overflow-hidden p-6 md:p-7 bg-gradient-to-br from-neutral-900/95 via-indigo-950/25 to-neutral-900/90 border border-indigo-500/25 rounded-2xl shadow-xl shadow-black/40 transition-all hover:border-indigo-500/40 group"
    >
      {/* Background soft ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Badge, Date, Title, Description, Stats */}
        <div className="space-y-3 max-w-2xl">
          {/* Header Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Daily Challenge</span>
            </div>

            <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              {todayDateStr}
            </span>

            {/* Countdown to reset */}
            <span className="text-xs text-neutral-400 font-mono flex items-center gap-1 bg-neutral-950/70 border border-neutral-800 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Resets in {timeUntilReset}</span>
            </span>
          </div>

          {/* Title & Solved State */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
              {problem.title}
            </h2>
            {isSolved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solved</span>
              </span>
            )}
          </div>

          {/* Metadata: Category, Difficulty, XP */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className={`px-2 py-0.5 rounded border font-semibold ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>

            <span className="text-neutral-300 flex items-center gap-1 bg-neutral-950/60 border border-neutral-800/80 px-2 py-0.5 rounded">
              <Tag className="w-3 h-3 text-neutral-400" />
              {problem.category}
            </span>

            <span className="text-indigo-400 font-bold flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              <Zap className="w-3 h-3 fill-indigo-400" />
              +{problem.points} XP
            </span>

            <span className="text-neutral-500">
              · {problem.acceptanceRate}% pass rate ({problem.totalAttempts} attempts)
            </span>
          </div>

          {/* Description snippet */}
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-2 pt-1 font-sans">
            {problem.description}
          </p>
        </div>

        {/* Right Side: Prominent CTA & Streak Bonus */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
          <div className="text-left lg:text-right space-y-0.5">
            <div className="flex items-center lg:justify-end gap-1.5 text-xs text-amber-400 font-mono font-semibold">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Streak Milestone</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Solve today to maintain your {user?.streak || 0}-day streak!
            </p>
          </div>

          <button
            onClick={handleSolveNow}
            className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group/btn whitespace-nowrap"
          >
            <span>{isSolved ? 'Solve Again' : 'Solve Now'}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export { DailyChallengeCard } from './DailyChallengeCard';
export default DailyChallenge;
