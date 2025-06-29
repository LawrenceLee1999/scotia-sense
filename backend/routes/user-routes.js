import express from "express";
import {
  updateUserData,
  getUserProfile,
  changePassword,
} from "../controllers/user-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.put("/update-user-data", authenticate, updateUserData);

router.put("/change-password", authenticate, changePassword);

router.get("/profile", authenticate, getUserProfile);

export default router;
