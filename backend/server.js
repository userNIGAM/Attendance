import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { ConnectDB } from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import { startScheduler } from "./cron/scheduler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const AUTO_CRON = process.env.AUTO_EXPORT_CRON || "0 23 * * *"; // default daily at 23:00 UTC

const corsOptions = {
  origin: ["http://localhost:5173", "https://attendance-six-pi.vercel.app/"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ensure tmp dir exists for exports
const tmpDir = path.resolve("./tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

// connect db
ConnectDB();

// routes
app.use("/api", studentRoutes);

// health
app.get("/", (req, res) => res.send("Attendance backend up"));

// start scheduler
startScheduler(AUTO_CRON);

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
