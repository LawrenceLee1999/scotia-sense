import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth-routes.js";
import userRoutes from "./routes/user-routes.js";
import scoreRoutes from "./routes/score-routes.js";
import recoveryRoutes from "./routes/recovery-stage-routes.js";
import coachRoutes from "./routes/coach-routes.js";
import dataRoutes from "./routes/dummy-data-routes.js";

const app = express();
const port = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const allowedOrigins =
  NODE_ENV === "production"
    ? "https://scotia-sense-frontend.onrender.com"
    : "http://localhost:5173";

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/score", scoreRoutes);
app.use("/recovery", recoveryRoutes);
app.use("/data", dataRoutes);
app.use("/coach", coachRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
