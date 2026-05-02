import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /projects/:projectId/tasks  [admin only]
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, dueDate, priority } = req.body;
  if (!title) throw new ApiError(400, "Task title is required");

  const task = await Task.create({
    title,
    description,
    assignedTo: assignedTo || null,
    dueDate: dueDate || null,
    priority: priority || "medium",
    project: req.params.projectId,
    createdBy: req.user._id,
  });

  const populated = await Task.findById(task._id)
    .populate("assignedTo", "username email")
    .populate("createdBy", "username email");

  return res.status(201).json(new ApiResponse(201, populated, "Task created successfully"));
});

// GET /projects/:projectId/tasks  [any member]
export const getProjectTasks = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo } = req.query;
  const filter = { project: req.params.projectId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  const tasks = await Task.find(filter)
    .populate("assignedTo", "username email")
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
});

// GET /projects/:projectId/tasks/:taskId  [any member]
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.taskId,
    project: req.params.projectId,
  })
    .populate("assignedTo", "username email")
    .populate("createdBy", "username email");

  if (!task) throw new ApiError(404, "Task not found");

  return res.status(200).json(new ApiResponse(200, task, "Task fetched"));
});

// PATCH /projects/:projectId/tasks/:taskId  [member: status only | admin: all]
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.taskId,
    project: req.params.projectId,
  });
  if (!task) throw new ApiError(404, "Task not found");

  if (req.projectRole === "member") {
    // Members can only update status
    if (req.body.status) task.status = req.body.status;
  } else {
    // Admins can update everything
    const { title, description, assignedTo, dueDate, priority, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
  }

  await task.save();

  const updated = await Task.findById(task._id)
    .populate("assignedTo", "username email")
    .populate("createdBy", "username email");

  return res.status(200).json(new ApiResponse(200, updated, "Task updated successfully"));
});

// DELETE /projects/:projectId/tasks/:taskId  [admin only]
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.taskId,
    project: req.params.projectId,
  });
  if (!task) throw new ApiError(404, "Task not found");

  return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

// GET /projects/:projectId/dashboard  [any member]
export const getDashboard = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const now = new Date();

  const [total, todo, inProgress, completed, overdue] = await Promise.all([
    Task.countDocuments({ project: projectId }),
    Task.countDocuments({ project: projectId, status: "todo" }),
    Task.countDocuments({ project: projectId, status: "in_progress" }),
    Task.countDocuments({ project: projectId, status: "completed" }),
    Task.countDocuments({
      project: projectId,
      status: { $ne: "completed" },
      dueDate: { $lt: now, $ne: null },
    }),
  ]);

  // Recent tasks
  const recentTasks = await Task.find({ project: projectId })
    .populate("assignedTo", "username email")
    .sort({ updatedAt: -1 })
    .limit(5);

  return res.status(200).json(
    new ApiResponse(200, { total, todo, inProgress, completed, overdue, recentTasks }, "Dashboard data fetched")
  );
});
