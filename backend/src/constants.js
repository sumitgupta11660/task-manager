export const DB_NAME = process.env.DB_NAME || "task_manager";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

export const PROJECT_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
};

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};
