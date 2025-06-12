import express from "express";
import {
  getAllTeamAdmins,
  getAllUsers,
} from "../controllers/admin-controller.js";
import {
  authenticate,
  requireSuperAdmin,
} from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/teams", authenticate, requireSuperAdmin, getAllTeamAdmins);
router.get("/users", authenticate, requireSuperAdmin, getAllUsers);

export default router;
