import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, index: true },
    semester: { type: String },
    faculty: { type: String },
    rollno: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
