import { Request, Response } from 'express';
import { db } from '../db.ts';

export function getLeaderboard(req: Request, res: Response): void {
  try {
    const { type = 'global', limit = '50' } = req.query;
    const limitNum = parseInt(limit as string, 10) || 50;

    const allUsers = db.users.find();

    // In a real system, weekly/monthly filters by submission dates or activity in that timeframe
    let sortedUsers = [...allUsers];

    if (type === 'weekly') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      sortedUsers.sort((a, b) => {
        const aActive = a.lastActiveDate >= oneWeekAgo ? a.xp : a.xp * 0.4;
        const bActive = b.lastActiveDate >= oneWeekAgo ? b.xp : b.xp * 0.4;
        return bActive - aActive;
      });
    } else if (type === 'monthly') {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      sortedUsers.sort((a, b) => {
        const aActive = a.lastActiveDate >= oneMonthAgo ? a.xp : a.xp * 0.6;
        const bActive = b.lastActiveDate >= oneMonthAgo ? b.xp : b.xp * 0.6;
        return bActive - aActive;
      });
    } else {
      // Global
      sortedUsers.sort((a, b) => b.xp - a.xp || b.problemsSolved - a.problemsSolved);
    }

    const ranked = sortedUsers.slice(0, limitNum).map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      username: u.username,
      name: u.name,
      profileImage: u.profileImage,
      xp: u.xp,
      level: u.level,
      problemsSolved: u.problemsSolved,
      streak: u.streak,
      role: u.role,
    }));

    res.status(200).json({
      type,
      total: sortedUsers.length,
      leaderboard: ranked,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching leaderboard.' });
  }
}
