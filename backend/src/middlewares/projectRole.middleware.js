import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Attach project + role to req — used by both guards below
const resolveProject = async (req) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const member = project.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!member) throw new ApiError(403, "You are not a member of this project");

  return { project, role: member.role };
};

// Any project member (admin or member)
export const isProjectMember = asyncHandler(async (req, res, next) => {
  const { project, role } = await resolveProject(req);
  req.project = project;
  req.projectRole = role;
  next();
});

// Only project admin
export const isProjectAdmin = asyncHandler(async (req, res, next) => {
  const { project, role } = await resolveProject(req);
  if (role !== "admin") {
    throw new ApiError(403, "Only project admins can perform this action");
  }
  req.project = project;
  req.projectRole = role;
  next();
});
