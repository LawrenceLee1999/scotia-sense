import express from "express";
import pg from "pg";
import env from "dotenv";

env.config()
const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to my app!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
