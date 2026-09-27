import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.ts';
import * as authController from '../controllers/authController.ts';
import * as userController from '../controllers/userController.ts';
import * as problemController from '../controllers/problemController.ts';
import * as submissionController from '../controllers/submissionController.ts';
import * as leaderboardController from '../controllers/leaderboardController.ts';
import * as achievementController from '../controllers/achievementController.ts';
import * as battleController from '../controllers/battleController.ts';
import * as notificationController from '../controllers/notificationController.ts';
import * as inviteController from '../controllers/battleInviteController.ts';
import * as adminController from '../controllers/adminController.ts';

const api = Router();

// Authentication
api.post('/auth/register', authController.register);
api.post('/auth/login', authController.login);
api.post('/auth/logout', authController.logout);
api.get('/auth/me', authMiddleware, authController.getMe);

// Users
api.get('/users/profile', authMiddleware, userController.getProfile);
api.put('/users/profile', authMiddleware, userController.updateProfile);
api.get('/users/progress', authMiddleware, userController.getProgress);
api.get('/users/recent-submissions', authMiddleware, userController.getRecentSubmissions);
api.get('/users/achievements', authMiddleware, userController.getUserAchievements);

// Problems
api.get('/problems', problemController.getProblems);
api.get('/problems/daily', problemController.getDailyProblem);
api.get('/problems/:id', problemController.getProblemById);

// Submissions
api.post('/submissions/run', authMiddleware, submissionController.runCode);
api.post('/submissions/submit', authMiddleware, submissionController.submitCode);
api.get('/submissions', authMiddleware, submissionController.getSubmissions);
api.get('/submissions/:id', authMiddleware, submissionController.getSubmissionById);

// Leaderboard
api.get('/leaderboard', leaderboardController.getLeaderboard);

// Achievements
api.get('/achievements', achievementController.getAchievements);

// Battles
api.post('/battles', authMiddleware, battleController.createBattle);
api.get('/battles', authMiddleware, battleController.getBattles);
api.get('/battles/history', authMiddleware, battleController.getBattleHistory);
api.get('/battles/available-opponents', authMiddleware, inviteController.getAvailableUsers);
api.post('/battles/invite', authMiddleware, inviteController.sendBattleInvite);
api.get('/battles/invites/pending', authMiddleware, inviteController.getPendingInvites);
api.post('/battles/invites/:id/accept', authMiddleware, inviteController.acceptBattleInvite);
api.post('/battles/invites/:id/decline', authMiddleware, inviteController.declineBattleInvite);
api.get('/battles/:id', authMiddleware, battleController.getBattleById);
api.post('/battles/:id/join', authMiddleware, battleController.joinBattle);
api.post('/battles/:id/submit', authMiddleware, battleController.submitBattleCode);

// Notifications & Realtime
api.get('/notifications/stream', authMiddleware, inviteController.streamNotifications);
api.get('/notifications', authMiddleware, notificationController.getNotifications);
api.put('/notifications/read-all', authMiddleware, notificationController.markAllAsRead);
api.put('/notifications/:id/read', authMiddleware, notificationController.markAsRead);

// Admin Routes (Protected by authMiddleware + adminMiddleware)
api.get('/admin/statistics', authMiddleware, adminMiddleware, adminController.getStatistics);
api.get('/admin/users', authMiddleware, adminMiddleware, adminController.getUsers);
api.get('/admin/users/:id', authMiddleware, adminMiddleware, adminController.getUserById);
api.put('/admin/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);
api.delete('/admin/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);

api.get('/admin/problems', authMiddleware, adminMiddleware, adminController.getProblems);
api.post('/admin/problems', authMiddleware, adminMiddleware, adminController.createProblem);
api.put('/admin/problems/:id', authMiddleware, adminMiddleware, adminController.updateProblem);
api.delete('/admin/problems/:id', authMiddleware, adminMiddleware, adminController.deleteProblem);

api.get('/admin/submissions', authMiddleware, adminMiddleware, adminController.getSubmissions);

export default api;
