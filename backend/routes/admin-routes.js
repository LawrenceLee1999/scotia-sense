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
  teamAdminToggleAdminStatus,
} from "../controllers/admin-controller.js";
import {
  authenticate,
  requireSuperAdmin,
  requireTeamAdmin,
  requireAnyAdmin,
} from "../middlewares/authenticate.js";

const router = express.Router();

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
  requireAnyAdmin,
  updateUserRole
);

router.put(
  "/users/:userId/remove-from-team",
  authenticate,
  requireAnyAdmin,
  removeUserFromTeam
);

router.put(
  "/users/:id/toggle-admin",
  authenticate,
  requireTeamAdmin,
  teamAdminToggleAdminStatus
);

export default router;
