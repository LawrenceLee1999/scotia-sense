import express from "express";
import { register, login, getIdAndName} from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/clinicians-coaches", getIdAndName)

export default router;
