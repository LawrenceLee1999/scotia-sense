import express from "express";
import {
  register,
  login,
  getIdAndName,
  checkAuth,
  logout,
} from "../controllers/auth-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/check", authenticate, checkAuth);

router.get("/clinicians-coaches", getIdAndName);

export default router;
