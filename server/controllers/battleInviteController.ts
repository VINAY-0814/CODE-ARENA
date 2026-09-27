import { Response } from 'express';
import { db } from '../db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { realtimeManager } from '../services/realtime.ts';

export function streamNotifications(req: AuthenticatedRequest, res: Response): void {
  const user = req.user!;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  realtimeManager.addClient(user.id, res);

  // Send initial connection event
  const initialData = {
    userId: user.id,
    timestamp: new Date().toISOString(),
  };
  res.write(`event: connected\ndata: ${JSON.stringify(initialData)}\n\n`);

  // Send current state
  try {
    const now = Date.now();
    const pendingInvites = db.battleInvites
      .find((i) => i.toUserId === user.id && i.status === 'pending')
      .filter((i) => new Date(i.expiresAt).getTime() > now);

    const userNotifs = db.notifications.find((n) => n.userId === user.id);
    const unreadCount = userNotifs.filter((n) => !n.isRead).length;

    res.write(
      `event: sync\ndata: ${JSON.stringify({
        unreadCount,
        pendingInvitesCount: pendingInvites.length,
        pendingInvites,
      })}\n\n`
    );
  } catch (err) {
    console.error('Error sending initial SSE sync:', err);
  }
}

export function sendBattleInvite(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const { toUserId, toUsername, battleId, problemId, difficulty = 'Easy' } = req.body;

    // 1. Identify recipient
    let targetUser = null;
    if (toUserId) {
      targetUser = db.users.findById(toUserId);
    } else if (toUsername) {
      targetUser = db.users.findOne((u) => u.username.toLowerCase() === toUsername.toLowerCase());
    }

    if (!targetUser) {
      res.status(404).json({ message: 'Target user not found.' });
      return;
    }

    if (targetUser.id === user.id) {
      res.status(400).json({ message: 'You cannot challenge yourself to a battle.' });
      return;
    }

    // 2. Identify or create Battle
    let battle = null;
    let problem = null;

    if (battleId) {
      battle = db.battles.findById(battleId);
      if (battle) {
        problem = db.problems.findById(battle.problemId);
      }
    }

    if (!battle) {
      // Find problem
      if (problemId) {
        problem = db.problems.findById(problemId);
      }
      if (!problem) {
        const problemsOfDiff = db.problems.find(
          (p) => p.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
        problem = problemsOfDiff.length > 0 ? problemsOfDiff[0] : db.problems.getAll()[0];
      }

      if (!problem) {
        res.status(400).json({ message: 'No problem available to challenge.' });
        return;
      }

      const randomCode = 'ARENA-' + Math.floor(100 + Math.random() * 900);
      battle = db.battles.insert({
        code: randomCode,
        title: `${user.username} vs ${targetUser.username}`,
        problemId: problem.id,
        problemTitle: problem.title,
        problemDifficulty: problem.difficulty,
        status: 'waiting',
        durationSeconds: 600,
        createdBy: user.id,
        createdByName: user.username,
        createdAt: new Date().toISOString(),
      });
    }

    if (!problem) {
      problem = db.problems.findById(battle.problemId);
    }

    // Ensure sender is participant in the battle
    const existingSenderParticipant = db.battleParticipants.findOne(
      (p) => p.battleId === battle!.id && p.userId === user.id
    );
    if (!existingSenderParticipant) {
      db.battleParticipants.insert({
        battleId: battle.id,
        userId: user.id,
        username: user.username,
        profileImage: user.profileImage,
        status: 'ready',
        testsPassed: 0,
        totalTests: problem?.testCases?.length || 0,
        score: 0,
      });
    }

    // 3. Create BattleInvite record
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const invite = db.battleInvites.insert({
      battleId: battle.id,
      battleCode: battle.code,
      battleTitle: battle.title,
      problemId: problem?.id || battle.problemId,
      problemTitle: problem?.title || battle.problemTitle,
      problemDifficulty: problem?.difficulty || battle.problemDifficulty,
      fromUserId: user.id,
      fromUsername: user.username,
      fromProfileImage: user.profileImage,
      toUserId: targetUser.id,
      toUsername: targetUser.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    // 4. Create Notification for recipient
    const notification = db.notifications.insert({
      userId: targetUser.id,
      title: '⚔️ 1v1 Battle Challenge!',
      message: `@${user.username} has invited you to a 1v1 duel on "${problem?.title || battle.problemTitle}"!`,
      type: 'battle_invite',
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: {
        inviteId: invite.id,
        battleId: battle.id,
        battleCode: battle.code,
        battleTitle: battle.title,
        fromUserId: user.id,
        fromUsername: user.username,
        fromProfileImage: user.profileImage,
        problemId: problem?.id || battle.problemId,
        problemTitle: problem?.title || battle.problemTitle,
        problemDifficulty: problem?.difficulty || battle.problemDifficulty,
        status: 'pending',
      },
    });

    // 5. Send real-time SSE push to recipient
    const pendingInvites = db.battleInvites
      .find((i) => i.toUserId === targetUser.id && i.status === 'pending')
      .filter((i) => new Date(i.expiresAt).getTime() > Date.now());

    const recipientNotifs = db.notifications.find((n) => n.userId === targetUser.id);
    const unreadCount = recipientNotifs.filter((n) => !n.isRead).length;

    realtimeManager.sendToUser(targetUser.id, 'NEW_BATTLE_INVITE', {
      invite,
      notification,
      unreadCount,
      pendingInvitesCount: pendingInvites.length,
      pendingInvites,
    });

    res.status(201).json({
      success: true,
      message: `Invitation sent to @${targetUser.username}!`,
      invite,
      battleId: battle.id,
      battleCode: battle.code,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error sending battle invitation.' });
  }
}

export function getPendingInvites(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const now = Date.now();

    const allInvites = db.battleInvites.find((i) => i.toUserId === user.id);

    // Update expired invites
    allInvites.forEach((inv) => {
      if (inv.status === 'pending' && new Date(inv.expiresAt).getTime() <= now) {
        db.battleInvites.updateById(inv.id, { status: 'expired' });
        inv.status = 'expired';
      }
    });

    const pending = allInvites
      .filter((i) => i.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      invites: pending,
      count: pending.length,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching pending invites.' });
  }
}

export function acceptBattleInvite(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const { id } = req.params;

    const invite = db.battleInvites.findById(id);
    if (!invite) {
      res.status(404).json({ message: 'Invitation not found.' });
      return;
    }

    if (invite.toUserId !== user.id) {
      res.status(403).json({ message: 'You are not authorized to accept this invite.' });
      return;
    }

    if (invite.status !== 'pending') {
      res.status(400).json({ message: `Invite is already ${invite.status}.` });
      return;
    }

    if (new Date(invite.expiresAt).getTime() <= Date.now()) {
      db.battleInvites.updateById(id, { status: 'expired' });
      res.status(400).json({ message: 'This invitation has expired.' });
      return;
    }

    // 1. Update invite status
    const updatedInvite = db.battleInvites.updateById(id, { status: 'accepted' });

    // 2. Add recipient to battleParticipants
    const existingParticipant = db.battleParticipants.findOne(
      (p) => p.battleId === invite.battleId && p.userId === user.id
    );

    const problem = db.problems.findById(invite.problemId);

    if (!existingParticipant) {
      db.battleParticipants.insert({
        battleId: invite.battleId,
        userId: user.id,
        username: user.username,
        profileImage: user.profileImage,
        status: 'ready',
        testsPassed: 0,
        totalTests: problem?.testCases?.length || 0,
        score: 0,
      });
    }

    // 3. Mark notification as read
    const relatedNotifs = db.notifications.find(
      (n) => n.userId === user.id && n.metadata?.inviteId === id
    );
    relatedNotifs.forEach((n) => {
      db.notifications.updateById(n.id, {
        isRead: true,
        metadata: { ...n.metadata, status: 'accepted' },
      });
    });

    // 4. Notify challenger in real-time
    const challengerNotification = db.notifications.insert({
      userId: invite.fromUserId,
      title: '⚔️ Invite Accepted!',
      message: `@${user.username} accepted your challenge! The 1v1 battle arena is ready.`,
      type: 'battle',
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: {
        inviteId: invite.id,
        battleId: invite.battleId,
        battleCode: invite.battleCode,
        fromUserId: user.id,
        fromUsername: user.username,
        status: 'accepted',
      },
    });

    const challengerNotifs = db.notifications.find((n) => n.userId === invite.fromUserId);
    const challengerUnread = challengerNotifs.filter((n) => !n.isRead).length;

    realtimeManager.sendToUser(invite.fromUserId, 'INVITE_ACCEPTED', {
      invite: updatedInvite,
      acceptedBy: {
        id: user.id,
        username: user.username,
        profileImage: user.profileImage,
      },
      battleId: invite.battleId,
      battleCode: invite.battleCode,
      notification: challengerNotification,
      unreadCount: challengerUnread,
    });

    res.status(200).json({
      success: true,
      message: 'Invitation accepted! Entering 1v1 Arena...',
      battleId: invite.battleId,
      battleCode: invite.battleCode,
      invite: updatedInvite,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error accepting battle invitation.' });
  }
}

export function declineBattleInvite(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const { id } = req.params;

    const invite = db.battleInvites.findById(id);
    if (!invite) {
      res.status(404).json({ message: 'Invitation not found.' });
      return;
    }

    if (invite.toUserId !== user.id) {
      res.status(403).json({ message: 'You are not authorized to decline this invite.' });
      return;
    }

    const updatedInvite = db.battleInvites.updateById(id, { status: 'declined' });

    // Mark notification as read
    const relatedNotifs = db.notifications.find(
      (n) => n.userId === user.id && n.metadata?.inviteId === id
    );
    relatedNotifs.forEach((n) => {
      db.notifications.updateById(n.id, {
        isRead: true,
        metadata: { ...n.metadata, status: 'declined' },
      });
    });

    // Notify challenger in real-time
    realtimeManager.sendToUser(invite.fromUserId, 'INVITE_DECLINED', {
      inviteId: invite.id,
      declinedBy: {
        id: user.id,
        username: user.username,
      },
      battleTitle: invite.battleTitle,
    });

    res.status(200).json({
      success: true,
      message: 'Invitation declined.',
      invite: updatedInvite,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error declining battle invitation.' });
  }
}

export function getAvailableUsers(req: AuthenticatedRequest, res: Response): void {
  try {
    const currentUser = req.user!;
    const allUsers = db.users.getAll();

    const candidates = allUsers
      .filter((u) => u.id !== currentUser.id)
      .map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        profileImage: u.profileImage,
        level: u.level || 1,
        xp: u.xp || 0,
        streak: u.streak || 0,
        rank: u.rank || 1,
        isOnline: realtimeManager.isUserOnline(u.id),
      }))
      .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));

    res.status(200).json({
      success: true,
      users: candidates,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching users.' });
  }
}
