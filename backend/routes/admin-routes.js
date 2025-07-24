import express from "express";
import {
  getAllTeamAdmins,
  getAllUsers,
  createTeam,
  updateTeam,
  deleteTeam,
  updateUserRole,
  removeUserFromTeam,
  superadminToggleAdminStatus,
  reassignTeamAdmin,
} from "../controllers/admin-controller.js";
import {
  authenticate,
  requireSuperAdmin,
  requireTeamAdmin,
} from "../middlewares/authenticate.js";

const router = express.Router();

router.put(
  "/teams/reassign-admin",
  authenticate,
  requireTeamAdmin,
  reassignTeamAdmin
);
router.get("/teams", authenticate, requireSuperAdmin, getAllTeamAdmins);
router.post("/teams", authenticate, requireSuperAdmin, createTeam);
router.put("/teams/:id", authenticate, requireSuperAdmin, updateTeam);
router.delete("/teams/:id", authenticate, requireSuperAdmin, deleteTeam);

router.get("/users", authenticate, requireSuperAdmin, getAllUsers);

router.put(
  "/users/:id/admin-status",
  authenticate,
  requireSuperAdmin,
  superadminToggleAdminStatus
);

router.put(
  "/users/:userId/role",
  authenticate,
  requireTeamAdmin,
  updateUserRole
);

router.put(
  "/users/:userId/remove-from-team",
  authenticate,
  requireTeamAdmin,
  removeUserFromTeam
);

export default router;
