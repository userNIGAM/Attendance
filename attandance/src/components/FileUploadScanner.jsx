import { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { markAttendance } from "../context/api";

export default function FileUploadScanner({ fetchStudents }) {
  const [uploadStatus, setUploadStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const processScannedCode = async (decodedText) => {
    console.log("File Upload - Raw QR Data:", decodedText); // For debugging

    let payload;
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(decodedText);

      // Check if it has the expected structure
      if (jsonData.email) {
        payload = {
          name: jsonData.name || "",
          email: jsonData.email,
          semester: jsonData.semester || "",
          faculty: jsonData.faculty || "",
          rollno: jsonData.rollno || "",
        };
        setUploadStatus("✅ JSON data processed from file");
      } else {
        payload = { email: decodedText };
        setUploadStatus("⚠️ Using raw data as email");
      }
    } catch (err) {
      payload = { email: decodedText };
      setUploadStatus("⚠️ Using raw data as email");
    }

    try {
      await markAttendance(payload);
      await fetchStudents();
      setUploadStatus("✅ Attendance marked successfully!");
    } catch (err) {
      console.error("Error marking attendance:", err);
      setUploadStatus("❌ Error marking attendance");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadStatus("🔄 Processing image...");

    if (!file.type.match("image.*")) {
      setUploadStatus("❌ Please upload an image file");
      setIsProcessing(false);
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode("file-upload-result");
      const decodedText = await html5QrCode.scanFile(file, true);
      await processScannedCode(decodedText);
    } catch (error) {
      console.error("Error decoding QR from file:", error);
      setUploadStatus("❌ No QR code found in image");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadStatus(""), 3000);
      event.target.value = "";
    }
  };

  return (
    <div className="text-center p-6 bg-blue-600 bg-opacity-10 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">📁 Upload QR Code</h3>

      {uploadStatus && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            uploadStatus.includes("✅")
              ? "bg-green-600 bg-opacity-50"
              : uploadStatus.includes("❌")
              ? "bg-red-600 bg-opacity-50"
              : "bg-yellow-600 bg-opacity-50"
          }`}
        >
          <p className="text-white font-medium">{uploadStatus}</p>
        </div>
      )}

      <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer block mx-auto w-fit">
        {isProcessing ? "🔄 Processing..." : "📁 Choose QR Image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="hidden"
        />
      </label>

      <div id="file-upload-result" className="hidden"></div>

      <div className="mt-4 text-sm text-gray-200">
        <p>• Supports JSON data like: name, email, semester, faculty, rollno</p>
        <p>• Also works with plain email QR codes</p>
      </div>
    </div>
  );
}
