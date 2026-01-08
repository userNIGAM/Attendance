import { useState, useEffect } from "react";
import Scanner from "./Scanner";
import StudentList from "./StudentList";
import ActionsPanel from "./ActionsPanel";
import AddStudentModal from "./AddStudentModal";
import { getStudents } from "../context/api";
import FileUploadScanner from "./FileUploadScanner";

export default function AttendanceSystem() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Scanner Section */}
          <div className="flex-1">
            <Scanner fetchStudents={fetchStudents} />
          </div>

          {/* Student List Section */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <StudentList
              students={students}
              search={search}
              setSearch={setSearch}
            />
            <FileUploadScanner fetchStudents={fetchStudents} />
          </div>
        </div>

        {/* Actions Panel */}
        <ActionsPanel
          setShowAddModal={setShowAddModal}
          fetchStudents={fetchStudents}
          loading={loading}
          setLoading={setLoading}
        />

        {/* Add Student Modal */}
        {showAddModal && (
          <AddStudentModal
            setShowAddModal={setShowAddModal}
            fetchStudents={fetchStudents}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
}
