import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Send,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Lightbulb,
  FileCode2,
  Award,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import { Problem, User, TestResult, Submission } from '../types';
import { MonacoCodeEditor } from '../components/MonacoEditor';

interface ProblemDetailViewProps {
  problemId: string;
  user: User | null;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onUserUpdate?: (updatedUser: User) => void;
}

export const ProblemDetailView: React.FC<ProblemDetailViewProps> = ({
  problemId,
  user,
  onNavigate,
  onOpenAuth,
  onUserUpdate,
}) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('javascript');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'hints'>('description');
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Execution state
  const [running, setRunning] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<{
    status: string;
    totalTestCases: number;
    testCasesPassed: number;
    executionTime: number;
    memoryUsed: number;
    details: TestResult[];
    xpGained?: number;
    unlockedAchievements?: string[];
  } | null>(null);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch problem details
  useEffect(() => {
    let mounted = true;
    async function loadProblem() {
      setLoading(true);
      try {
        const res = await api.getProblemById(problemId);
        if (mounted && res.problem) {
          setProblem(res.problem);

          // Set default starter code
          const initialLang = 'javascript';
          setLanguage(initialLang);
          const starter =
            res.problem.starterCode?.[initialLang] ||
            `// Solve ${res.problem.title}\nfunction solution() {\n  // Code here\n}`;
          setSourceCode(starter);

          // If user logged in, load recent submissions for this problem
          if (user) {
            api.getSubmissions({ problemId: res.problem.id }).then((subRes) => {
              if (mounted && subRes.submissions) {
                setSubmissions(subRes.submissions);
              }
            });
          }
        }
      } catch (err: any) {
        if (mounted) setErrorMessage(err.message || 'Failed to load challenge details.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProblem();
    return () => {
      mounted = false;
    };
  }, [problemId, user]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (problem?.starterCode?.[newLang]) {
      setSourceCode(problem.starterCode[newLang]);
    } else {
      setSourceCode(`// Starter code for ${newLang} not configured`);
    }
  };

  const handleResetCode = () => {
    if (problem?.starterCode?.[language]) {
      setSourceCode(problem.starterCode[language]);
    }
  };

  // Run against sample test cases
  const handleRunCode = async () => {
    if (!problem) return;
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setRunning(true);
    setErrorMessage(null);

    try {
      const res = await api.runCode({
        problemId: problem.id,
        language,
        sourceCode,
      });

      setTestResults(res.result);
      setActiveTestCaseIndex(0);
    } catch (err: any) {
      setErrorMessage(err.message || 'Run execution failed.');
    } finally {
      setRunning(false);
    }
  };

  // Submit against all test cases
  const handleSubmitCode = async () => {
    if (!problem) return;
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.submitCode({
        problemId: problem.id,
        language,
        sourceCode,
      });

      const submission = res.submission;
      setTestResults({
        status: submission.status,
        totalTestCases: submission.totalTestCases,
        testCasesPassed: submission.testCasesPassed,
        executionTime: submission.executionTime,
        memoryUsed: submission.memoryUsed,
        details: submission.details,
        xpGained: res.xpGained,
        unlockedAchievements: res.unlockedAchievements,
      });
      setActiveTestCaseIndex(0);

      // Prepend to submissions list
      setSubmissions((prev) => [submission, ...prev]);

      // If accepted, celebrate!
      if (submission.status === 'Accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Update user state if callback provided
        if (onUserUpdate && user) {
          api.getMe().then((meRes) => {
            if (meRes.user) onUserUpdate(meRes.user);
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-xs font-mono text-neutral-400">
        Loading coding workspace...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center space-y-3">
        <p className="text-sm text-neutral-400">Challenge not found.</p>
        <button
          onClick={() => onNavigate('challenges')}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
        >
          ← Return to Challenges
        </button>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4 relative z-10">
      {/* Back breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('challenges')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Challenges</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-neutral-400">{problem.category}</span>
          <span>·</span>
          <span className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</span>
          <span>·</span>
          <span className="text-indigo-400 font-semibold">+{problem.points} XP</span>
        </div>
      </div>

      {/* Main Workspace Split: Left (Problem / Hints / Submissions) & Right (Monaco & Test Console) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        {/* Left Column (5 cols): Description / Examples / Constraints */}
        <div className="lg:col-span-5 flex flex-col bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-2 pt-2">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                activeTab === 'description'
                  ? 'bg-neutral-900 text-white border-t border-x border-neutral-800'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'hints'
                  ? 'bg-neutral-900 text-white border-t border-x border-neutral-800'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hints ({problem.hints?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                activeTab === 'submissions'
                  ? 'bg-neutral-900 text-white border-t border-x border-neutral-800'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Submissions ({submissions.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 flex-1 overflow-y-auto space-y-6 text-xs text-neutral-300 leading-relaxed max-h-[680px]">
            {activeTab === 'description' && (
              <>
                <div>
                  <h1 className="text-xl font-bold text-white mb-2">{problem.title}</h1>
                  <div className="whitespace-pre-wrap font-sans text-neutral-300 text-xs leading-relaxed">
                    {problem.description}
                  </div>
                </div>

                {/* Examples */}
                {problem.examples && problem.examples.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white uppercase text-[11px] tracking-wider">
                      Examples
                    </h3>
                    {problem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-neutral-950/80 border border-neutral-800/80 rounded-lg space-y-1.5 font-mono text-[11px]"
                      >
                        <div>
                          <span className="text-neutral-500 font-sans font-semibold">Input: </span>
                          <span className="text-neutral-200">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-sans font-semibold">Output: </span>
                          <span className="text-emerald-400">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-neutral-400 font-sans text-[11px] pt-1">
                            <span className="text-neutral-500 font-semibold">Explanation: </span>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white uppercase text-[11px] tracking-wider">
                      Constraints
                    </h3>
                    <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-neutral-400">
                      {problem.constraints.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Algorithmic Hints</h3>
                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1 text-xs"
                    >
                      <span className="text-[11px] font-semibold text-amber-400 font-mono">
                        Hint {idx + 1}:
                      </span>
                      <p className="text-neutral-300">{hint}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-xs">No hints available for this problem.</p>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Submission History</h3>
                {submissions.length === 0 ? (
                  <p className="text-neutral-500 text-xs">You haven't submitted code for this challenge yet.</p>
                ) : (
                  <div className="space-y-2">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-[10px] text-neutral-500 uppercase font-mono">
                              {sub.language}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {sub.testCasesPassed}/{sub.totalTestCases} passed · {sub.executionTime}ms
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Monaco Editor + Execution Output */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Monaco Editor Component */}
          <div className="flex-1 min-h-[440px]">
            <MonacoCodeEditor
              value={sourceCode}
              onChange={setSourceCode}
              language={language}
              onLanguageChange={handleLanguageChange}
              onReset={handleResetCode}
              supportedLanguages={problem.supportedLanguages || ['javascript', 'python', 'java', 'cpp', 'c']}
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-mono text-[11px]">{problem.totalTestCases} test cases</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={running || submitting}
                className="px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 active:scale-95 disabled:opacity-50 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{running ? 'Running...' : 'Run Code'}</span>
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={running || submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 rounded-lg shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Testing...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Test Results Console */}
          {testResults && (
            <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1.5 text-sm font-bold ${
                      testResults.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {testResults.status === 'Accepted' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>{testResults.status}</span>
                  </div>

                  <span className="text-xs font-mono text-neutral-400">
                    Passed {testResults.testCasesPassed} of {testResults.totalTestCases} test cases
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{testResults.executionTime} ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{testResults.memoryUsed} KB</span>
                  </div>
                  {testResults.xpGained !== undefined && testResults.xpGained > 0 && (
                    <div className="text-indigo-400 font-bold">
                      +{testResults.xpGained} XP
                    </div>
                  )}
                </div>
              </div>

              {/* Achievements unlocked notification banner */}
              {testResults.unlockedAchievements && testResults.unlockedAchievements.length > 0 && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-300 text-xs">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Achievement unlocked: <strong>{testResults.unlockedAchievements.join(', ')}</strong>!
                  </span>
                </div>
              )}

              {/* Test Cases Tabs */}
              {testResults.details && testResults.details.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {testResults.details.map((detail, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCaseIndex(idx)}
                        className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 ${
                          activeTestCaseIndex === idx
                            ? 'bg-neutral-800 text-white border border-neutral-700'
                            : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            detail.passed ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>Case {idx + 1}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Test Case Details */}
                  {testResults.details[activeTestCaseIndex] && (
                    <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg space-y-2 font-mono text-[11px]">
                      {testResults.details[activeTestCaseIndex].input && (
                        <div>
                          <div className="text-neutral-500 font-sans text-[10px] uppercase font-semibold">
                            Input
                          </div>
                          <div className="text-neutral-200 mt-0.5">
                            {testResults.details[activeTestCaseIndex].input}
                          </div>
                        </div>
                      )}

                      {testResults.details[activeTestCaseIndex].expectedOutput && (
                        <div>
                          <div className="text-neutral-500 font-sans text-[10px] uppercase font-semibold">
                            Expected Output
                          </div>
                          <div className="text-emerald-400 mt-0.5">
                            {testResults.details[activeTestCaseIndex].expectedOutput}
                          </div>
                        </div>
                      )}

                      {testResults.details[activeTestCaseIndex].actualOutput && (
                        <div>
                          <div className="text-neutral-500 font-sans text-[10px] uppercase font-semibold">
                            Actual Output
                          </div>
                          <div
                            className={`mt-0.5 ${
                              testResults.details[activeTestCaseIndex].passed
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {testResults.details[activeTestCaseIndex].actualOutput}
                          </div>
                        </div>
                      )}

                      {testResults.details[activeTestCaseIndex].error && (
                        <div>
                          <div className="text-rose-500 font-sans text-[10px] uppercase font-semibold">
                            Error / Diagnostic
                          </div>
                          <div className="text-rose-400 mt-0.5 whitespace-pre-wrap">
                            {testResults.details[activeTestCaseIndex].error}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
