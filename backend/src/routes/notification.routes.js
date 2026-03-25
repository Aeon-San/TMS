import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { authCheck } from '../middleware/authCheck.js';
import validateRequest from '../middleware/validateRequest.js';
import { validateNotificationListQuery } from '../validators/notification.validators.js';

const router = express.Router();

router.use(authCheck);

router.get('/', validateRequest(validateNotificationListQuery), getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:notificationId/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:notificationId', deleteNotification);

export default router;
