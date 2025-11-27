import xlsx from "xlsx";
import fs from "fs";
import path from "path";

/**
 * data: Array of objects
 * filename: optional filename (like 'attendance-2025-11-27.xlsx')
 * outputDir: optional (default: current working dir)
 * returns: { filePath, buffer }
 */
export const exportToExcel = (data, filename = null, outputDir = "./") => {
  if (!Array.isArray(data)) data = [];

  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Attendance");

  const date = new Date();
  const stamp =
    filename || `attendance-${date.toISOString().slice(0, 10)}.xlsx`;
  const filePath = path.join(outputDir, stamp);

  // write file
  xlsx.writeFile(wb, filePath);

  const buffer = fs.readFileSync(filePath);

  return { filePath, buffer };
};
