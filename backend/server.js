import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import xlsx from "xlsx";
import Student from "./models/Student.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/attendanceDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// 📥 Route to add student after scanning QR
app.post("/api/scan", async (req, res) => {
  const { email } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });
    student.present = true;
    await student.save();
    res.status(200).json({ message: "Attendance marked", student });
  } catch (error) {
    res.status(500).json({ error });
  }
});
// 📤 Route to export present students to Excel
app.get("/api/export", async (req, res) => {
  try {
    const students = await Student.find({ present: true });
    const data = students.map((s) => ({
      Name: s.name,
      Email: s.email,
      Semester: s.semester,
    }));
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Attendance");
    const filePath = "./attendance.xlsx";
    xlsx.writeFile(wb, filePath);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
