import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const QRCodeGenerator = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    semester: "",
    faculty: "",
    rollno: "",
  });

  const [qrValue, setQrValue] = useState("");
  const qrRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateQR = () => {
    // Check if all fields are filled
    const allFieldsFilled = Object.values(formData).every(
      (field) => field.trim() !== ""
    );

    if (!allFieldsFilled) {
      alert("Please fill all fields before generating QR code");
      return;
    }

    const jsonData = JSON.stringify(formData, null, 2);
    setQrValue(jsonData);
  };

  const handleDownload = () => {
    if (!qrValue) return;

    const svgElement = qrRef.current.querySelector("svg");
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "student-qrcode.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div>
      <h2>Student QR Code Generator</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          style={{ padding: "8px", width: "200px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          style={{ padding: "8px", width: "200px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          name="semester"
          placeholder="Semester"
          value={formData.semester}
          onChange={handleInputChange}
          style={{ padding: "8px", width: "200px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          name="faculty"
          placeholder="Faculty"
          value={formData.faculty}
          onChange={handleInputChange}
          style={{ padding: "8px", width: "200px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          name="rollno"
          placeholder="Roll No"
          value={formData.rollno}
          onChange={handleInputChange}
          style={{ padding: "8px", width: "200px" }}
        />
      </div>

      <button
        onClick={handleGenerateQR}
        style={{ padding: "10px 20px", marginBottom: "20px" }}
      >
        Generate QR Code
      </button>

      {qrValue && (
        <div ref={qrRef} style={{ textAlign: "center" }}>
          <QRCodeSVG
            value={qrValue}
            size={256}
            level="H"
            includeMargin={true}
          />
          <br />
          <button
            onClick={handleDownload}
            style={{ padding: "10px 20px", margin: "20px 0" }}
          >
            Download QR Code
          </button>

          <div style={{ marginTop: "20px" }}>
            <h3>QR Code contains this data:</h3>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "5px",
                textAlign: "left",
                display: "inline-block",
              }}
            >
              {qrValue}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
