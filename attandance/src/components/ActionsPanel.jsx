import {
  exportAttendanceApi,
  exportAndResetApi,
  resetAttendanceApi,
} from "../context/api";

export default function ActionsPanel({
  setShowAddModal,
  fetchStudents,
  loading,
  setLoading,
}) {
  const handleExportAttendance = async () => {
    try {
      const res = await exportAttendanceApi();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error exporting attendance");
      console.error(err);
    }
  };

  const handleExportAndReset = async () => {
    setLoading(true);
    try {
      const res = await exportAndResetApi();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await fetchStudents();
    } catch (err) {
      alert("Error exporting & resetting attendance");
      console.error(err);
    }
    setLoading(false);
  };

  const handleResetAttendance = async () => {
    if (!window.confirm("Are you sure you want to reset all attendance?"))
      return;
    setLoading(true);
    try {
      await resetAttendanceApi();
      await fetchStudents();
    } catch (err) {
      alert("Error resetting attendance");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-8">
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
      >
        ➕ Add Student
      </button>
      <button
        onClick={handleExportAttendance}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
      >
        📤 Export Attendance
      </button>
      <button
        onClick={handleExportAndReset}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
        disabled={loading}
      >
        {loading ? "Processing..." : "🧹 Export & Reset"}
      </button>
      <button
        onClick={handleResetAttendance}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
        disabled={loading}
      >
        {loading ? "Processing..." : "🔄 Reset Attendance"}
      </button>
    </div>
  );
}
