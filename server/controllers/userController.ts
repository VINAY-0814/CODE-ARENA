import { Response } from 'express';
import { db } from '../db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export function getProfile(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;

    // Compute rank
    const allUsers = db.users.find().sort((a, b) => b.xp - a.xp);
    const rankIndex = allUsers.findIndex((u) => u.id === user.id);
    const rank = rankIndex !== -1 ? rankIndex + 1 : 1;

    // Retrieve user achievements
    const userAchs = db.userAchievements.find((ua) => ua.userId === user.id);
    const achievements = userAchs.map((ua) => {
      const ach = db.achievements.findById(ua.achievementId);
      return {
        ...ach,
        unlockedAt: ua.unlockedAt,
      };
    });

    const { password: _, ...userSafe } = user;
    res.status(200).json({
      user: {
        ...userSafe,
        rank,
        achievements,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching user profile.' });
  }
}

export function updateProfile(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const { name, bio, githubUrl, profileImage } = req.body;

    const updates: any = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (githubUrl !== undefined) updates.githubUrl = githubUrl.trim();
    if (profileImage) updates.profileImage = profileImage;

    const updated = db.users.updateById(user.id, updates);
    if (!updated) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const { password: _, ...userSafe } = updated;
    res.status(200).json({ message: 'Profile updated successfully.', user: userSafe });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating user profile.' });
  }
}

export function getProgress(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const allProblems = db.problems.find();

    const solvedIds = new Set(user.solvedProblemIds || []);

    const difficultyBreakdown = {
      Beginner: { total: 0, solved: 0 },
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 },
      Expert: { total: 0, solved: 0 },
    };

    const categoryBreakdown: Record<string, { total: number; solved: number }> = {};

    allProblems.forEach((p) => {
      if (difficultyBreakdown[p.difficulty as keyof typeof difficultyBreakdown]) {
        difficultyBreakdown[p.difficulty as keyof typeof difficultyBreakdown].total++;
        if (solvedIds.has(p.id)) {
          difficultyBreakdown[p.difficulty as keyof typeof difficultyBreakdown].solved++;
        }
      }

      if (!categoryBreakdown[p.category]) {
        categoryBreakdown[p.category] = { total: 0, solved: 0 };
      }
      categoryBreakdown[p.category].total++;
      if (solvedIds.has(p.id)) {
        categoryBreakdown[p.category].solved++;
      }
    });

    // Recent activity history for Chart.js
    const submissions = db.submissions
      .find((s) => s.userId === user.id)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

    // Generate last 7 days chart points
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      days[key] = 0;
    }

    submissions.forEach((s) => {
      const d = new Date(s.submittedAt);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      if (days[key] !== undefined && s.status === 'Accepted') {
        days[key] += s.score || 20;
      }
    });

    res.status(200).json({
      problemsSolved: user.problemsSolved,
      totalProblems: allProblems.length,
      difficultyBreakdown,
      categoryBreakdown,
      xpProgressChart: {
        labels: Object.keys(days),
        data: Object.values(days),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching user progress.' });
  }
}

export function getRecentSubmissions(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const recent = db.submissions
      .find((s) => s.userId === user.id)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10);

    res.status(200).json({ submissions: recent });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching recent submissions.' });
  }
}

export function getUserAchievements(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const userAchs = db.userAchievements.find((ua) => ua.userId === user.id);
    const achievements = userAchs.map((ua) => {
      const ach = db.achievements.findById(ua.achievementId);
      return {
        ...ach,
        unlockedAt: ua.unlockedAt,
      };
    });

    res.status(200).json({ achievements });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching user achievements.' });
  }
}
