import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, index: true },
    semester: String,
    faculty: String,
    rollno: String,
    scannedAt: { type: Date, default: Date.now },
    program: { type: String }, // optional: which program/day scanned for
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
