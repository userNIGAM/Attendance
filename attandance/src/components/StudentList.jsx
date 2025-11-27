export default function StudentList({ students, search, setSearch }) {
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollno || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.semester || "").toLowerCase().includes(search.toLowerCase())
  );

  const presentStudents = filteredStudents.filter((s) => s.present);
  const absentStudents = filteredStudents.filter((s) => !s.present);

  // Function to format time in AM/PM format
  const formatScanTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Function to get today's date in a nice format
  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-blue-700 bg-opacity-10 rounded-xl p-6 flex flex-col text-left text-white shadow-xl backdrop-blur-sm h-full">
      {/* Header with Date */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold"> Attendance List</h2>
        <p className="text-sm text-gray-300 mt-1">{getCurrentDate()}</p>
      </div>

      <input
        type="text"
        placeholder="🔍 Search students..."
        className="mb-4 p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-600 bg-opacity-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{presentStudents.length}</div>
          <div className="text-sm">Present</div>
        </div>
        <div className="bg-red-600 bg-opacity-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{absentStudents.length}</div>
          <div className="text-sm">Absent</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-green-300 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Present Students ({presentStudents.length})
        </h3>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {presentStudents.length === 0 && (
            <li className="text-gray-400 text-center py-4">
              No students present
            </li>
          )}
          {presentStudents.map((s) => (
            <li
              key={s._id}
              className="bg-green-600 bg-opacity-30 rounded-lg p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-lg">{s.name}</div>
                <div className="text-xs bg-green-500 bg-opacity-50 px-2 py-1 rounded-full">
                  {formatScanTime(s.scannedAt || s.updatedAt || s.createdAt)}
                </div>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {s.rollno} • Sem {s.semester}
              </div>
              <div className="text-xs text-gray-300 truncate">{s.email}</div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-red-300 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Absent Students ({absentStudents.length})
        </h3>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {absentStudents.length === 0 && (
            <li className="text-gray-400 text-center py-4">
              All students present!
            </li>
          )}
          {absentStudents.map((s) => (
            <li key={s._id} className="bg-red-600 bg-opacity-30 rounded-lg p-3">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-gray-300 mt-1">
                {s.rollno} • Sem {s.semester}
              </div>
              <div className="text-xs text-gray-300 truncate">{s.email}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
