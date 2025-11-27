import express from "express";
import {
  scan,
  getStudents,
  addStudent,
  resetAttendance,
  exportAttendance,
  exportAndReset,
} from "../controllers/studentController.js";

const router = express.Router();

router.post("/scan", scan); // frontend uses this
router.get("/students", getStudents); // frontend uses this
router.post("/add-student", addStudent); // frontend modal
router.post("/reset", resetAttendance); // manual reset
router.get("/export", exportAttendance); // manual export (does not clear)
router.get("/export-reset", exportAndReset); // export & clear

export default router;
