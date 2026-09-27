import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle2, ChevronLeft, ChevronRight, Code2 } from 'lucide-react';
import { api } from '../services/api';
import { Problem, User } from '../types';
import { SkeletonCard } from '../components/SkeletonLoader';

interface ChallengesViewProps {
  user: User | null;
  onNavigate: (view: string, param?: string) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ user, onNavigate }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProblems, setTotalProblems] = useState<number>(0);

  const difficulties = ['All', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
  const categories = [
    'All',
    'Arrays',
    'Strings',
    'Linked Lists',
    'Stacks',
    'Queues',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Algorithms',
    'Mathematics',
  ];
  const languages = ['All', 'javascript', 'python', 'java', 'cpp', 'c'];

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await api.getProblems({
        search,
        difficulty: selectedDifficulty,
        category: selectedCategory,
        language: selectedLanguage,
        page: currentPage,
        limit: 8,
      });

      setProblems(res.problems || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalProblems(res.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [search, selectedDifficulty, selectedCategory, selectedLanguage, currentPage]);

  const solvedIds = new Set(user?.solvedProblemIds || []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coding Challenges</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Solve algorithmic problems, pass sandboxed tests, and earn XP.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search problems or categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs / Segmented Controls */}
      <div className="space-y-3 pt-2">
        {/* Difficulty Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mr-2 shrink-0">
            Difficulty:
          </span>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Category Filter & Language Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs text-neutral-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
        </div>
      ) : problems.length === 0 ? (
        <div className="py-16 text-center bg-neutral-900/20 border border-neutral-800 rounded-2xl space-y-3">
          <Code2 className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No challenges match your filters</h3>
          <p className="text-xs text-neutral-400">Try resetting your difficulty or search terms.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDifficulty('All');
              setSelectedCategory('All');
              setSelectedLanguage('All');
            }}
            className="px-4 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((problem) => {
            const isSolved = solvedIds.has(problem.id);
            return (
              <div
                key={problem.id}
                onClick={() => onNavigate('problem-detail', problem.slug || problem.id)}
                className="p-5 bg-neutral-900/40 border border-neutral-800/90 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all hover:translate-y-[-2px] group relative flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isSolved && (
                        <span title="Solved">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {problem.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-indigo-400 shrink-0">
                      +{problem.points} XP
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-300">{problem.category}</span>
                    <span>·</span>
                    <span className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{problem.acceptanceRate}% pass</span>
                    <span>·</span>
                    <span>{problem.totalAttempts} attempts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs">
          <span className="text-neutral-400 font-mono">
            Page {currentPage} of {totalPages} ({totalProblems} challenges)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
