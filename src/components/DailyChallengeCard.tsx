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
  Code2,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { Problem, User } from '../types';

export interface DailyChallengeCardProps {
  user?: User | null;
  onNavigate: (view: string, param?: string) => void;
  onSolve?: (problemId: string) => void;
  className?: string;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  user,
  onNavigate,
  onSolve,
  className = '',
}) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Real-time countdown timer to midnight UTC/Local
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
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch GET /api/problems/daily
  const fetchDailyChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDailyProblem();
      if (res && res.problem) {
        setProblem(res.problem);
      } else {
        // Direct fetch fallback in case of envelope differences
        const directRes = await fetch('/api/problems/daily');
        if (!directRes.ok) throw new Error(`HTTP ${directRes.status}`);
        const data = await directRes.json();
        if (data.problem) {
          setProblem(data.problem);
        } else {
          setError('No daily challenge found for today.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve today\'s challenge');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const isSolved = Boolean(
    user && problem && user.solvedProblemIds?.includes(problem.id)
  );

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
    const targetIdentifier = problem.slug || problem.id;
    if (onSolve) {
      onSolve(targetIdentifier);
    } else {
      // Navigate user to the problem details page
      onNavigate('problem-detail', targetIdentifier);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Skeleton loading state
  if (loading) {
    return (
      <div className={`p-6 bg-gradient-to-r from-neutral-900/90 via-indigo-950/20 to-neutral-900/90 border border-neutral-800 rounded-2xl animate-pulse space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-neutral-800 rounded w-36" />
          <div className="h-4 bg-neutral-800 rounded w-24" />
        </div>
        <div className="h-7 bg-neutral-800 rounded w-2/5" />
        <div className="h-4 bg-neutral-800/70 rounded w-3/4" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 bg-neutral-800 rounded w-16" />
          <div className="h-5 bg-neutral-800 rounded w-20" />
          <div className="h-5 bg-neutral-800 rounded w-16" />
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error || !problem) {
    return (
      <div className={`p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${className}`}>
        <div className="flex items-center gap-2.5 text-neutral-400">
          <Calendar className="w-4 h-4 text-neutral-500" />
          <span>{error || 'Unable to load today\'s challenge.'}</span>
        </div>
        <button
          onClick={fetchDailyChallenge}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-600/40 transition-all font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label="Daily Coding Challenge"
      className={`relative overflow-hidden p-6 sm:p-7 bg-[#211A28] border border-[#2e2439] hover:border-[#A855F7]/50 rounded-2xl shadow-xl shadow-black/40 transition-all duration-300 group ${className}`}
    >
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#A855F7]/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24 transition-opacity group-hover:opacity-100 opacity-60" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Challenge Details */}
        <div className="space-y-3.5 max-w-3xl">
          {/* Header row: Badge, Date, Countdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#A855F7] font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
              <span>Daily Challenge</span>
            </div>

            <span className="text-xs text-[#A1A1AA] font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#A1A1AA]" />
              {todayFormatted}
            </span>

            {/* Countdown timer */}
            <span className="text-xs text-[#A1A1AA] font-mono flex items-center gap-1 bg-[#17131C] border border-[#2e2439] px-2 py-0.5 rounded">
              <Clock className="w-3 h-3 text-[#F59E0B]" />
              <span>Resets in {timeUntilReset}</span>
            </span>
          </div>

          {/* Title & Solved Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#FAFAFA] tracking-tight group-hover:text-[#A855F7] transition-colors">
              {problem.title}
            </h2>
            {isSolved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solved</span>
              </span>
            )}
          </div>

          {/* Metadata Badges: Difficulty, Category, Points, Stats */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className={`px-2.5 py-0.5 rounded border font-semibold ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>

            <span className="text-[#FAFAFA] flex items-center gap-1 bg-[#17131C] border border-[#2e2439] px-2.5 py-0.5 rounded">
              <Tag className="w-3 h-3 text-[#A1A1AA]" />
              {problem.category}
            </span>

            <span className="text-[#F59E0B] font-bold flex items-center gap-1 bg-[#F59E0B]/10 border border-[#F59E0B]/25 px-2.5 py-0.5 rounded">
              <Zap className="w-3 h-3 fill-[#F59E0B]" />
              +{problem.points} XP
            </span>

            <span className="text-[#A1A1AA] flex items-center gap-1 bg-[#17131C] border border-[#2e2439] px-2.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 text-[#A1A1AA]" />
              {problem.acceptanceRate}% pass rate ({problem.totalAttempts} attempts)
            </span>

            {problem.supportedLanguages && problem.supportedLanguages.length > 0 && (
              <span className="text-[#A1A1AA] flex items-center gap-1">
                <Code2 className="w-3 h-3" />
                {problem.supportedLanguages.slice(0, 3).join(', ')}
                {problem.supportedLanguages.length > 3 && ` +${problem.supportedLanguages.length - 3}`}
              </span>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed line-clamp-2 pt-0.5 font-sans">
            {problem.description}
          </p>
        </div>

        {/* Right Side: Streak Reminder & 'Solve Now' Button */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3.5 shrink-0">
          <div className="text-left lg:text-right space-y-0.5">
            <div className="flex items-center lg:justify-end gap-1.5 text-xs text-[#F97316] font-mono font-semibold">
              <Flame className="w-4 h-4 fill-[#F97316]" />
              <span>Streak Milestone</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Solve today to preserve your {user?.streak || 0}-day streak!
            </p>
          </div>

          <button
            onClick={handleSolveNow}
            className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] active:scale-95 rounded-xl shadow-lg shadow-[#A855F7]/30 transition-all flex items-center justify-center gap-2 group/btn whitespace-nowrap cursor-pointer"
          >
            <span>{isSolved ? 'Solve Again' : 'Solve Now'}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DailyChallengeCard;
