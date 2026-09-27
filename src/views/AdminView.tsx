import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  FileCode2,
  ListOrdered,
  BarChart3,
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { PlatformStats, User, Problem, Submission } from '../types';
import { SkeletonTable } from '../components/SkeletonLoader';

interface AdminViewProps {
  currentUser: User;
  onNavigate: (view: string, param?: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'problems' | 'submissions'>('stats');

  // Stats
  const [stats, setStats] = useState<PlatformStats | null>(null);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');
  const [usersLoading, setUsersLoading] = useState<boolean>(false);

  // Problems
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemsLoading, setProblemsLoading] = useState<boolean>(false);
  const [showCreateProblemModal, setShowCreateProblemModal] = useState<boolean>(false);

  // Problem form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert'>('Easy');
  const [newCategory, setNewCategory] = useState('Arrays');
  const [newPoints, setNewPoints] = useState(50);
  const [newConstraints, setNewConstraints] = useState('2 <= nums.length <= 10^4');
  const [newInputExample, setNewInputExample] = useState('nums = [1, 2], target = 3');
  const [newOutputExample, setNewOutputExample] = useState('[0, 1]');
  const [newTestCaseInput, setNewTestCaseInput] = useState('{"nums":[1,2],"target":3}');
  const [newTestCaseOutput, setNewTestCaseOutput] = useState('[0,1]');
  const [newStarterCode, setNewStarterCode] = useState('function solution(nums, target) {\n  // Code\n}');

  // Submissions
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);
  const [subStatusFilter, setSubStatusFilter] = useState<string>('All');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  // Load stats
  const loadStats = async () => {
    try {
      const res = await api.getAdminStatistics();
      setStats(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Load users
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.getAdminUsers({
        search: userSearch,
        role: userRoleFilter,
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load problems
  const loadProblems = async () => {
    setProblemsLoading(true);
    try {
      const res = await api.getAdminProblems();
      setProblems(res.problems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setProblemsLoading(false);
    }
  };

  // Load submissions
  const loadSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const res = await api.getAdminSubmissions({
        status: subStatusFilter,
      });
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadProblems();
    loadSubmissions();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [userSearch, userRoleFilter]);

  useEffect(() => {
    loadSubmissions();
  }, [subStatusFilter]);

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.updateAdminUser(userId, { role: newRole });
      showToast(`User role updated to ${newRole}`);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.deleteAdminUser(userId);
      showToast('User account deleted');
      loadUsers();
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    try {
      await api.deleteAdminProblem(problemId);
      showToast('Problem deleted successfully');
      loadProblems();
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete problem', 'error');
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminProblem({
        title: newTitle.trim(),
        description: newDescription.trim(),
        difficulty: newDifficulty,
        category: newCategory,
        points: newPoints,
        constraints: newConstraints.split('\n').filter((c) => c.trim()),
        examples: [
          {
            input: newInputExample,
            output: newOutputExample,
            explanation: 'Sample test verification',
          },
        ],
        testCases: [
          {
            input: newTestCaseInput,
            expectedOutput: newTestCaseOutput,
            isHidden: false,
            explanation: 'Public sample case',
          },
          {
            input: newTestCaseInput,
            expectedOutput: newTestCaseOutput,
            isHidden: true,
            explanation: 'Hidden evaluation case',
          },
        ],
        starterCode: {
          javascript: newStarterCode,
          python: 'def solution(*args):\n    pass',
        },
        hints: ['Analyze constraints carefully.'],
      });

      showToast('Problem created successfully!');
      setShowCreateProblemModal(false);
      loadProblems();
      loadStats();

      // Reset form
      setNewTitle('');
      setNewDescription('');
    } catch (err: any) {
      showToast(err.message || 'Failed to create challenge', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold mb-1">
            <Shield className="w-4 h-4" />
            <span>Admin Console · Authorization Enforced</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Platform Administration</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage users, configure coding challenges, and monitor real system submissions.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'stats' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'problems' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Problems</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'submissions' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Submissions</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab 1: Overview Statistics */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-xs text-neutral-500">Total Users</span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {stats.totalUsers}
              </div>
            </div>
            <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-xs text-neutral-500">Challenges</span>
              <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
                {stats.totalProblems}
              </div>
            </div>
            <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-xs text-neutral-500">Total Submissions</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {stats.totalSubmissions}
              </div>
            </div>
            <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-xs text-neutral-500">Acceptance Rate</span>
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {stats.overallAcceptanceRate}%
              </div>
            </div>
          </div>

          <div className="p-5 bg-neutral-900/30 border border-neutral-800 rounded-2xl space-y-2 text-xs text-neutral-400 leading-relaxed">
            <h3 className="text-sm font-semibold text-white">System Architecture Health</h3>
            <p>
              Backend Node.js API with Express routes, isolated child process sandboxing, and persistent MongoDB database storage active. Real XP and level calculations running on every submission.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search username, email, name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : (
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Level / XP</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40 text-neutral-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.profileImage}
                            alt={u.username}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-700"
                          />
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        Lv.{u.level} · {u.xp} XP
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-amber-400">
                        {u.streak}d
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleChangeRole(u.id, u.role)}
                          className="px-2 py-1 text-[11px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-300 hover:text-white"
                        >
                          Toggle {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Problem Management */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Challenges Catalog</h2>
            <button
              onClick={() => setShowCreateProblemModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Problem</span>
            </button>
          </div>

          {problemsLoading ? (
            <SkeletonTable rows={6} cols={5} />
          ) : (
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4 text-center">Points</th>
                    <th className="py-3 px-4 text-center">Pass Rate</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40 text-neutral-300">
                  {problems.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <button
                          onClick={() => onNavigate('problem-detail', p.slug || p.id)}
                          className="hover:text-indigo-300 text-left"
                        >
                          {p.title}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-neutral-400 font-mono">{p.category}</td>
                      <td className="py-3 px-4 font-mono font-medium">{p.difficulty}</td>
                      <td className="py-3 px-4 text-center font-mono text-indigo-400 font-bold">
                        +{p.points} XP
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {p.acceptanceRate}%
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => onNavigate('problem-detail', p.slug || p.id)}
                          className="p-1 text-neutral-400 hover:text-white"
                          title="Open IDE"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProblem(p.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400"
                          title="Delete Challenge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Submissions Monitor */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Live Submissions Feed</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Status:</span>
              <select
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Accepted">Accepted</option>
                <option value="Wrong Answer">Wrong Answer</option>
                <option value="Time Limit Exceeded">Time Limit Exceeded</option>
                <option value="Compilation Error">Compilation Error</option>
              </select>
            </div>
          </div>

          {submissionsLoading ? (
            <SkeletonTable rows={6} cols={6} />
          ) : (
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40 text-neutral-300">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-white">
                        @{sub.username}
                      </td>
                      <td className="py-3 px-4 text-neutral-300">{sub.problemTitle}</td>
                      <td className="py-3 px-4 font-mono uppercase text-neutral-400 text-[11px]">
                        {sub.language}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-indigo-400">
                        +{sub.score}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-500 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleTimeString([], {
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
      )}

      {/* Create Problem Modal */}
      {showCreateProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-semibold text-white text-sm">Create New Coding Challenge</h3>
              <button
                onClick={() => setShowCreateProblemModal(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Problem Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Invert Binary Tree"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Arrays">Arrays</option>
                    <option value="Strings">Strings</option>
                    <option value="Linked Lists">Linked Lists</option>
                    <option value="Stacks">Stacks</option>
                    <option value="Queues">Queues</option>
                    <option value="Trees">Trees</option>
                    <option value="Graphs">Graphs</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e: any) => setNewDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Points (XP)</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Problem description, input requirements, output formatting..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">
                    Sample Test Input (JSON)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTestCaseInput}
                    onChange={(e) => setNewTestCaseInput(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">
                    Expected Output (JSON/String)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTestCaseOutput}
                    onChange={(e) => setNewTestCaseOutput(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Starter Code (JavaScript)
                </label>
                <textarea
                  rows={3}
                  value={newStarterCode}
                  onChange={(e) => setNewStarterCode(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProblemModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  Save Problem to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
