import express from "express";
import { updateUser, getUserProfile } from "../controllers/user-controller.js";

const router = express.Router();

router.put("/update-user/:id", updateUser);

router.get("/me", getUserProfile);

export default router;
