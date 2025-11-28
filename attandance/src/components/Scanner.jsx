import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { markAttendance } from "../context/api";

export default function Scanner({ fetchStudents }) {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanStatus, setLastScanStatus] = useState("");
  const [recentScans, setRecentScans] = useState(new Set()); // Track recent scans
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple processing

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.log("Scanner clear error:", error);
      });
    }

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 5, // Reduced FPS to minimize multiple scans
        qrbox: 250,
        aspectRatio: 1.0,
        disableFlip: true, // Improve performance
      },
      false
    );

    scannerRef.current = scanner;
    setIsScanning(true);
    setLastScanStatus("");

    scanner.render(
      async (decodedText) => {
        await processScannedCode(decodedText);
      },
      (error) => {
        // Silent error handling for common expected errors
        if (error !== "NotFoundException") {
          console.log("Scanner error:", error);
        }
      }
    );
  };

  const processScannedCode = async (decodedText) => {
    // Prevent multiple processing simultaneously
    if (isProcessing) {
      return;
    }

    // Check if this QR was recently scanned (within last 10 seconds)
    if (recentScans.has(decodedText)) {
      setLastScanStatus("⚠️ This QR code was already scanned recently!");

      // Clear status after 3 seconds
      setTimeout(() => setLastScanStatus(""), 3000);
      return;
    }

    setIsProcessing(true);
    setScanCount((prev) => prev + 1);
    console.log("Raw QR Code Data:", decodedText);

    // Add to recent scans to prevent duplicates
    setRecentScans((prev) => {
      const newSet = new Set(prev);
      newSet.add(decodedText);
      return newSet;
    });

    // Remove from recent scans after 10 seconds
    setTimeout(() => {
      setRecentScans((prev) => {
        const newSet = new Set(prev);
        newSet.delete(decodedText);
        return newSet;
      });
    }, 10000);

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
        setLastScanStatus("✅ Attendance marked successfully!");
      } else {
        // If JSON but no email, use the raw string as email
        payload = { email: decodedText };
        setLastScanStatus("✅ Attendance marked successfully!");
      }
    } catch (err) {
      // If not JSON, use the raw text as email
      payload = { email: decodedText };
      setLastScanStatus("✅ Attendance marked successfully!");
    }

    try {
      await markAttendance(payload);
      await fetchStudents();

      // Temporarily pause scanner to prevent immediate re-scan
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500); // 1.5 second pause between scans

      // Clear success status after 2 seconds
      setTimeout(() => setLastScanStatus(""), 2000);
    } catch (err) {
      console.error("Error marking attendance:", err);
      setLastScanStatus("❌ Error marking attendance");

      // Remove from recent scans on error so it can be retried
      setRecentScans((prev) => {
        const newSet = new Set(prev);
        newSet.delete(decodedText);
        return newSet;
      });

      setIsProcessing(false);
      setTimeout(() => setLastScanStatus(""), 3000);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
        setLastScanStatus("");
        setIsProcessing(false);
      } catch (error) {
        console.log("Scanner stop error:", error);
      }
    }
  };

  const clearRecentScans = () => {
    setRecentScans(new Set());
    setLastScanStatus("✅ Recent scans cleared!");
    setTimeout(() => setLastScanStatus(""), 2000);
  };

  return (
    <div className="text-center py-8 bg-blue-700 bg-opacity-10 rounded-lg shadow-xl">
      <h1 className="text-4xl font-bold mb-4">🎯 QR Attendance System</h1>
      <p className="text-lg mb-6 text-gray-300">Scan QR codes automatically</p>

      {/* Scanner Container */}
      <div
        id="reader"
        className="mx-auto mb-6 bg-transparent rounded-lg overflow-hidden shadow-2xl"
        style={{ width: "100%", maxWidth: "400px", height: "300px" }}
      ></div>

      {/* Scan Status */}
      {lastScanStatus && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            lastScanStatus.includes("✅")
              ? "bg-green-600 bg-opacity-50"
              : lastScanStatus.includes("❌")
              ? "bg-red-600 bg-opacity-50"
              : lastScanStatus.includes("⚠️")
              ? "bg-yellow-600 bg-opacity-50"
              : "bg-blue-600 bg-opacity-50"
          }`}
        >
          <p className="text-white font-medium">{lastScanStatus}</p>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex justify-center items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isScanning ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm">
            {isScanning ? "Scanning..." : "Stopped"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm">Scans: {scanCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-sm">Recent: {recentScans.size}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        {!isScanning ? (
          <button
            onClick={startScanner}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            ▶ Start Scanner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            ⏹ Stop Scanner
          </button>
        )}

        <button
          onClick={clearRecentScans}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
          disabled={recentScans.size === 0}
        >
          🗑️ Clear Recent
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-400">
        <p>• Each QR code can only be scanned once every 10 seconds</p>
        <p>• Scanner automatically pauses briefly after each scan</p>
        <p>• Use "Clear Recent" to reset duplicate protection</p>
      </div>
    </div>
  );
}
