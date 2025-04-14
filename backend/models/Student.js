import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  semester: String,
  present: { type: Boolean, default: false },
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
