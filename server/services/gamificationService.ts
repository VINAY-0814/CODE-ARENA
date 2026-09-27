import { db, UserDoc, ProblemDoc, SubmissionDoc } from '../db.ts';

export const XP_BY_DIFFICULTY: Record<string, number> = {
  Beginner: 20,
  Easy: 50,
  Medium: 100,
  Hard: 200,
  Expert: 500,
};

/**
 * Calculate user Level from total XP
 */
export function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 1000) return 4;
  if (xp < 1800) return 5;
  if (xp < 3000) return 6;
  if (xp < 5000) return 7;
  if (xp < 8000) return 8;
  return Math.floor(8 + (xp - 8000) / 2500);
}

/**
 * Calculate streak update based on lastActiveDate
 */
export function updateStreak(lastActiveStr?: string, currentStreak: number = 0): { streak: number; lastActiveDate: string } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (!lastActiveStr) {
    return { streak: 1, lastActiveDate: now.toISOString() };
  }

  const lastDate = new Date(lastActiveStr);
  const lastDateStr = lastDate.toISOString().slice(0, 10);

  if (lastDateStr === todayStr) {
    // Already active today, streak stays the same
    return { streak: currentStreak || 1, lastActiveDate: now.toISOString() };
  }

  // Calculate day difference
  const oneDayMs = 24 * 60 * 60 * 1000;
  const todayTime = new Date(todayStr).getTime();
  const lastDateTime = new Date(lastDateStr).getTime();
  const diffDays = Math.round((todayTime - lastDateTime) / oneDayMs);

  if (diffDays === 1) {
    // Exactly yesterday! Streak increments
    return { streak: (currentStreak || 0) + 1, lastActiveDate: now.toISOString() };
  } else {
    // Missed one or more days, reset to 1
    return { streak: 1, lastActiveDate: now.toISOString() };
  }
}

/**
 * Evaluates achievements for a user after a submission
 */
export function evaluateAchievements(
  user: UserDoc,
  problem: ProblemDoc,
  submission: SubmissionDoc
): string[] {
  const unlockedCodes: string[] = [];

  const existingUnlocked = db.userAchievements
    .find((ua) => ua.userId === user.id)
    .map((ua) => ua.achievementCode);

  const checkAndUnlock = (code: string) => {
    if (!existingUnlocked.includes(code)) {
      const ach = db.achievements.findOne((a) => a.code === code);
      if (ach) {
        db.userAchievements.insert({
          userId: user.id,
          achievementId: ach.id,
          achievementCode: code,
          unlockedAt: new Date().toISOString(),
        });

        // Award achievement XP
        const newXp = user.xp + ach.xpReward;
        const newLevel = calculateLevel(newXp);
        db.users.updateById(user.id, {
          xp: newXp,
          level: newLevel,
        });

        // Create notification
        db.notifications.insert({
          userId: user.id,
          title: `Achievement Unlocked: ${ach.title}!`,
          message: `${ach.description} (+${ach.xpReward} XP)`,
          type: 'achievement',
          isRead: false,
          createdAt: new Date().toISOString(),
        });

        unlockedCodes.push(code);
      }
    }
  };

  if (submission.status === 'Accepted') {
    // 1. First Victory
    if (user.problemsSolved >= 1) {
      checkAndUnlock('first-victory');
    }

    // 2. Problem Crusher (10 problems)
    if (user.problemsSolved >= 10) {
      checkAndUnlock('problem-crusher');
    }

    // 3. Perfect Score
    if (submission.testCasesPassed === submission.totalTestCases) {
      checkAndUnlock('perfect-score');
    }

    // 4. Speed Coder
    if (submission.executionTime > 0 && submission.executionTime < 50) {
      checkAndUnlock('speed-coder');
    }
  }

  // 5. Streak Master
  if (user.streak >= 7) {
    checkAndUnlock('streak-master');
  }

  return unlockedCodes;
}
