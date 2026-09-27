import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Swords,
  Users,
  Timer,
  Play,
  Send,
  Trophy,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Battle, BattleParticipant, Problem, User } from '../types';
import { MonacoCodeEditor } from '../components/MonacoEditor';
import { BattleInviteModal } from '../components/BattleInviteModal';

interface BattleViewProps {
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigate: (view: string, param?: string) => void;
  initialBattleId?: string;
}

export const BattleView: React.FC<BattleViewProps> = ({
  user,
  onOpenAuth,
  onNavigate,
  initialBattleId,
}) => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null);
  const [participants, setParticipants] = useState<BattleParticipant[]>([]);
  const [battleProblem, setBattleProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  // Match state
  const [sourceCode, setSourceCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<{
    passed: boolean;
    testCasesPassed: number;
    totalTestCases: number;
    battleCompleted: boolean;
  } | null>(null);

  // Create Battle Modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [battleTitle, setBattleTitle] = useState<string>('');
  const [battleDifficulty, setBattleDifficulty] = useState<string>('Easy');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Poll active battle state
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentBattle && (currentBattle.status === 'waiting' || currentBattle.status === 'active')) {
      interval = setInterval(async () => {
        try {
          const res = await api.getBattleById(currentBattle.id);
          if (res.battle) {
            setCurrentBattle(res.battle);
            setParticipants(res.participants || []);
            if (res.problem) setBattleProblem(res.problem);

            if (res.battle.status === 'completed' && res.battle.winnerId === user?.id) {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            }
          }
        } catch (err) {
          console.error('Battle polling error:', err);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [currentBattle, user]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentBattle?.status === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentBattle?.status, timeLeft]);

  // Load battles list
  const loadBattles = async () => {
    setLoading(true);
    try {
      const res = await api.getBattles();
      setBattles(res.battles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBattles();
    if (initialBattleId) {
      handleJoinBattle(initialBattleId);
    }
  }, [initialBattleId]);

  const handleCreateBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setErrorMessage(null);

    try {
      const res = await api.createBattle({
        title: battleTitle.trim() || undefined,
        difficulty: battleDifficulty,
      });

      setShowCreateModal(false);
      // Fetch full battle
      const full = await api.getBattleById(res.battle.id);
      setCurrentBattle(full.battle);
      setParticipants(full.participants || []);
      setBattleProblem(full.problem);
      if (full.problem?.starterCode?.[language]) {
        setSourceCode(full.problem.starterCode[language]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create battle arena.');
    }
  };

  const handleJoinBattle = async (battleId: string) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setErrorMessage(null);

    try {
      await api.joinBattle(battleId);
      const full = await api.getBattleById(battleId);
      setCurrentBattle(full.battle);
      setParticipants(full.participants || []);
      setBattleProblem(full.problem);
      if (full.problem?.starterCode?.[language]) {
        setSourceCode(full.problem.starterCode[language]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not join battle arena.');
    }
  };

  const handleSubmitBattleCode = async () => {
    if (!currentBattle || !user) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.submitBattleCode(currentBattle.id, {
        language,
        sourceCode,
      });

      setBattleResult({
        passed: res.passed,
        testCasesPassed: res.testCasesPassed,
        totalTestCases: res.totalTestCases,
        battleCompleted: res.battleCompleted,
      });

      if (res.passed) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }

      // Refresh battle state
      const full = await api.getBattleById(currentBattle.id);
      setCurrentBattle(full.battle);
      setParticipants(full.participants || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting solution.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If inside an active or waiting battle match
  if (currentBattle) {
    const player1 = participants[0];
    const player2 = participants[1];
    const isWinner = currentBattle.winnerId === user?.id;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
        {/* Battle Arena Header */}
        <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentBattle(null);
                loadBattles();
              }}
              className="text-xs text-neutral-400 hover:text-white"
            >
              ← Leave Lobby
            </button>
            <span className="text-neutral-700">|</span>
            <div className="font-mono text-xs px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-md text-amber-400 font-semibold">
              {currentBattle.code}
            </div>
            <h1 className="text-sm font-bold text-white truncate max-w-md">
              {currentBattle.title}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2 font-mono text-base font-bold text-indigo-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
              <Timer className="w-4 h-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <span
              className={`text-xs uppercase font-mono font-bold px-2.5 py-1 rounded-full ${
                currentBattle.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                  : currentBattle.status === 'completed'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {currentBattle.status}
            </span>
          </div>
        </div>

        {/* 1v1 Versus Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player 1 Card */}
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={
                  player1?.profileImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt="Player 1"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <div>
                <div className="text-xs font-bold text-white">
                  {player1?.username || 'Waiting for creator...'}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Tests: {player1?.testsPassed || 0} / {player1?.totalTests || battleProblem?.totalTestCases || 0}
                </div>
              </div>
            </div>
            {currentBattle.winnerId === player1?.userId && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono">
                <Trophy className="w-4 h-4" /> Winner!
              </span>
            )}
          </div>

          {/* Player 2 Card */}
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={
                  player2?.profileImage ||
                  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
                }
                alt="Player 2"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/40"
              />
              <div>
                <div className="text-xs font-bold text-white">
                  {player2?.username || 'Waiting for Opponent...'}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  {player2
                    ? `Tests: ${player2.testsPassed || 0} / ${player2.totalTests || battleProblem?.totalTestCases || 0}`
                    : 'Share room code to invite!'}
                </div>
              </div>
            </div>
            {player2 && currentBattle.winnerId === player2.userId ? (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono">
                <Trophy className="w-4 h-4" /> Winner!
              </span>
            ) : (!player2 || currentBattle.status === 'waiting') ? (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-[#FAFAFA] bg-[#F97316] hover:bg-[#ea580c] rounded-lg shadow-sm shadow-[#F97316]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Send a real-time challenge invite"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Invite Rival</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Victory Banner */}
        {currentBattle.status === 'completed' && (
          <div className="p-6 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-2xl text-center space-y-2">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">
              {isWinner ? 'Victory is Yours!' : `${currentBattle.winnerUsername} Won the Duel!`}
            </h2>
            <p className="text-xs text-neutral-400">
              {isWinner ? 'You conquered this 1v1 battle and earned +200 XP!' : 'Great effort! Review the challenge logic.'}
            </p>
          </div>
        )}

        {/* Problem and IDE Arena Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
          {/* Problem Statement (4 cols) */}
          <div className="lg:col-span-4 p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-4 overflow-y-auto max-h-[640px]">
            {battleProblem ? (
              <>
                <div className="space-y-1">
                  <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
                    Challenge Target
                  </span>
                  <h3 className="text-base font-bold text-white">{battleProblem.title}</h3>
                </div>
                <div className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {battleProblem.description}
                </div>

                {battleProblem.examples && battleProblem.examples.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                      Example
                    </span>
                    <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-[11px] space-y-1">
                      <div>Input: {battleProblem.examples[0].input}</div>
                      <div className="text-emerald-400">
                        Output: {battleProblem.examples[0].output}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500">
                Waiting for match setup...
              </div>
            )}
          </div>

          {/* Monaco Editor (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div className="flex-1 min-h-[440px]">
              <MonacoCodeEditor
                value={sourceCode}
                onChange={setSourceCode}
                language={language}
                onLanguageChange={setLanguage}
                onReset={() => {
                  if (battleProblem?.starterCode?.[language]) {
                    setSourceCode(battleProblem.starterCode[language]);
                  }
                }}
                readOnly={currentBattle.status === 'completed'}
              />
            </div>

            {/* Battle Actions Bar */}
            <div className="flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
              <div className="text-xs font-mono text-neutral-400">
                {battleResult && (
                  <span
                    className={
                      battleResult.passed ? 'text-emerald-400 font-bold' : 'text-amber-400'
                    }
                  >
                    Passed {battleResult.testCasesPassed} / {battleResult.totalTestCases} tests
                  </span>
                )}
              </div>

              <button
                onClick={handleSubmitBattleCode}
                disabled={submitting || currentBattle.status !== 'active'}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Battle Solution'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Arena Lobby View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
      {/* Lobby Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold mb-1">
            <Swords className="w-4 h-4" />
            <span>Competitive Multiplayer Arena</span>
          </div>
          <h1 className="text-2xl font-bold text-white">1v1 Coding Battles</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Challenge fellow developers, race against the timer, and claim victory bounties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadBattles()}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-xl"
            title="Refresh active rooms"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
              } else {
                setShowInviteModal(true);
              }
            }}
            className="px-4 py-2.5 text-xs font-semibold text-[#FAFAFA] bg-[#F97316] hover:bg-[#ea580c] rounded-xl shadow-sm shadow-[#F97316]/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>Invite to 1v1 Battle</span>
          </button>
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
              } else {
                setShowCreateModal(true);
              }
            }}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Battle Room</span>
          </button>
        </div>
      </div>

      {/* Direct Room Join by Code */}
      <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-neutral-300">
          Have an invitation code? Enter the room code to join instantly:
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. ARENA-772"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            className="px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500 uppercase"
          />
          <button
            onClick={() => {
              if (joinCodeInput.trim()) handleJoinBattle(joinCodeInput.trim());
            }}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Join Room
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Battle Arenas List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Active &amp; Waiting Arenas</h2>
          <span className="text-xs font-mono text-neutral-500">{battles.length} rooms open</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-500">
            Scanning for open arena battles...
          </div>
        ) : battles.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900/20 border border-neutral-800 rounded-2xl space-y-3">
            <Swords className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-400">No active battles currently in queue.</p>
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else setShowCreateModal(true);
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Create the first duel →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {battles.map((b) => (
              <div
                key={b.id}
                className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400 uppercase">
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 line-clamp-1">{b.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mt-1">
                    <span>{b.problemDifficulty}</span>
                    <span>·</span>
                    <span>Created by @{b.createdByName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <Users className="w-3.5 h-3.5" />
                    <span>{b.participantsCount || 1} / 2 Players</span>
                  </div>

                  <button
                    onClick={() => handleJoinBattle(b.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>{b.status === 'active' ? 'Watch / Join' : 'Enter Arena'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Battle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-semibold text-white text-sm">Create 1v1 Battle Arena</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBattle} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Battle Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Speed Duel: Algorithms"
                  value={battleTitle}
                  onChange={(e) => setBattleTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Difficulty</label>
                <select
                  value={battleDifficulty}
                  onChange={(e) => setBattleDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
              >
                Spawn Arena Room
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Battle Invitation Modal */}
      <BattleInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        battleId={currentBattle?.id}
        problemId={currentBattle?.problemId}
        problemTitle={currentBattle?.problemTitle || battleProblem?.title}
        defaultDifficulty={battleProblem?.difficulty || 'Easy'}
        onInviteSent={(oppUsername) => {
          setInviteFeedback(`Battle invite sent to @${oppUsername}! They received a real-time notification.`);
          setTimeout(() => setInviteFeedback(null), 4000);
        }}
      />

      {inviteFeedback && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-[#211A28] border border-[#22C55E]/40 text-[#22C55E] text-xs font-medium rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{inviteFeedback}</span>
        </div>
      )}
    </div>
  );
};
