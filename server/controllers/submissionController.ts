import { Response } from 'express';
import { db } from '../db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { executeSubmission } from '../services/executionService.ts';
import { XP_BY_DIFFICULTY, calculateLevel, updateStreak, evaluateAchievements } from '../services/gamificationService.ts';

export async function runCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { problemId, language, sourceCode } = req.body;

    if (!problemId || !language || !sourceCode) {
      res.status(400).json({ message: 'problemId, language, and sourceCode are required.' });
      return;
    }

    const problem = db.problems.findById(problemId) || db.problems.findOne((p) => p.slug === problemId);
    if (!problem) {
      res.status(404).json({ message: 'Problem not found.' });
      return;
    }

    // Execute against public test cases only
    const result = await executeSubmission(problem, language, sourceCode, true);

    res.status(200).json({
      message: 'Run complete',
      result,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Execution error.' });
  }
}

export async function submitCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { problemId, language, sourceCode } = req.body;

    if (!problemId || !language || !sourceCode) {
      res.status(400).json({ message: 'problemId, language, and sourceCode are required.' });
      return;
    }

    const problem = db.problems.findById(problemId) || db.problems.findOne((p) => p.slug === problemId);
    if (!problem) {
      res.status(404).json({ message: 'Problem not found.' });
      return;
    }

    // Run against ALL test cases
    const execResult = await executeSubmission(problem, language, sourceCode, false);

    // Calculate score
    const score = execResult.status === 'Accepted'
      ? (problem.points || XP_BY_DIFFICULTY[problem.difficulty] || 50)
      : Math.floor(((problem.points || 50) * execResult.testCasesPassed) / Math.max(1, execResult.totalTestCases));

    // Create Submission document
    const submission = db.submissions.insert({
      userId: user.id,
      username: user.username,
      userProfileImage: user.profileImage,
      problemId: problem.id,
      problemTitle: problem.title,
      language,
      sourceCode,
      status: execResult.status,
      testCasesPassed: execResult.testCasesPassed,
      totalTestCases: execResult.totalTestCases,
      executionTime: execResult.executionTime,
      memoryUsed: execResult.memoryUsed,
      score,
      details: execResult.details,
      submittedAt: new Date().toISOString(),
    });

    // Update Problem stats
    const totalAttempts = problem.totalAttempts + 1;
    const totalAccepted = problem.totalAccepted + (execResult.status === 'Accepted' ? 1 : 0);
    const acceptanceRate = Number(((totalAccepted / totalAttempts) * 100).toFixed(1));
    db.problems.updateById(problem.id, {
      totalAttempts,
      totalAccepted,
      acceptanceRate,
    });

    let xpGained = 0;
    let newLevel = user.level;
    let unlockedAchievements: string[] = [];

    // If Accepted and first time solved by this user
    const solvedIds = new Set(user.solvedProblemIds || []);
    const isFirstTimeSolved = !solvedIds.has(problem.id) && execResult.status === 'Accepted';

    if (isFirstTimeSolved) {
      solvedIds.add(problem.id);
      xpGained = problem.points || XP_BY_DIFFICULTY[problem.difficulty] || 50;
      const newXp = user.xp + xpGained;
      newLevel = calculateLevel(newXp);

      const streakUpdate = updateStreak(user.lastActiveDate, user.streak);

      const updatedUser = db.users.updateById(user.id, {
        xp: newXp,
        level: newLevel,
        streak: streakUpdate.streak,
        lastActiveDate: streakUpdate.lastActiveDate,
        problemsSolved: user.problemsSolved + 1,
        totalSubmissions: user.totalSubmissions + 1,
        solvedProblemIds: Array.from(solvedIds),
      }) || user;

      // Evaluate achievements
      unlockedAchievements = evaluateAchievements(updatedUser, problem, submission);
    } else {
      // Just increment total submissions & update streak
      const streakUpdate = updateStreak(user.lastActiveDate, user.streak);
      db.users.updateById(user.id, {
        streak: streakUpdate.streak,
        lastActiveDate: streakUpdate.lastActiveDate,
        totalSubmissions: user.totalSubmissions + 1,
      });
    }

    res.status(200).json({
      message: execResult.status === 'Accepted' ? 'Challenge Solved!' : 'Submission processed',
      submission,
      xpGained,
      newLevel,
      unlockedAchievements,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Submission error.' });
  }
}

export function getSubmissions(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const { problemId, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;

    let list = db.submissions.find((s) => s.userId === user.id);

    if (problemId && typeof problemId === 'string') {
      list = list.filter((s) => s.problemId === problemId);
    }

    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const total = list.length;
    const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

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

export function getSubmissionById(req: AuthenticatedRequest, res: Response): void {
  try {
    const { id } = req.params;
    const submission = db.submissions.findById(id);

    if (!submission) {
      res.status(404).json({ message: 'Submission not found.' });
      return;
    }

    res.status(200).json({ submission });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching submission.' });
  }
}
