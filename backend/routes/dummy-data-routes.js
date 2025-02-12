import express from "express";
import { insertDummyData } from "../controllers/dummy-data-controller.js";

const router = express.Router();

router.post("/insert-dummy-data", insertDummyData);

export default router;
