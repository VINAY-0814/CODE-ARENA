import { BattleHistoryItem, BattleHistoryStats, BattleInvite, AvailableOpponent, NotificationItem } from '../types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('codearena_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('codearena_token', token);
    } else {
      localStorage.removeItem('codearena_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data as T;
  }

  // Auth
  async register(body: { name: string; username: string; email: string; password: string }) {
    return this.request<{ message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(body: { email: string; password: string }) {
    return this.request<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async logout() {
    this.setToken(null);
    return this.request<{ message: string }>('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // User
  async getProfile() {
    return this.request<{ user: any }>('/users/profile');
  }

  async updateProfile(data: { name?: string; bio?: string; githubUrl?: string; profileImage?: string }) {
    return this.request<{ message: string; user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProgress() {
    return this.request<{
      problemsSolved: number;
      totalProblems: number;
      difficultyBreakdown: any;
      categoryBreakdown: any;
      xpProgressChart: { labels: string[]; data: number[] };
    }>('/users/progress');
  }

  async getRecentSubmissions() {
    return this.request<{ submissions: any[] }>('/users/recent-submissions');
  }

  async getUserAchievements() {
    return this.request<{ achievements: any[] }>('/users/achievements');
  }

  // Problems
  async getProblems(params: {
    search?: string;
    difficulty?: string;
    category?: string;
    language?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.language && params.language !== 'All') query.append('language', params.language);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    return this.request<{ problems: any[]; pagination: any }>(`/problems?${query.toString()}`);
  }

  async getDailyProblem() {
    return this.request<{ problem: any }>('/problems/daily');
  }

  async getProblemById(id: string) {
    return this.request<{ problem: any }>(`/problems/${id}`);
  }

  // Submissions
  async runCode(data: { problemId: string; language: string; sourceCode: string }) {
    return this.request<{ message: string; result: any }>('/submissions/run', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitCode(data: { problemId: string; language: string; sourceCode: string }) {
    return this.request<{
      message: string;
      submission: any;
      xpGained: number;
      newLevel: number;
      unlockedAchievements: string[];
    }>('/submissions/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSubmissions(params: { problemId?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.problemId) query.append('problemId', params.problemId);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    return this.request<{ submissions: any[]; pagination: any }>(`/submissions?${query.toString()}`);
  }

  // Leaderboard
  async getLeaderboard(type: 'global' | 'weekly' | 'monthly' = 'global') {
    return this.request<{ type: string; total: number; leaderboard: any[] }>(`/leaderboard?type=${type}`);
  }

  // Achievements
  async getAchievements() {
    return this.request<{ achievements: any[] }>('/achievements');
  }

  // Battles
  async getBattles() {
    return this.request<{ battles: any[] }>('/battles');
  }

  async getBattleById(id: string) {
    return this.request<{ battle: any; participants: any[]; problem: any }>(`/battles/${id}`);
  }

  async createBattle(data: { title?: string; difficulty?: string }) {
    return this.request<{ message: string; battle: any; participant: any }>('/battles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinBattle(id: string) {
    return this.request<{ message: string; battle: any }>(`/battles/${id}/join`, {
      method: 'POST',
    });
  }

  async submitBattleCode(id: string, data: { language: string; sourceCode: string }) {
    return this.request<{
      message: string;
      passed: boolean;
      testCasesPassed: number;
      totalTestCases: number;
      executionTime: number;
      battleCompleted: boolean;
      details: any[];
    }>(`/battles/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBattleHistory(limit: number = 5) {
    return this.request<{
      success: boolean;
      battles: BattleHistoryItem[];
      stats: BattleHistoryStats;
    }>(`/battles/history?limit=${limit}`);
  }

  async sendBattleInvite(data: {
    toUserId?: string;
    toUsername?: string;
    battleId?: string;
    problemId?: string;
    difficulty?: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      invite: BattleInvite;
      battleId: string;
      battleCode: string;
    }>('/battles/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingBattleInvites() {
    return this.request<{
      success: boolean;
      invites: BattleInvite[];
      count: number;
    }>('/battles/invites/pending');
  }

  async acceptBattleInvite(inviteId: string) {
    return this.request<{
      success: boolean;
      message: string;
      battleId: string;
      battleCode: string;
      invite: BattleInvite;
    }>(`/battles/invites/${inviteId}/accept`, {
      method: 'POST',
    });
  }

  async declineBattleInvite(inviteId: string) {
    return this.request<{
      success: boolean;
      message: string;
      invite: BattleInvite;
    }>(`/battles/invites/${inviteId}/decline`, {
      method: 'POST',
    });
  }

  async getAvailableOpponents() {
    return this.request<{
      success: boolean;
      users: AvailableOpponent[];
    }>('/battles/available-opponents');
  }

  // Notifications
  async getNotifications() {
    return this.request<{ unreadCount: number; notifications: any[] }>('/notifications');
  }

  async markNotificationAsRead(id: string) {
    return this.request<{ message: string; notification: any }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Admin
  async getAdminStatistics() {
    return this.request<{
      totalUsers: number;
      totalProblems: number;
      totalSubmissions: number;
      totalBattles: number;
      acceptedSubmissions: number;
      overallAcceptanceRate: number;
    }>('/admin/statistics');
  }

  async getAdminUsers(params: { search?: string; role?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    return this.request<{ users: any[]; pagination: any }>(`/admin/users?${query.toString()}`);
  }

  async updateAdminUser(id: string, data: any) {
    return this.request<{ message: string; user: any }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminUser(id: string) {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminProblems() {
    return this.request<{ problems: any[] }>('/admin/problems');
  }

  async createAdminProblem(data: any) {
    return this.request<{ message: string; problem: any }>('/admin/problems', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminProblem(id: string, data: any) {
    return this.request<{ message: string; problem: any }>(`/admin/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminProblem(id: string) {
    return this.request<{ message: string }>(`/admin/problems/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminSubmissions(params: { status?: string; language?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.language) query.append('language', params.language);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    return this.request<{ submissions: any[]; pagination: any }>(`/admin/submissions?${query.toString()}`);
  }
}

export const api = new ApiClient();
