import { Request, Response } from 'express';
import { db } from '../db.ts';

export function getAchievements(req: Request, res: Response): void {
  try {
    const list = db.achievements.find();
    res.status(200).json({ achievements: list });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching achievements.' });
  }
}
