import express from "express";
import {
  getTask,
  getAllTask,
  updateTask,
  deleteTask,
  addTask,
  toggleTaskStatus,
  assignTask,
  addComment,
  getTaskComments,
} from "../controllers/task.controllers.js";
import { authCheck } from "../middleware/authCheck.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  validateCommentPayload,
  validateTaskAssignment,
  validateTaskListQuery,
  validateTaskPayload,
} from "../validators/task.validators.js";

const taskRouter = express.Router();

taskRouter.use(authCheck);

taskRouter.post("/", validateRequest(validateTaskPayload), addTask);
taskRouter.get("/", validateRequest(validateTaskListQuery), getAllTask);
taskRouter.get("/:id", getTask);
taskRouter.put("/:id", validateRequest(validateTaskPayload), updateTask);
taskRouter.patch("/:id/status", validateRequest(validateTaskPayload), toggleTaskStatus);
taskRouter.patch("/:id/assign", validateRequest(validateTaskAssignment), assignTask);
taskRouter.delete("/:id", deleteTask);
taskRouter.post("/:id/comments", validateRequest(validateCommentPayload), addComment);
taskRouter.get("/:id/comments", getTaskComments);

export default taskRouter;
