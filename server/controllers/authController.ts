import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.ts';
import { db, UserDoc } from '../db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { updateStreak, calculateLevel } from '../services/gamificationService.ts';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      res.status(400).json({ message: 'All fields (name, username, email, password) are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      return;
    }

    // Check unique email
    const existingEmail = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      res.status(409).json({ message: 'An account with this email address already exists.' });
      return;
    }

    // Check unique username
    const existingUsername = db.users.findOne((u) => u.username.toLowerCase() === username.toLowerCase());
    if (existingUsername) {
      res.status(409).json({ message: 'This username is already taken. Please choose another.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initial avatar
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ];
    const profileImage = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const isFirst = db.users.count() === 0;
    const role = isFirst ? 'admin' : 'user';

    const now = new Date().toISOString();
    const newUser = db.users.insert({
      name,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      profileImage,
      role,
      xp: 0,
      level: 1,
      streak: 1,
      lastActiveDate: now,
      problemsSolved: 0,
      totalSubmissions: 0,
      solvedProblemIds: [],
      createdAt: now,
      updatedAt: now,
    });

    // Create welcome notification
    db.notifications.insert({
      userId: newUser.id,
      title: 'Welcome to CodeArena!',
      message: 'Solve programming challenges, earn XP, maintain your streak, and climb the leaderboard!',
      type: 'system',
      isRead: false,
      createdAt: now,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    const { password: _, ...userSafe } = newUser;
    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: userSafe,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Update streak on login
    const streakResult = updateStreak(user.lastActiveDate, user.streak);
    const updatedUser = db.users.updateById(user.id, {
      streak: streakResult.streak,
      lastActiveDate: streakResult.lastActiveDate,
    }) || user;

    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      config.jwtSecret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    const { password: _, ...userSafe } = updatedUser;
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: userSafe,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal server error during login.' });
  }
}

export function logout(req: Request, res: Response): void {
  res.status(200).json({ message: 'Logout successful.' });
}

export function getMe(req: AuthenticatedRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthenticated.' });
    return;
  }
  const { password: _, ...userSafe } = req.user;
  res.status(200).json({ user: userSafe });
}
