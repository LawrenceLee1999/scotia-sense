import express from "express";
import {
  getAllTeamAdmins,
  getAllUsers,
  createTeam,
  updateTeam,
  deleteTeam,
  toggleAdminStatus,
} from "../controllers/admin-controller.js";
import {
  authenticate,
  requireSuperAdmin,
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
  toggleAdminStatus
);

export default router;
