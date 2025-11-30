import React from "react";
import AttendanceSystem from "./components/AttendanceSystem";
import QRCodeGenerator from "./components/qrcode/QRCodeGenerator";

const App = () => {
  return (
    <>
      <AttendanceSystem />
      <QRCodeGenerator />
    </>
  );
};

export default App;
