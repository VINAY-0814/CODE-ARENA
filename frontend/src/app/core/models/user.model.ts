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
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
