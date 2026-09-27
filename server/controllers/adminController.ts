import { Request, Response } from 'express';
import { db } from '../db.ts';

export function getUsers(req: Request, res: Response): void {
  try {
    const { search, role, page = '1', limit = '15' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 15;

    let users = db.users.find();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    if (role && typeof role === 'string' && role !== 'All') {
      users = users.filter((u) => u.role === role);
    }

    const total = users.length;
    const paginated = users.slice((pageNum - 1) * limitNum, pageNum * limitNum).map((u) => {
      const { password: _, ...safe } = u;
      return safe;
    });

    res.status(200).json({
      users: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching users.' });
  }
}

export function getUserById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const user = db.users.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const { password: _, ...safe } = user;
    res.status(200).json({ user: safe });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching user.' });
  }
}

export function updateUser(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { role, name, bio } = req.body;

    const updates: any = {};
    if (role) updates.role = role;
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    const updated = db.users.updateById(id, updates);
    if (!updated) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const { password: _, ...safe } = updated;
    res.status(200).json({ message: 'User updated successfully.', user: safe });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating user.' });
  }
}

export function deleteUser(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const success = db.users.deleteById(id);

    if (!success) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error deleting user.' });
  }
}

export function getProblems(req: Request, res: Response): void {
  try {
    const problems = db.problems.find().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(200).json({ problems });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching admin problems.' });
  }
}

export function createProblem(req: Request, res: Response): void {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      points,
      supportedLanguages = ['javascript', 'python', 'java', 'cpp'],
      constraints = [],
      examples = [],
      testCases = [],
      starterCode = {},
      hints = [],
    } = req.body;

    if (!title || !description || !difficulty || !category) {
      res.status(400).json({ message: 'title, description, difficulty, and category are required.' });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const now = new Date().toISOString();
    const problem = db.problems.insert({
      title,
      slug,
      description,
      difficulty,
      category,
      points: points || 50,
      supportedLanguages,
      constraints,
      examples,
      testCases,
      starterCode,
      hints,
      acceptanceRate: 100,
      totalAttempts: 0,
      totalAccepted: 0,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({ message: 'Problem created successfully.', problem });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating problem.' });
  }
}

export function updateProblem(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = db.problems.updateById(id, updates);
    if (!updated) {
      res.status(404).json({ message: 'Problem not found.' });
      return;
    }

    res.status(200).json({ message: 'Problem updated successfully.', problem: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating problem.' });
  }
}

export function deleteProblem(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const success = db.problems.deleteById(id);

    if (!success) {
      res.status(404).json({ message: 'Problem not found.' });
      return;
    }

    res.status(200).json({ message: 'Problem deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error deleting problem.' });
  }
}

export function getSubmissions(req: Request, res: Response): void {
  try {
    const { status, language, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

    let submissions = db.submissions.find();

    if (status && typeof status === 'string' && status !== 'All') {
      submissions = submissions.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }

    if (language && typeof language === 'string' && language !== 'All') {
      submissions = submissions.filter((s) => s.language.toLowerCase() === language.toLowerCase());
    }

    submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const total = submissions.length;
    const paginated = submissions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      submissions: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching submissions.' });
  }
}

export function getStatistics(req: Request, res: Response): void {
  try {
    const totalUsers = db.users.count();
    const totalProblems = db.problems.count();
    const totalSubmissions = db.submissions.count();
    const totalBattles = db.battles.count();

    const acceptedSubmissions = db.submissions.count((s) => s.status === 'Accepted');
    const overallAcceptanceRate = totalSubmissions > 0
      ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1))
      : 0;

    res.status(200).json({
      totalUsers,
      totalProblems,
      totalSubmissions,
      totalBattles,
      acceptedSubmissions,
      overallAcceptanceRate,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error calculating statistics.' });
  }
}
