import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth-routes.js";
import userRoutes from "./routes/user-routes.js";
import scoreRoutes from "./routes/score-routes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

app.use("/user", userRoutes);

app.use("/score", scoreRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to my app!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
