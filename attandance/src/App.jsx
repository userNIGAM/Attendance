import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

export default function App() {
  const [result, setResult] = useState("");
  const [scanned, setScanned] = useState(false);

  const startScanner = () => {
    setScanned(false);
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(
      async (decodedText) => {
        setResult(decodedText);
        scanner.clear();
        setScanned(true);
        try {
          const res = await axios.post("http://localhost:5000/api/scan", {
            email: decodedText,
          });
          alert(res.data.message);
        } catch (err) {
          alert("Error marking attendance");
        }
      },
      (err) => console.warn(err)
    );
  };

  const exportAttendance = async () => {
    const res = await axios.get("http://localhost:5000/api/export", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance.xlsx");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 flex flex-col items-center justify-center text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-semibold mb-4">
          📸 QR Attendance Scanner
        </h1>
        <p className="text-lg mb-6">Scan QR codes to mark attendance</p>
        <div
          id="reader"
          className="mx-auto mb-4"
          style={{ width: "300px" }}
        ></div>
        {!scanned && (
          <button
            onClick={startScanner}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            Start Scanner
          </button>
        )}
        <p className="mt-4">Scanned Email: {result}</p>
        {scanned && (
          <button
            onClick={exportAttendance}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            📤 Export Attendance
          </button>
        )}
      </div>
    </div>
  );
}
