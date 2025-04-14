import express from "express";
const router = express.Router();
const Student = require("../models/Student");
const XLSX = require("xlsx");
const fs = require("fs");

// Mark attendance
router.post("/mark", async (req, res) => {
  const { email } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.scanned = true;
    student.scannedAt = new Date();
    await student.save();

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/export", async (req, res) => {
  const students = await Student.find({ scanned: true });
  const data = students.map((s) => ({
    Name: s.name,
    Email: s.email,
    Semester: s.semester,
    ScannedAt: s.scannedAt.toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
  XLSX.writeFile(workbook, "attendance.xlsx");

  res.download("attendance.xlsx");
});

module.exports = router;
