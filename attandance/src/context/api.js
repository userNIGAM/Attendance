import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API functions
export const getStudents = async () => {
  return api.get("/students");
};

export const markAttendance = async (payload) => {
  return api.post("/scan", payload);
};

export const addStudent = async (studentData) => {
  return api.post("/add-student", studentData);
};

export const resetAttendanceApi = async () => {
  return api.post("/reset");
};

export const exportAttendanceApi = async () => {
  return api.get("/export", { responseType: "blob" });
};

export const exportAndResetApi = async () => {
  return api.get("/export-reset", { responseType: "blob" });
};

export default api;
