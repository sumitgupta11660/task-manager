import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /projects
export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw new ApiError(400, "Project name is required");

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: "admin" }],
  });

  return res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
});

// GET /projects
export const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ "members.user": req.user._id })
    .populate("createdBy", "username email")
    .populate("members.user", "username email")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, projects, "Projects fetched"));
});

// GET /projects/:projectId
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId)
    .populate("createdBy", "username email")
    .populate("members.user", "username email");

  return res.status(200).json(new ApiResponse(200, project, "Project fetched"));
});

// DELETE /projects/:projectId
export const deleteProject = asyncHandler(async (req, res) => {
  await Project.findByIdAndDelete(req.params.projectId);
  return res.status(200).json(new ApiResponse(200, null, "Project deleted successfully"));
});

// POST /projects/:projectId/members
export const addMember = asyncHandler(async (req, res) => {
  const { email, role = "member" } = req.body;
  if (!email) throw new ApiError(400, "Member email is required");

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) throw new ApiError(404, "No user found with this email");

  const project = req.project;
  const alreadyMember = project.members.find(
    (m) => m.user.toString() === userToAdd._id.toString()
  );
  if (alreadyMember) throw new ApiError(409, "User is already a member of this project");

  project.members.push({ user: userToAdd._id, role });
  await project.save();

  const updated = await Project.findById(project._id).populate("members.user", "username email");
  return res.status(200).json(new ApiResponse(200, updated, "Member added successfully"));
});

// DELETE /projects/:projectId/members/:userId
export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const project = req.project;

  // Cannot remove yourself if you're the only admin
  const admins = project.members.filter((m) => m.role === "admin");
  const isRemovingAdmin = project.members.find(
    (m) => m.user.toString() === userId && m.role === "admin"
  );
  if (isRemovingAdmin && admins.length === 1) {
    throw new ApiError(400, "Cannot remove the only admin of a project");
  }

  project.members = project.members.filter((m) => m.user.toString() !== userId);
  await project.save();

  return res.status(200).json(new ApiResponse(200, project, "Member removed successfully"));
});

// PATCH /projects/:projectId/members/:userId/role
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["admin", "member"].includes(role)) {
    throw new ApiError(400, "Role must be 'admin' or 'member'");
  }

  const project = req.project;
  const member = project.members.find((m) => m.user.toString() === userId);
  if (!member) throw new ApiError(404, "Member not found in this project");

  member.role = role;
  await project.save();

  return res.status(200).json(new ApiResponse(200, project, "Member role updated"));
});
