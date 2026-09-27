import React, { useEffect, useState } from 'react';
import { ArrowRight, Swords, Trophy, Zap, Terminal, Shield, CheckCircle2, Flame, Award, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Problem, Achievement, LeaderboardEntry, PlatformStats } from '../types';
import { SkeletonCard } from '../components/SkeletonLoader';

interface LandingViewProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenAuth }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [featuredProblems, setFeaturedProblems] = useState<Problem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [topLeaders, setTopLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [statsRes, problemsRes, achRes, leaderRes] = await Promise.all([
          api.getAdminStatistics().catch(() => null),
          api.getProblems({ limit: 4 }),
          api.getAchievements().catch(() => ({ achievements: [] })),
          api.getLeaderboard('global').catch(() => ({ leaderboard: [] })),
        ]);

        if (mounted) {
          if (statsRes) setStats(statsRes);
          setFeaturedProblems(problemsRes.problems || []);
          setAchievements(achRes.achievements?.slice(0, 4) || []);
          setTopLeaders(leaderRes.leaderboard?.slice(0, 3) || []);
        }
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-sky-400';
      case 'Easy':
        return 'text-emerald-400';
      case 'Medium':
        return 'text-amber-400';
      case 'Hard':
        return 'text-rose-400';
      case 'Expert':
        return 'text-purple-400';
      default:
        return 'text-neutral-400';
    }
  };

  return (
    <div className="relative z-10 space-y-24 py-12 md:py-20">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-indigo-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>Real Full-Stack MEAN Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans">
          Code. Compete. Conquer.
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Sharpen your programming skills, solve coding challenges, earn XP, maintain daily streaks, and compete with developers in real-time 1v1 arena battles.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('challenges')}
            className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Start Coding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('battle')}
            className="px-6 py-3 text-sm font-semibold text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors flex items-center gap-2"
          >
            <Swords className="w-4 h-4 text-amber-400" />
            <span>1v1 Arena</span>
          </button>
        </div>

        {/* Live Platform Stats */}
        {stats && (
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {stats.totalProblems}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Algorithmic Challenges</div>
            </div>
            <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
              <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
                {stats.totalSubmissions}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Code Submissions</div>
            </div>
            <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {stats.totalUsers}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Developers Active</div>
            </div>
            <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {stats.overallAcceptanceRate}%
              </div>
              <div className="text-xs text-neutral-500 mt-1">Acceptance Rate</div>
            </div>
          </div>
        )}
      </section>

      {/* Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for Developer Mastery
          </h2>
          <p className="text-neutral-400 text-sm">
            Everything you need to level up your algorithms and system thinking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Monaco Code IDE</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Full VS Code editor experience with syntax highlighting, line numbers, customizable font sizes, and multi-language support.
            </p>
          </div>

          <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Swords className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">1v1 Real-Time Battle Arena</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Challenge peers or random developers to head-to-head live coding duels. First to pass all test cases claims victory and XP bounties.
            </p>
          </div>

          <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Sandboxed Execution</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              All submissions run in an isolated environment with memory and timeout limits. Accurate execution time in milliseconds and memory metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Coding Challenges Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Challenges</h2>
            <p className="text-xs text-neutral-400 mt-1">Real algorithmic problems from MongoDB</p>
          </div>
          <button
            onClick={() => onNavigate('challenges')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredProblems.map((problem) => (
              <div
                key={problem.id}
                onClick={() => onNavigate('problem-detail', problem.slug || problem.id)}
                className="p-5 bg-neutral-900/40 border border-neutral-800/90 hover:border-indigo-500/40 rounded-xl cursor-pointer transition-all hover:translate-y-[-2px] group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <span>{problem.category}</span>
                      <span>·</span>
                      <span className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</span>
                      <span>·</span>
                      <span>{problem.points} XP</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {problem.acceptanceRate}% Pass
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Gamification & Achievements Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Gamified Progression</h2>
          <p className="text-neutral-400 text-sm">
            Earn milestone badges, gain XP on accepted submissions, and maintain your coding streak.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl text-center space-y-2 hover:border-neutral-700 transition-colors"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-semibold text-white">{ach.title}</h4>
              <p className="text-[11px] text-neutral-400 line-clamp-2">{ach.description}</p>
              <div className="text-[10px] font-mono text-amber-300 font-semibold pt-1">
                +{ach.xpReward} XP
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard Callout */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 bg-gradient-to-br from-neutral-900 to-indigo-950/30 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-mono text-xs font-semibold">
              <Trophy className="w-4 h-4" />
              <span>Global Rankings</span>
            </div>
            <h3 className="text-xl font-bold text-white">Compete with Developers Worldwide</h3>
            <p className="text-xs text-neutral-400 max-w-md">
              Calculate your rank against actual MongoDB user data. Weekly and monthly leaderboards reset with prizes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('leaderboard')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            Open Leaderboard
          </button>
        </div>
      </section>
    </div>
  );
};
