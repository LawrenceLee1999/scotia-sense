import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth-routes.js";
import userRoutes from "./routes/user-routes.js";
import scoreRoutes from "./routes/score-routes.js";
import dummyRoutes from "./routes/dummy-data-routes.js";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const allowedOrigins =
  NODE_ENV === "production"
    ? "https://scotia-sense-frontend.onrender.com"
    : "http://localhost:5173";

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders:
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

app.use("/user", userRoutes);

app.use("/score", scoreRoutes);

app.use("/data", dummyRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to my app!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
