import Notification from '../models/notification.model.js';
import Task from '../models/task.model.js';
import { sendSystemEmail } from './mailer.js';

export const createNotifications = async (notifications = []) => {
  const validNotifications = notifications.filter(Boolean);
  if (validNotifications.length === 0) return [];
  return Notification.insertMany(validNotifications);
};

export const sendTaskEmail = async ({ recipient, subject, intro, taskName, actionUrl }) => {
  if (!recipient?.email) return;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Task Management Update</h2>
      <p style="margin-bottom: 8px;">${intro}</p>
      <p style="margin-bottom: 8px;"><strong>Task:</strong> ${taskName}</p>
      ${actionUrl ? `<p><a href="${actionUrl}" style="color:#e85d75;">Open task dashboard</a></p>` : ''}
    </div>
  `;

  await sendSystemEmail({
    to: recipient.email,
    subject,
    html,
    text: `${intro}\nTask: ${taskName}\n${actionUrl || ''}`,
  });
};

export const ensureDeadlineReminderNotifications = async (userId) => {
  const now = new Date();
  const nextDay = new Date(now.getTime() + 1000 * 60 * 60 * 24);

  const dueSoonTasks = await Task.find({
    dueDate: { $gte: now, $lte: nextDay },
    taskStatus: { $ne: 'Completed' },
    $or: [{ user: userId }, { assignedTo: userId }],
    $or: [
      { deadlineReminderSentAt: null },
      { deadlineReminderSentAt: { $lt: new Date(now.getTime() - 1000 * 60 * 60 * 12) } },
    ],
  })
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .lean();

  for (const task of dueSoonTasks) {
    const recipients = new Map();
    if (String(task.user?._id) === String(userId)) recipients.set(String(task.user._id), task.user);
    (task.assignedTo || []).forEach((assignedUser) => {
      if (String(assignedUser._id) === String(userId)) {
        recipients.set(String(assignedUser._id), assignedUser);
      }
    });

    const notifications = Array.from(recipients.values()).map((recipient) => ({
      user: recipient._id,
      type: 'deadline_reminder',
      title: 'Task deadline reminder',
      message: `"${task.taskName}" is due within 24 hours`,
      data: {
        taskId: task._id,
        userId,
      },
    }));

    await createNotifications(notifications);

    for (const recipient of recipients.values()) {
      await sendTaskEmail({
        recipient,
        subject: `Deadline reminder: ${task.taskName}`,
        intro: `Your task deadline is approaching and is due on ${new Date(task.dueDate).toLocaleString()}.`,
        taskName: task.taskName,
        actionUrl: process.env.FRONTEND_URL || 'http://localhost:5173/dashboard',
      });
    }

    await Task.updateOne({ _id: task._id }, { deadlineReminderSentAt: new Date() });
  }
};
