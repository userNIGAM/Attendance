import { useState } from "react";
import { addStudent } from "../context/api";

export default function AddStudentModal({
  setShowAddModal,
  fetchStudents,
  setLoading,
}) {
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    semester: "",
    rollno: "",
  });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addStudent(addForm);
      setShowAddModal(false);
      setAddForm({ name: "", email: "", semester: "", rollno: "" });
      await fetchStudents();
    } catch (err) {
      alert(
        "Error adding student: " + (err.response?.data?.message || err.message)
      );
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-xl p-8 w-96 max-w-full mx-4 text-black flex flex-col gap-4 shadow-2xl"
        onSubmit={handleAddStudent}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Student</h2>
        <input
          type="text"
          placeholder="Full Name"
          className="p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          value={addForm.name}
          onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          className="p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          value={addForm.email}
          onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Semester"
          className="p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          value={addForm.semester}
          onChange={(e) => setAddForm({ ...addForm, semester: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Roll Number"
          className="p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          value={addForm.rollno}
          onChange={(e) => setAddForm({ ...addForm, rollno: e.target.value })}
          required
        />
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex-1 transition-colors"
          >
            Add Student
          </button>
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex-1 transition-colors"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
