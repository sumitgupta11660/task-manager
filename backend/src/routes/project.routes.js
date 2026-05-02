import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isProjectMember, isProjectAdmin } from "../middlewares/projectRole.middleware.js";
import {
  createProject,
  getMyProjects,
  getProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} from "../controllers/project.controller.js";
import {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  getDashboard,
} from "../controllers/task.controller.js";

const router = Router();

// All routes require auth
router.use(verifyJWT);

// Project CRUD
router.post("/", createProject);
router.get("/", getMyProjects);
router.get("/:projectId", isProjectMember, getProject);
router.delete("/:projectId", isProjectAdmin, deleteProject);

// Member management
router.post("/:projectId/members", isProjectAdmin, addMember);
router.delete("/:projectId/members/:userId", isProjectAdmin, removeMember);
router.patch("/:projectId/members/:userId/role", isProjectAdmin, updateMemberRole);

// Dashboard
router.get("/:projectId/dashboard", isProjectMember, getDashboard);

// Tasks
router.post("/:projectId/tasks", isProjectAdmin, createTask);
router.get("/:projectId/tasks", isProjectMember, getProjectTasks);
router.get("/:projectId/tasks/:taskId", isProjectMember, getTask);
router.patch("/:projectId/tasks/:taskId", isProjectMember, updateTask);
router.delete("/:projectId/tasks/:taskId", isProjectAdmin, deleteTask);

export default router;
