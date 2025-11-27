import cron from "node-cron";
import Attendance from "../models/Attendance.js";
import { exportToExcel } from "../utils/exporter.js";
import fs from "fs";
import path from "path";

/**
 * scheduleExpression: string cron expression (e.g. "0 23 * * *" daily at 23:00 UTC)
 */
export const startScheduler = (scheduleExpression = "0 23 * * *") => {
  console.log("Starting scheduler with cron:", scheduleExpression);

  // run according to schedule
  cron.schedule(
    scheduleExpression,
    async () => {
      try {
        console.log("[scheduler] Running daily export & clear job...");

        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date();
        dayEnd.setHours(23, 59, 59, 999);

        const attendances = await Attendance.find({
          scannedAt: { $gte: dayStart, $lte: dayEnd },
        }).lean();

        const data = attendances.map((a) => ({
          Name: a.name || "",
          Email: a.email,
          RollNo: a.rollno || "",
          Semester: a.semester || "",
          Faculty: a.faculty || "",
          ScannedAt: a.scannedAt ? new Date(a.scannedAt).toLocaleString() : "",
        }));

        // file will be created in /tmp or project folder
        const filename = `attendance-${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;
        const { filePath } = exportToExcel(data, filename, "./tmp");

        console.log(
          `[scheduler] Exported file: ${filePath} (contains ${data.length} rows)`
        );

        // clear attendance
        await Attendance.deleteMany({});
        console.log("[scheduler] Attendance collection cleared.");

        // Optionally remove file after some time (we leave it for admin to download if needed)
        // If you want to keep it temporarily, do nothing. If not, uncomment:
        // fs.unlinkSync(filePath);
      } catch (err) {
        console.error("[scheduler] Error exporting attendance:", err);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
};
