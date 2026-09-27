import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Flame,
  Zap,
  Trophy,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Code2,
  ExternalLink,
  Award,
  LayoutDashboard,
  History,
} from 'lucide-react';
import { api } from '../services/api';
import { User, Problem, Submission } from '../types';
import { SkeletonCard, SkeletonTable } from '../components/SkeletonLoader';
import { DailyChallengeCard } from '../components/DailyChallengeCard';
import { StreakTracker } from '../components/StreakTracker';
import { BattleHistoryView } from '../components/BattleHistoryView';
import { BattleInviteModal } from '../components/BattleInviteModal';
import { Swords } from 'lucide-react';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface DashboardViewProps {
  user: User;
  onNavigate: (view: string, param?: string) => void;
  initialTab?: 'overview' | 'battle-history';
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onNavigate, initialTab = 'overview' }) => {
  const [profile, setProfile] = useState<User | null>(user);
  const [progress, setProgress] = useState<any | null>(null);
  const [dailyProblem, setDailyProblem] = useState<Problem | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'battle-history'>(initialTab);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      try {
        const [profRes, progRes, dailyRes, subRes] = await Promise.all([
          api.getProfile().catch(() => ({ user })),
          api.getProgress().catch(() => null),
          api.getDailyProblem().catch(() => ({ problem: null })),
          api.getRecentSubmissions().catch(() => ({ submissions: [] })),
        ]);

        if (mounted) {
          if (profRes.user) setProfile(profRes.user);
          if (progRes) setProgress(progRes);
          if (dailyRes.problem) setDailyProblem(dailyRes.problem);
          if (subRes.submissions) setRecentSubmissions(subRes.submissions);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, [user]);

  const activeUser = profile || user;

  // Chart data setup
  const chartData = {
    labels: progress?.xpProgressChart?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'XP Earned',
        data: progress?.xpProgressChart?.data || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#A855F7',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#0D0B0F',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#17131C',
        borderColor: '#211A28',
        borderWidth: 1,
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
        padding: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#A1A1AA', font: { family: "'JetBrains Mono', monospace", size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#A1A1AA', font: { family: "'JetBrains Mono', monospace", size: 10 }, stepSize: 20 },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
      {/* Top Banner / User Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#211A28] border border-[#2e2439] rounded-2xl shadow-xl shadow-black/40">
        <div className="flex items-center gap-4">
          <img
            src={activeUser.profileImage}
            alt={activeUser.username}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#A855F7]/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#FAFAFA]">{activeUser.name}</h1>
              <span className="text-xs font-mono text-[#A1A1AA]">@{activeUser.username}</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Rank #{activeUser.rank || 1} · Level {activeUser.level} Coder · {activeUser.role.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('challenges')}
            className="px-4 py-2 text-xs font-semibold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] rounded-xl shadow-sm shadow-[#A855F7]/30 transition-all cursor-pointer"
          >
            Explore Challenges
          </button>
          <button
            onClick={() => onNavigate('battle')}
            className="px-4 py-2 text-xs font-semibold text-[#FAFAFA] bg-[#211A28] hover:bg-[#2e2439] border border-[#2e2439] rounded-xl transition-colors cursor-pointer"
          >
            1v1 Arena
          </button>
        </div>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#2e2439] pb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-[#17131C] border border-[#2e2439] rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#211A28] text-[#FAFAFA] border border-[#2e2439] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('battle-history')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'battle-history'
                ? 'bg-[#211A28] text-[#FAFAFA] border border-[#2e2439] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Battle History</span>
            <span className="text-[10px] font-mono text-[#F97316] bg-[#F97316]/10 px-1.5 py-0.2 rounded border border-[#F97316]/30">
              /battle/history
            </span>
          </button>
        </div>

        {activeTab === 'overview' && (
          <button
            onClick={() => setActiveTab('battle-history')}
            className="text-xs font-mono text-[#A855F7] hover:text-[#9333ea] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Recent 1v1 Battles</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {activeTab === 'battle-history' ? (
        <BattleHistoryView
          user={activeUser}
          onNavigate={onNavigate}
          onBackToDashboard={() => setActiveTab('overview')}
        />
      ) : (
        <>
          {/* Interactive StreakTracker Component with Flame Icon & Visual Progress */}
          <StreakTracker user={activeUser} onNavigate={onNavigate} />

      {/* Gamification Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Real Streak */}
        <div className="p-4 bg-[#211A28] border border-[#2e2439] rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-[#F97316] fill-[#F97316]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FAFAFA] tabular-nums flex items-baseline gap-1">
            {activeUser.streak}
            <span className="text-xs font-normal text-[#A1A1AA]">days</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA]">Active activity recorded today</p>
        </div>

        {/* Real Level & XP */}
        <div className="p-4 bg-[#211A28] border border-[#2e2439] rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
            <span>Level &amp; XP</span>
            <Zap className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F59E0B] tabular-nums flex items-baseline gap-1">
            Lv.{activeUser.level}
            <span className="text-xs font-normal text-[#A1A1AA]">({activeUser.xp} XP)</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA]">Algorithmic mastery ranking</p>
        </div>

        {/* Real Solved Count */}
        <div className="p-4 bg-[#211A28] border border-[#2e2439] rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
            <span>Solved Problems</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FAFAFA] tabular-nums flex items-baseline gap-1">
            {activeUser.problemsSolved}
            <span className="text-xs font-normal text-[#A1A1AA]">
              / {progress?.totalProblems || 6}
            </span>
          </div>
          <p className="text-[11px] text-[#A1A1AA]">
            {activeUser.totalSubmissions} total submissions
          </p>
        </div>

        {/* Real Global Rank */}
        <div className="p-4 bg-[#211A28] border border-[#2e2439] rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
            <span>Global Rank</span>
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F59E0B] tabular-nums">
            #{activeUser.rank || 1}
          </div>
          <p className="text-[11px] text-[#A1A1AA]">Competitive global standing</p>
        </div>
      </div>

      {/* Prominent Daily Challenge Component (Fetches GET /api/problems/daily) */}
      <DailyChallengeCard
        user={activeUser}
        onNavigate={onNavigate}
      />

      {/* Main Grid: Progress Chart & Arena Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Chart */}
        <div className="lg:col-span-2 p-5 bg-[#211A28] border border-[#2e2439] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#FAFAFA]">7-Day XP Activity</h2>
              <p className="text-xs text-[#A1A1AA]">Real XP gained from accepted submissions</p>
            </div>
            <span className="text-xs font-mono text-[#A1A1AA]/60">Chart.js Engine</span>
          </div>

          <div className="h-64 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Difficulty Distribution Breakdown */}
          {progress?.difficultyBreakdown && (
            <div className="pt-4 border-t border-[#2e2439] grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
              {Object.entries(progress.difficultyBreakdown).map(([diff, data]: any) => (
                <div key={diff} className="p-2 bg-[#17131C] rounded-lg border border-[#2e2439]">
                  <div className="text-[11px] text-[#A1A1AA] font-medium">{diff}</div>
                  <div className="text-sm font-mono font-bold text-[#FAFAFA] mt-0.5">
                    {data.solved} <span className="text-[10px] text-[#A1A1AA]/60 font-normal">/ {data.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: 1v1 Arena & Category Focus */}
        <div className="p-5 bg-[#211A28] border border-[#2e2439] rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F97316] font-semibold">
              <Swords className="w-3.5 h-3.5 text-[#F97316]" />
              <span>1v1 Arena Quick Duel</span>
            </div>

            <h3 className="text-base font-bold text-[#FAFAFA]">Challenge an Opponent</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Queue into an algorithmic battle against fellow developers. Solve first to claim +200 XP and the Battle Veteran milestone!
            </p>

            {progress?.categoryBreakdown && (
              <div className="pt-2 space-y-1.5 text-xs font-mono">
                <span className="text-[11px] text-[#A1A1AA] font-sans font-semibold uppercase">
                  Top Solved Categories
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.entries(progress.categoryBreakdown).slice(0, 4).map(([cat, val]: any) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded bg-[#17131C] border border-[#2e2439] text-[11px] text-[#FAFAFA]"
                    >
                      {cat}: {val.solved}/{val.total}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => onNavigate('battle')}
              className="flex-1 py-2.5 px-3.5 text-xs font-semibold text-[#FAFAFA] bg-[#A855F7] hover:bg-[#9333ea] active:scale-[0.99] rounded-xl shadow-md shadow-[#A855F7]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lobby</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="py-2.5 px-3 text-xs font-semibold text-[#FAFAFA] bg-[#F97316] hover:bg-[#ea580c] rounded-xl shadow-sm shadow-[#F97316]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Challenge a developer to a 1v1 battle"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
            <button
              onClick={() => setActiveTab('battle-history')}
              className="py-2.5 px-3 text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#17131C] hover:bg-[#2e2439] border border-[#2e2439] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="View your completed battle history"
            >
              <History className="w-3.5 h-3.5 text-[#F97316]" />
              <span>History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A1A1AA]" />
            <h2 className="text-sm font-semibold text-[#FAFAFA]">Recent Submissions</h2>
          </div>
          <span className="text-xs text-[#A1A1AA] font-mono">
            {recentSubmissions.length} submissions logged
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : recentSubmissions.length === 0 ? (
          <div className="p-8 text-center bg-[#211A28] border border-[#2e2439] rounded-xl space-y-2">
            <Code2 className="w-8 h-8 text-[#A1A1AA]/50 mx-auto" />
            <p className="text-xs text-[#A1A1AA]">No submissions found in your account yet.</p>
            <button
              onClick={() => onNavigate('challenges')}
              className="text-xs font-semibold text-[#A855F7] hover:text-[#9333ea]"
            >
              Start solving challenges →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#2e2439] rounded-xl bg-[#211A28]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#17131C] border-b border-[#2e2439] text-[#A1A1AA] font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Runtime</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40 text-neutral-300">
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <button
                        onClick={() => onNavigate('problem-detail', sub.problemId)}
                        className="hover:text-indigo-300 transition-colors text-left flex items-center gap-1.5"
                      >
                        <span>{sub.problemTitle}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-500" />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center font-mono text-[11px] font-semibold ${
                          sub.status === 'Accepted'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400 uppercase text-[11px]">
                      {sub.language}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400 tabular-nums">
                      {sub.executionTime}ms
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-400 font-semibold tabular-nums">
                      +{sub.score} XP
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500 text-[11px]">
                      {new Date(sub.submittedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* Battle Invitation Modal */}
      <BattleInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={(oppUsername, battleId) => {
          setShowInviteModal(false);
          onNavigate('battle', battleId);
        }}
      />
    </div>
  );
};
