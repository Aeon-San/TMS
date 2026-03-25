import Task from "../models/task.model.js";
import Board from "../models/board.model.js";
import { createNotifications, ensureDeadlineReminderNotifications, sendTaskEmail } from "../library/notificationHelpers.js";
import { sanitizeArrayOfStrings, sanitizeText } from "../library/sanitize.js";

const VALID_STATUSES = ["Pending", "In Progress", "Completed"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

const parseTags = (tags) => {
  return sanitizeArrayOfStrings(tags, 15);
};

const getBoardAccess = async (boardId, userId, role) => {
  if (!boardId) return { board: null, memberRole: null, hasAccess: true };

  const board = await Board.findById(boardId);
  if (!board) return { board: null, memberRole: null, hasAccess: false, error: "Board not found" };

  const membership = board.members.find((member) => member.user.toString() === userId.toString());
  const memberRole = membership?.role || null;
  const isOwner = board.owner.toString() === userId.toString();
  const hasAccess = role === "admin" || isOwner || Boolean(memberRole);

  return { board, memberRole, hasAccess, isOwner };
};

const canManageTask = (task, reqUserId, reqUserRole) => {
  if (reqUserRole === "admin") return true;
  if (String(task.user?._id || task.user) === String(reqUserId)) return true;
  return task.assignedTo.some((user) => String(user?._id || user) === String(reqUserId));
};

const addActivity = (task, user, action, summary, changes = []) => {
  task.activityHistory.push({
    action,
    summary,
    user: user._id,
    userName: user.name,
    changes,
  });
};

const populateTask = (query) =>
  query
    .populate("user", "name email avatar role")
    .populate("assignedTo", "name email avatar role")
    .populate({
      path: "board",
      select: "name members owner",
      populate: {
        path: "members.user",
        select: "name email avatar role",
      },
    })
    .populate("comments.user", "name email avatar role")
    .populate("activityHistory.user", "name email avatar role");

const buildTaskUpdateNotifications = (task, actor, message, type = "task_updated", extraData = {}) => {
  const recipients = new Map();

  if (String(task.user._id || task.user) !== String(actor._id)) {
    recipients.set(String(task.user._id || task.user), task.user);
  }

  (task.assignedTo || []).forEach((assignedUser) => {
    if (String(assignedUser._id || assignedUser) !== String(actor._id)) {
      recipients.set(String(assignedUser._id || assignedUser), assignedUser);
    }
  });

  return Array.from(recipients.values()).map((recipient) => ({
    user: recipient._id || recipient,
    type,
    title: "Task updated",
    message,
    data: {
      taskId: task._id,
      boardId: task.board?._id || task.board || null,
      userId: actor._id,
      ...extraData,
    },
  }));
};

export const addTask = async (req, res) => {
  const { taskName, description, priority, taskStatus, dueDate, category, boardId, assignedTo, tags } = req.body;

  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }

  if (!taskName || taskName.trim().length < 3) {
    return res.status(400).json({ message: "Task name must be at least 3 characters!" });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ message: "Invalid priority value!" });
  }

  if (taskStatus && !VALID_STATUSES.includes(taskStatus)) {
    return res.status(400).json({ message: "Invalid task status value!" });
  }

  try {
    const { board, hasAccess, error } = await getBoardAccess(boardId, req.userId, req.user.role);
    if (!hasAccess) {
      return res.status(error === "Board not found" ? 404 : 403).json({ message: error || "You don't have access to this board" });
    }

    const newTask = new Task({
      taskName: sanitizeText(taskName, { maxLength: 120 }),
      description: sanitizeText(description, { maxLength: 2000 }),
      priority: priority || "Medium",
      taskStatus: taskStatus || "Pending",
      dueDate: dueDate ? new Date(dueDate) : null,
      category: sanitizeText(category || "General", { maxLength: 50 }) || "General",
      tags: parseTags(tags),
      user: req.userId,
      board: board?._id || null,
      assignedTo: assignedTo || [],
    });

    addActivity(newTask, req.user, "created", `${req.user.name} created this task`, [
      { field: "taskName", oldValue: null, newValue: newTask.taskName },
      { field: "priority", oldValue: null, newValue: newTask.priority },
      { field: "taskStatus", oldValue: null, newValue: newTask.taskStatus },
    ]);

    await newTask.save();
    const populatedTask = await populateTask(Task.findById(newTask._id));

    if (assignedTo && assignedTo.length > 0) {
      const notifications = assignedTo.map((userId) => ({
        user: userId,
        type: "task_assigned",
        title: "Task Assigned",
        message: `You have been assigned to "${newTask.taskName}"`,
        data: {
          taskId: newTask._id,
          boardId: board?._id || null,
          userId: req.userId,
        },
      }));

      await createNotifications(notifications);

      for (const assignedUser of populatedTask.assignedTo) {
        await sendTaskEmail({
          recipient: assignedUser,
          subject: `Task assigned: ${newTask.taskName}`,
          intro: `${req.user.name} assigned you a task.`,
          taskName: newTask.taskName,
          actionUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`,
        });
      }
    }

    res.status(201).json({ task: populatedTask, message: "Task created successfully" });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Error while adding task!" });
  }
};

export const getAllTask = async (req, res) => {
  try {
    const {
      boardId,
      status,
      priority,
      category,
      tag,
      search,
      deadlineFilter = "All",
      sortBy = "newest",
      page = 1,
      limit = 50,
    } = req.query;

    if (boardId) {
      const { hasAccess, error } = await getBoardAccess(boardId, req.userId, req.user.role);
      if (!hasAccess) {
        return res.status(error === "Board not found" ? 404 : 403).json({ message: error || "Access denied to this board" });
      }
    }

    const query = {
      $or: [{ user: req.userId }, { assignedTo: req.userId }],
      ...(boardId ? { board: boardId } : {}),
    };

    if (status && VALID_STATUSES.includes(status)) {
      query.taskStatus = status;
    }
    if (priority && VALID_PRIORITIES.includes(priority)) {
      query.priority = priority;
    }
    if (category && category !== "All") {
      query.category = category;
    }
    if (tag) {
      query.tags = { $regex: String(tag), $options: "i" };
    }
    if (search) {
      query.$and = [{
        $or: [
          { taskName: { $regex: String(search), $options: "i" } },
          { description: { $regex: String(search), $options: "i" } },
          { category: { $regex: String(search), $options: "i" } },
          { tags: { $regex: String(search), $options: "i" } },
        ],
      }];
    }

    const now = new Date();
    if (deadlineFilter === "Today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      query.dueDate = { $gte: start, $lt: end };
    } else if (deadlineFilter === "This Week") {
      const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
      query.dueDate = { $gte: now, $lte: end };
    } else if (deadlineFilter === "Overdue") {
      query.dueDate = { $lt: now };
      query.taskStatus = { $ne: "Completed" };
    } else if (deadlineFilter === "No Deadline") {
      query.dueDate = null;
    }

    const sortConfig = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priority: { priority: -1, createdAt: -1 },
      deadline: { dueDate: 1, createdAt: -1 },
      title: { taskName: 1 },
    }[sortBy] || { createdAt: -1 };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const [tasks, total] = await Promise.all([
      populateTask(
        Task.find(query)
          .sort(sortConfig)
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber)
      ).lean(),
      Task.countDocuments(query),
    ]);

    await ensureDeadlineReminderNotifications(req.userId);

    res.status(200).json({
      tasks,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber) || 1,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "server error!" });
  }
};

export const getTask = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID not given!" });
  }

  try {
    const task = await populateTask(Task.findById(id));

    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    if (!canManageTask(task, req.userId, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized! You do not have access to this task." });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error!" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskName, description, priority, dueDate, category, taskStatus, tags } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Invalid task ID!" });
    }

    const task = await Task.findById(id).populate("user", "name email avatar role").populate("assignedTo", "name email avatar role");
    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    if (!canManageTask(task, req.userId, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized! Task does not belong to you." });
    }

    const changes = [];
    const setChange = (field, newValue) => {
      if (newValue === undefined) return;
      const oldValue = task[field];
      const normalizedOld = oldValue instanceof Date ? oldValue.toISOString() : oldValue;
      const normalizedNew = newValue instanceof Date ? newValue.toISOString() : newValue;
      if (JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew)) {
        changes.push({ field, oldValue: normalizedOld, newValue: normalizedNew });
        task[field] = newValue;
      }
    };

    if (taskName !== undefined) {
      if (!taskName.trim() || taskName.trim().length < 3) {
        return res.status(400).json({ message: "Task name must be at least 3 characters!" });
      }
      setChange("taskName", sanitizeText(taskName, { maxLength: 120 }));
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ message: "Invalid priority value!" });
      }
      setChange("priority", priority);
    }

    if (taskStatus !== undefined) {
      if (!VALID_STATUSES.includes(taskStatus)) {
        return res.status(400).json({ message: "Invalid task status value!" });
      }
      setChange("taskStatus", taskStatus);
    }

    if (description !== undefined) setChange("description", sanitizeText(description, { maxLength: 2000 }));
    if (dueDate !== undefined) setChange("dueDate", dueDate ? new Date(dueDate) : null);
    if (category !== undefined) setChange("category", sanitizeText(category || "General", { maxLength: 50 }) || "General");
    if (tags !== undefined) setChange("tags", parseTags(tags));

    if (changes.length === 0) {
      const populatedTask = await populateTask(Task.findById(task._id));
      return res.status(200).json({ task: populatedTask, message: "No changes detected" });
    }

    addActivity(task, req.user, "updated", `${req.user.name} updated this task`, changes);
    await task.save();
    const populatedTask = await populateTask(Task.findById(task._id));

    const notifications = buildTaskUpdateNotifications(
      populatedTask,
      req.user,
      `${req.user.name} updated "${populatedTask.taskName}"`,
      "task_updated",
      { changes }
    );
    await createNotifications(notifications);

    for (const recipient of [populatedTask.user, ...(populatedTask.assignedTo || [])]) {
      if (String(recipient._id) === String(req.user._id)) continue;
      await sendTaskEmail({
        recipient,
        subject: `Task updated: ${populatedTask.taskName}`,
        intro: `${req.user.name} updated task details.`,
        taskName: populatedTask.taskName,
        actionUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`,
      });
    }

    res.status(200).json({ task: populatedTask, message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error!" });
  }
};

export const toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Invalid task ID!" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value!" });
    }

    const task = await Task.findById(id).populate("user", "name email avatar role").populate("assignedTo", "name email avatar role");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!canManageTask(task, req.userId, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized! You don't have access to this task." });
    }

    const oldStatus = task.taskStatus;
    task.taskStatus = status || (task.taskStatus === "Pending" ? "In Progress" : task.taskStatus === "In Progress" ? "Completed" : "Pending");

    addActivity(task, req.user, "status_changed", `${req.user.name} changed status from ${oldStatus} to ${task.taskStatus}`, [
      { field: "taskStatus", oldValue: oldStatus, newValue: task.taskStatus },
    ]);

    await task.save();
    const populatedTask = await populateTask(Task.findById(task._id));

    const notifications = buildTaskUpdateNotifications(
      populatedTask,
      req.user,
      `"${populatedTask.taskName}" status changed from ${oldStatus} to ${populatedTask.taskStatus}`,
      "task_status_changed",
      { oldValue: oldStatus, newValue: populatedTask.taskStatus }
    );
    await createNotifications(notifications);

    res.status(200).json({ task: populatedTask, message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error toggling task status:", error);
    res.status(500).json({ message: "Server error!" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!canManageTask(task, req.userId, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized! You can't delete this task." });
    }

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error!" });
  }
};

export const assignTask = async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  try {
    const task = await Task.findById(id).populate("user", "name email avatar role").populate("assignedTo", "name email avatar role");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!canManageTask(task, req.userId, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized! You don't have access to this task." });
    }

    const oldAssigned = task.assignedTo.map((user) => user._id.toString());
    const newAssigned = userIds || [];
    const newlyAssigned = newAssigned.filter((userId) => !oldAssigned.includes(userId));

    task.assignedTo = newAssigned;
    addActivity(task, req.user, "assignment_changed", `${req.user.name} updated assignees`, [
      { field: "assignedTo", oldValue: oldAssigned, newValue: newAssigned },
    ]);
    await task.save();
    const populatedTask = await populateTask(Task.findById(task._id));

    if (newlyAssigned.length > 0) {
      const notifications = newlyAssigned.map((userId) => ({
        user: userId,
        type: "task_assigned",
        title: "Task Assigned",
        message: `You have been assigned to "${task.taskName}"`,
        data: {
          taskId: task._id,
          userId: req.userId,
        },
      }));
      await createNotifications(notifications);

      for (const assignedUser of populatedTask.assignedTo.filter((user) => newlyAssigned.includes(String(user._id)))) {
        await sendTaskEmail({
          recipient: assignedUser,
          subject: `Task assigned: ${task.taskName}`,
          intro: `${req.user.name} assigned you a task.`,
          taskName: task.taskName,
          actionUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`,
        });
      }
    }

    res.status(200).json({ task: populatedTask, message: "Task assignees updated successfully" });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ message: "Server error!" });
  }
};

export const addComment = async (req, res) => {
  const { id } = req.params;
  const { content, mentions } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  try {
    const task = await Task.findById(id).populate("user", "name email avatar role").populate("assignedTo", "name email avatar role");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!canManageTask(task, req.userId, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized! You don't have access to this task." });
    }

    const comment = {
      user: req.userId,
      content: sanitizeText(content, { maxLength: 1500 }),
      mentions: mentions || [],
    };

    task.comments.push(comment);
    addActivity(task, req.user, "comment_added", `${req.user.name} added a comment`, [
      { field: "comment", oldValue: null, newValue: sanitizeText(content, { maxLength: 1500 }) },
    ]);
    await task.save();
    const populatedTask = await populateTask(Task.findById(task._id));

    const notifications = [];
    const mentionedUsers = new Set((mentions || []).map(String));
    const participants = new Set([
      String(task.user._id),
      ...task.assignedTo.map((user) => String(user._id)),
    ]);

    mentionedUsers.forEach((userId) => {
      if (userId !== String(req.userId)) {
        notifications.push({
          user: userId,
          type: "task_comment_added",
          title: "Task Comment",
          message: `${req.user.name} mentioned you in "${task.taskName}"`,
          data: {
            taskId: task._id,
            userId: req.userId,
          },
        });
      }
    });

    participants.forEach((userId) => {
      if (userId !== String(req.userId) && !mentionedUsers.has(userId)) {
        notifications.push({
          user: userId,
          type: "task_comment_added",
          title: "Task Comment",
          message: `${req.user.name} commented on "${task.taskName}"`,
          data: {
            taskId: task._id,
            userId: req.userId,
          },
        });
      }
    });

    await createNotifications(notifications);

    res.status(201).json(populatedTask.comments[populatedTask.comments.length - 1]);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error!" });
  }
};

export const getTaskComments = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await populateTask(Task.findById(id));
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!canManageTask(task, req.userId, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized! You don't have access to this task." });
    }

    res.status(200).json(task.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error!" });
  }
};
