
const express = require("express");
const router = express.Router();
const db = require("./dblocal");

// Check existing database tables
router.get("/tables", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error checking tables:", error);
    res.status(500).json({
      message: "Could not retrieve database tables."
    });
  }
});

// Admin: View attendance for a selected date
router.get("/admin", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Please provide a valid date in YYYY-MM-DD format."
      });
    }

    const result = await db.query(
      `
      SELECT
        u.user_id,
        u.name,
        u.email,
        a.attendance_id,
        TO_CHAR(a.attendance_date, 'YYYY-MM-DD') AS attendance_date,
        a.check_in_time,
        a.status
      FROM public.users u
      LEFT JOIN public.attendance a
        ON a.student_id = u.user_id
        AND a.attendance_date = $1::date
      WHERE LOWER(u.role) = 'student'
      ORDER BY u.name;
      `,
      [date]
    );

    res.json({
      date,
      records: result.rows
    });
  } catch (error) {
    console.error("Error fetching admin attendance:", error);
    res.status(500).json({
      message: "Could not retrieve attendance records."
    });
  }
});

 // Admin: Create or update a student's attendance status
router.put("/admin/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { date, status } = req.body;

    // Validate student ID
    if (!/^\d+$/.test(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID.",
      });
    }

    // Validate date format
    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        message: "Date must use YYYY-MM-DD format.",
      });
    }

    // Validate attendance status
    const allowedStatuses = ["present", "absent", "late"];

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status.toLowerCase())
    ) {
      return res.status(400).json({
        message: "Status must be Present, Absent, or Late.",
      });
    }

    const result = await db.query(
      `INSERT INTO public.attendance
         (student_id, attendance_date, status, check_in_time)
       SELECT user_id, $2::date, $3, NULL
       FROM public.users
       WHERE user_id = $1
         AND LOWER(role) = 'student'
       ON CONFLICT (student_id, attendance_date)
       DO UPDATE SET status = EXCLUDED.status
       RETURNING attendance_id, student_id,
                 TO_CHAR(attendance_date, 'YYYY-MM-DD') AS attendance_date,
                 check_in_time, status`,
      [Number(studentId), date, status.toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.json({
      message: "Attendance status saved successfully.",
      record: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving admin attendance:", error);

    res.status(500).json({
      message: "Could not save attendance status.",
    });
  }
});

module.exports = router;
