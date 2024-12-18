import express from "express";
import { updateUser, getUserProfile } from "../controllers/user-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.put("/update-user", authenticate, updateUser);

router.get("/me", getUserProfile);

export default router;
