export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string;
  role: 'user' | 'admin';
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  problemsSolved: number;
  totalSubmissions: number;
  solvedProblemIds: string[];
  bio?: string;
  githubUrl?: string;
  rank?: number;
  achievements?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
  category: string;
  points: number;
  supportedLanguages: string[];
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    explanation?: string;
  }>;
  totalTestCases: number;
  starterCode: Record<string, string>;
  hints: string[];
  acceptanceRate: number;
  totalAttempts: number;
  totalAccepted: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  testCaseNumber: number;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
  executionTimeMs: number;
  memoryUsedKb?: number;
  isHidden?: boolean;
}

export interface Submission {
  id: string;
  userId: string;
  username: string;
  userProfileImage?: string;
  problemId: string;
  problemTitle: string;
  language: string;
  sourceCode: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
  score: number;
  details: TestResult[];
  submittedAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  xpReward: number;
  category: string;
  unlockedAt?: string;
}

export interface Battle {
  id: string;
  code: string;
  title: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  durationSeconds: number;
  startedAt?: string;
  endedAt?: string;
  winnerId?: string | null;
  winnerUsername?: string | null;
  createdBy: string;
  createdByName: string;
  participantsCount?: number;
  participants?: BattleParticipant[];
  createdAt: string;
}

export interface BattleParticipant {
  id?: string;
  battleId?: string;
  userId: string;
  username: string;
  profileImage?: string;
  status: 'ready' | 'coding' | 'submitted' | 'surrendered';
  testsPassed: number;
  totalTests: number;
  score?: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'battle' | 'battle_invite' | 'streak' | 'system' | 'submission';
  isRead: boolean;
  createdAt: string;
  metadata?: {
    inviteId?: string;
    battleId?: string;
    battleCode?: string;
    battleTitle?: string;
    fromUserId?: string;
    fromUsername?: string;
    fromProfileImage?: string;
    problemId?: string;
    problemTitle?: string;
    problemDifficulty?: string;
    status?: 'pending' | 'accepted' | 'declined';
  };
}

export interface BattleInvite {
  id: string;
  battleId: string;
  battleCode: string;
  battleTitle: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  fromUserId: string;
  fromUsername: string;
  fromProfileImage: string;
  toUserId: string;
  toUsername: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface AvailableOpponent {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  level: number;
  xp: number;
  streak: number;
  rank: number;
  isOnline: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  name: string;
  profileImage: string;
  xp: number;
  level: number;
  problemsSolved: number;
  streak: number;
  role: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  totalBattles: number;
  acceptedSubmissions: number;
  overallAcceptanceRate: number;
}

export interface BattleHistoryOpponent {
  userId: string;
  username: string;
  profileImage: string;
  status: string;
  testsPassed: number;
  totalTests: number;
  executionTimeMs: number;
  score: number;
  submittedAt: string | null;
}

export interface BattleHistoryUserResult {
  userId: string;
  username: string;
  status: string;
  testsPassed: number;
  totalTests: number;
  executionTimeMs: number;
  score: number;
  submittedAt: string | null;
}

export interface BattleHistoryItem {
  id: string;
  code: string;
  title: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  status: string;
  durationSeconds: number;
  createdAt: string;
  endedAt: string;
  winnerId: string | null;
  winnerUsername: string | null;
  outcome: 'victory' | 'defeat' | 'draw';
  opponents: BattleHistoryOpponent[];
  userResult: BattleHistoryUserResult;
}

export interface BattleHistoryStats {
  totalCompleted: number;
  totalVictories: number;
  totalDefeats: number;
  winRate: number;
}

export interface BattleHistoryResponse {
  success: boolean;
  battles: BattleHistoryItem[];
  stats: BattleHistoryStats;
}
