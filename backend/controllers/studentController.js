import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import { exportToExcel } from "../utils/exporter.js";
import fs from "fs";
import path from "path";

/**
 * POST /api/scan
 * Accepts either:
 *  - { email }  // frontend currently sends email only
 *  - OR a full object: { name, email, semester, rollno, faculty }
 */
export const scan = async (req, res) => {
  try {
    const payload = req.body || {};
    const email = (payload.email || "").toString().trim().toLowerCase();
    const fallbackName = payload.name || "";

    if (!email) {
      return res.status(400).json({ message: "Email (from QR) is required." });
    }

    // Try to find full student info in Student registry
    const registered = await Student.findOne({ email });

    // Build attendance record using payload first, fallback to registry
    const record = {
      email,
      name: payload.name || registered?.name || fallbackName || "",
      semester: payload.semester || registered?.semester || "",
      faculty: payload.faculty || registered?.faculty || "",
      rollno: payload.rollno || registered?.rollno || "",
      scannedAt: new Date(),
    };

    // Optional: prevent duplicates within same day (if you want)
    // For now allow repeated scans but update scannedAt if exists
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);

    // If an attendance record exists for this email today, update scannedAt & other info
    const existing = await Attendance.findOne({
      email,
      scannedAt: { $gte: dayStart, $lte: dayEnd },
    });

    let saved;
    if (existing) {
      existing.name = record.name;
      existing.semester = record.semester;
      existing.faculty = record.faculty;
      existing.rollno = record.rollno;
      existing.scannedAt = new Date();
      saved = await existing.save();
    } else {
      const att = new Attendance(record);
      saved = await att.save();
    }

    return res
      .status(200)
      .json({ message: "Scanned & recorded", student: saved });
  } catch (err) {
    console.error("Scan error", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    // Return both registry and today's attendance optionally.
    // For compatibility with your frontend which expects Student.find({}) to show present flags,
    // we will return an array of students based on registry with a `present` flag.
    const registry = await Student.find({}).lean();

    // get today's attendance
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);

    const attendances = await Attendance.find({
      scannedAt: { $gte: dayStart, $lte: dayEnd },
    }).lean();

    // map by email
    const presentMap = {};
    attendances.forEach((a) => {
      presentMap[a.email] = a;
    });

    // If registry exists, merge; else if empty registry return attendance entries
    const merged =
      registry.length > 0
        ? registry.map((s) => ({
            ...s,
            present: !!presentMap[s.email],
            scannedAt: presentMap[s.email]?.scannedAt || null,
          }))
        : attendances.map((a) => ({
            name: a.name,
            email: a.email,
            semester: a.semester,
            rollno: a.rollno,
            faculty: a.faculty,
            present: true,
            scannedAt: a.scannedAt,
          }));

    return res.status(200).json(merged);
  } catch (err) {
    console.error("getStudents error", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    const { name, email, semester, rollno, faculty } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Upsert: If already exists update, else create
    const student = await Student.findOneAndUpdate(
      { email },
      { name, email, semester, rollno, faculty },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ message: "Student added/updated", student });
  } catch (err) {
    console.error("addStudent error", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const resetAttendance = async (req, res) => {
  try {
    await Attendance.deleteMany({});
    return res.status(200).json({ message: "Attendance reset" });
  } catch (err) {
    console.error("resetAttendance error", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * Manual export endpoint: GET /api/export
 * Returns Excel for current day only.
 */
export const exportAttendance = async (req, res) => {
  try {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);

    const attendances = await Attendance.find({
      scannedAt: { $gte: dayStart, $lte: dayEnd },
    }).lean();

    const data = attendances.map((a) => ({
      Name: a.name || "",
      Email: a.email,
      RollNo: a.rollno || "",
      Semester: a.semester || "",
      Faculty: a.faculty || "",
      ScannedAt: a.scannedAt ? new Date(a.scannedAt).toLocaleString() : "",
    }));

    const { filePath, buffer } = exportToExcel(
      data,
      `attendance-${new Date().toISOString().slice(0, 10)}.xlsx`,
      "./"
    );

    // send as download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.basename(filePath)}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);

    // NOTE: do not delete attendance here (manual export does not clear)
    // Optionally delete the file after sending
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      /* ignore */
    }
  } catch (err) {
    console.error("exportAttendance error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Manual export & reset: GET /api/export-reset
 */
export const exportAndReset = async (req, res) => {
  try {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);

    const attendances = await Attendance.find({
      scannedAt: { $gte: dayStart, $lte: dayEnd },
    }).lean();

    const data = attendances.map((a) => ({
      Name: a.name || "",
      Email: a.email,
      RollNo: a.rollno || "",
      Semester: a.semester || "",
      Faculty: a.faculty || "",
      ScannedAt: a.scannedAt ? new Date(a.scannedAt).toLocaleString() : "",
    }));

    const { filePath, buffer } = exportToExcel(
      data,
      `attendance-${new Date().toISOString().slice(0, 10)}.xlsx`,
      "./"
    );

    // Delete attendance records
    await Attendance.deleteMany({});

    // send as download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.basename(filePath)}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);

    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      /* ignore */
    }
  } catch (err) {
    console.error("exportAndReset error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
