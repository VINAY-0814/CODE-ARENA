import { Response } from 'express';
import { db } from '../db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { executeSubmission } from '../services/executionService.ts';
import { calculateLevel } from '../services/gamificationService.ts';

export function createBattle(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const { title, difficulty = 'Easy' } = req.body;

    // Pick random problem matching difficulty
    const problems = db.problems.find((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    const selectedProblem = problems.length > 0
      ? problems[Math.floor(Math.random() * problems.length)]
      : db.problems.find()[0];

    if (!selectedProblem) {
      res.status(400).json({ message: 'No challenges available for battle.' });
      return;
    }

    const roomCode = `ARENA-${Math.floor(100 + Math.random() * 900)}`;

    const battle = db.battles.insert({
      code: roomCode,
      title: title || `${selectedProblem.difficulty} Showdown: ${selectedProblem.title}`,
      problemId: selectedProblem.id,
      problemTitle: selectedProblem.title,
      problemDifficulty: selectedProblem.difficulty,
      status: 'waiting',
      durationSeconds: 600, // 10 minutes
      createdBy: user.id,
      createdByName: user.username,
      createdAt: new Date().toISOString(),
    });

    // Add creator as participant
    const participant = db.battleParticipants.insert({
      battleId: battle.id,
      userId: user.id,
      username: user.username,
      profileImage: user.profileImage,
      status: 'ready',
      testsPassed: 0,
      totalTests: selectedProblem.testCases.length,
      score: 0,
    });

    res.status(201).json({
      message: 'Battle arena created. Waiting for opponent.',
      battle,
      participant,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating battle.' });
  }
}

export function getBattles(req: AuthenticatedRequest, res: Response): void {
  try {
    const battles = db.battles
      .find((b) => b.status === 'waiting' || b.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const enriched = battles.map((b) => {
      const participants = db.battleParticipants.find((p) => p.battleId === b.id);
      return {
        ...b,
        participantsCount: participants.length,
        participants: participants.map((p) => ({
          userId: p.userId,
          username: p.username,
          profileImage: p.profileImage,
          status: p.status,
        })),
      };
    });

    res.status(200).json({ battles: enriched });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching battles.' });
  }
}

export function getBattleHistory(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 5));

    // 1. Find all battle participations for this user
    const userParticipations = db.battleParticipants.find((p) => p.userId === user.id);
    const userBattleIds = new Set(userParticipations.map((p) => p.battleId));

    // Also include battles created by user
    const createdBattles = db.battles.find((b) => b.createdBy === user.id);
    createdBattles.forEach((b) => userBattleIds.add(b.id));

    // 2. Fetch completed battles only
    const allCompletedBattles = db.battles
      .find((b) => userBattleIds.has(b.id) && b.status === 'completed')
      .sort((a, b) => {
        const timeA = new Date(a.endedAt || a.createdAt).getTime();
        const timeB = new Date(b.endedAt || b.createdAt).getTime();
        return timeB - timeA;
      });

    // 3. Take the last 5 completed battles (or requested limit)
    const recentCompleted = allCompletedBattles.slice(0, limit);

    // 4. Enrich with opponent details and outcome
    const enrichedHistory = recentCompleted.map((battle) => {
      const allParticipants = db.battleParticipants.find((p) => p.battleId === battle.id);
      
      const userParticipant = allParticipants.find((p) => p.userId === user.id);
      const opponents = allParticipants
        .filter((p) => p.userId !== user.id)
        .map((p) => {
          const oppUser = db.users.findById(p.userId);
          return {
            userId: p.userId,
            username: p.username || oppUser?.username || 'Opponent',
            profileImage: p.profileImage || oppUser?.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username || 'rival'}`,
            status: p.status,
            testsPassed: p.testsPassed || 0,
            totalTests: p.totalTests || 0,
            executionTimeMs: p.executionTimeMs || 0,
            score: p.score || 0,
            submittedAt: p.submittedAt || null,
          };
        });

      // Calculate outcome for this user
      let outcome: 'victory' | 'defeat' | 'draw' = 'draw';
      if (battle.winnerId) {
        if (battle.winnerId === user.id) {
          outcome = 'victory';
        } else {
          outcome = 'defeat';
        }
      }

      const problem = db.problems.findById(battle.problemId);

      return {
        id: battle.id,
        code: battle.code,
        title: battle.title,
        problemId: battle.problemId,
        problemTitle: battle.problemTitle || problem?.title || 'Algorithm Duel',
        problemDifficulty: battle.problemDifficulty || problem?.difficulty || 'Medium',
        status: battle.status,
        durationSeconds: battle.durationSeconds || 600,
        createdAt: battle.createdAt,
        endedAt: battle.endedAt || battle.createdAt,
        winnerId: battle.winnerId,
        winnerUsername: battle.winnerUsername,
        outcome,
        opponents,
        userResult: {
          userId: user.id,
          username: user.username,
          status: userParticipant?.status || 'completed',
          testsPassed: userParticipant?.testsPassed || 0,
          totalTests: userParticipant?.totalTests || (problem?.testCases?.length || 0),
          executionTimeMs: userParticipant?.executionTimeMs || 0,
          score: userParticipant?.score || (outcome === 'victory' ? 200 : 0),
          submittedAt: userParticipant?.submittedAt || null,
        },
      };
    });

    // Summary statistics for the user
    const totalCompleted = allCompletedBattles.length;
    const totalVictories = allCompletedBattles.filter((b) => b.winnerId === user.id).length;
    const totalDefeats = allCompletedBattles.filter((b) => b.winnerId && b.winnerId !== user.id).length;
    const winRate = totalCompleted > 0 ? Math.round((totalVictories / totalCompleted) * 100) : 0;

    res.status(200).json({
      success: true,
      battles: enrichedHistory,
      stats: {
        totalCompleted,
        totalVictories,
        totalDefeats,
        winRate,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching battle history.' });
  }
}

export function getBattleById(req: AuthenticatedRequest, res: Response): void {
  try {
    const { id } = req.params;
    const battle = db.battles.findById(id) || db.battles.findOne((b) => b.code === id);

    if (!battle) {
      res.status(404).json({ message: 'Battle not found.' });
      return;
    }

    const participants = db.battleParticipants.find((p) => p.battleId === battle.id);
    const problem = db.problems.findById(battle.problemId);

    // Filter hidden test cases for participants
    const safeProblem = problem
      ? {
          ...problem,
          testCases: problem.testCases.filter((tc) => !tc.isHidden),
          totalTestCases: problem.testCases.length,
        }
      : null;

    res.status(200).json({
      battle,
      participants,
      problem: safeProblem,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching battle details.' });
  }
}

export function joinBattle(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const { id } = req.params;

    const battle = db.battles.findById(id) || db.battles.findOne((b) => b.code === id);
    if (!battle) {
      res.status(404).json({ message: 'Battle not found.' });
      return;
    }

    if (battle.status !== 'waiting') {
      res.status(400).json({ message: 'Battle has already started or ended.' });
      return;
    }

    const existingParticipants = db.battleParticipants.find((p) => p.battleId === battle.id);
    const alreadyIn = existingParticipants.some((p) => p.userId === user.id);

    if (!alreadyIn) {
      if (existingParticipants.length >= 2) {
        res.status(400).json({ message: 'Battle room is already full (1v1 capacity reached).' });
        return;
      }

      db.battleParticipants.insert({
        battleId: battle.id,
        userId: user.id,
        username: user.username,
        profileImage: user.profileImage,
        status: 'coding',
        testsPassed: 0,
        totalTests: 0,
        score: 0,
      });
    }

    // Start battle!
    const updatedBattle = db.battles.updateById(battle.id, {
      status: 'active',
      startedAt: new Date().toISOString(),
    });

    // Notify participants
    existingParticipants.forEach((p) => {
      if (p.userId !== user.id) {
        db.notifications.insert({
          userId: p.userId,
          title: 'Battle Started!',
          message: `${user.username} has joined your 1v1 arena challenge! Game on!`,
          type: 'battle',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    res.status(200).json({
      message: 'Joined battle successfully.',
      battle: updatedBattle,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error joining battle.' });
  }
}

export async function submitBattleCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { language, sourceCode } = req.body;

    const battle = db.battles.findById(id) || db.battles.findOne((b) => b.code === id);
    if (!battle) {
      res.status(404).json({ message: 'Battle not found.' });
      return;
    }

    if (battle.status !== 'active') {
      res.status(400).json({ message: 'Battle is not active.' });
      return;
    }

    const participant = db.battleParticipants.findOne(
      (p) => p.battleId === battle.id && p.userId === user.id
    );

    if (!participant) {
      res.status(403).json({ message: 'You are not a registered participant in this battle.' });
      return;
    }

    const problem = db.problems.findById(battle.problemId);
    if (!problem) {
      res.status(404).json({ message: 'Battle problem not found.' });
      return;
    }

    // Execute code
    const execResult = await executeSubmission(problem, language, sourceCode, false);

    // Update participant
    const isWinner = execResult.status === 'Accepted';
    db.battleParticipants.updateById(participant.id, {
      status: isWinner ? 'submitted' : 'coding',
      testsPassed: execResult.testCasesPassed,
      totalTests: execResult.totalTestCases,
      executionTimeMs: execResult.executionTime,
      code: sourceCode,
      language,
      submittedAt: new Date().toISOString(),
    });

    let battleCompleted = false;

    if (isWinner && !battle.winnerId) {
      // User won the 1v1 battle!
      battleCompleted = true;
      db.battles.updateById(battle.id, {
        status: 'completed',
        winnerId: user.id,
        winnerUsername: user.username,
        endedAt: new Date().toISOString(),
      });

      // Award XP to winner
      const winXpBonus = 200;
      const newXp = user.xp + winXpBonus;
      db.users.updateById(user.id, {
        xp: newXp,
        level: calculateLevel(newXp),
      });

      // Unlock 'battle-veteran' achievement if not unlocked
      const ach = db.achievements.findOne((a) => a.code === 'battle-veteran');
      if (ach) {
        const hasAch = db.userAchievements.findOne(
          (ua) => ua.userId === user.id && ua.achievementCode === 'battle-veteran'
        );
        if (!hasAch) {
          db.userAchievements.insert({
            userId: user.id,
            achievementId: ach.id,
            achievementCode: ach.code,
            unlockedAt: new Date().toISOString(),
          });
        }
      }

      // Notify winner
      db.notifications.insert({
        userId: user.id,
        title: 'Battle Victory! ⚔️',
        message: `You won the 1v1 battle "${battle.title}"! (+200 XP)`,
        type: 'battle',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.status(200).json({
      message: isWinner ? 'Victory! All tests passed.' : 'Tests executed.',
      passed: isWinner,
      testCasesPassed: execResult.testCasesPassed,
      totalTestCases: execResult.totalTestCases,
      executionTime: execResult.executionTime,
      battleCompleted,
      details: execResult.details,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error submitting battle code.' });
  }
}
