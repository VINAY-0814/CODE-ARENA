import { Response } from 'express';
import { db } from '../db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export function getNotifications(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const list = db.notifications
      .find((n) => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = list.filter((n) => !n.isRead).length;

    res.status(200).json({
      unreadCount,
      notifications: list,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching notifications.' });
  }
}

export function markAsRead(req: AuthenticatedRequest, res: Response): void {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = db.notifications.findById(id);
    if (!notification || notification.userId !== user.id) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }

    const updated = db.notifications.updateById(id, { isRead: true });
    res.status(200).json({ message: 'Notification marked as read.', notification: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating notification.' });
  }
}

export function markAllAsRead(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = req.user!;
    const userNotifications = db.notifications.find((n) => n.userId === user.id && !n.isRead);

    userNotifications.forEach((n) => {
      db.notifications.updateById(n.id, { isRead: true });
    });

    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error marking notifications as read.' });
  }
}
