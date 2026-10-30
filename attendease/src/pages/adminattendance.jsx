
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminAttendance() {
  const today = new Date().toLocaleDateString("en-CA");

  const [selectedDate, setSelectedDate] = useState(today);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [editedStatuses, setEditedStatuses] = useState({});

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

  // Load attendance records for the selected date
  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      setError("");
      setSaveMessage("");

      try {
        const response = await fetch(
          `${API_URL}/api/attendance/admin?date=${selectedDate}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load attendance records."
          );
        }

        setRecords(data.records || []);
        setEditedStatuses({});
      } catch (err) {
        setError(err.message || "Unable to connect to the backend.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }

    if (selectedDate) {
      fetchAttendance();
    }
  }, [selectedDate, API_URL]);

  // Save a student's attendance status
  async function saveAttendance(studentId, status) {
    if (!status) {
      setError("Please select an attendance status before saving.");
      return;
    }

    setSavingId(studentId);
    setSaveMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/attendance/admin/${studentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save attendance.");
      }

      // Refresh records after saving
      const refreshResponse = await fetch(
        `${API_URL}/api/attendance/admin?date=${selectedDate}`
      );

      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok) {
        throw new Error(
          refreshData.message ||
            "Attendance saved, but refreshing records failed."
        );
      }

      setRecords(refreshData.records || []);
      setEditedStatuses({});
      setSaveMessage(
        `Attendance saved successfully for ${
          data.record?.attendance_date || selectedDate
        }.`
      );
    } catch (err) {
      setError(err.message || "Unable to save attendance.");
    } finally {
      setSavingId(null);
    }
  }

  // Search students
  const filteredRecords = records.filter((record) => {
    const query = search.toLowerCase();

    return (
      (record.name || "").toLowerCase().includes(query) ||
      (record.email || "").toLowerCase().includes(query) ||
      String(record.user_id ?? "").includes(query)
    );
  });

  // Attendance summary
  const presentCount = records.filter(
    (record) => record.status === "present"
  ).length;

  const absentCount = records.filter(
    (record) => record.status === "absent"
  ).length;

  const lateCount = records.filter(
    (record) => record.status === "late"
  ).length;

  const notMarkedCount = records.filter(
    (record) => !record.status
  ).length;

  // Display check-in time only when it represents an actual check-in
  function formatCheckInTime(value, status) {
    if (!value || status === "absent") {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function statusStyle(status) {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700";
      case "absent":
        return "bg-red-100 text-red-700";
      case "late":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }
return (
  <div className="min-h-screen bg-slate-100">
    

    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <Link
        to="/admin"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
      >
        ← Back to Admin Dashboard
      </Link>

      {/* Page title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          Mark Attendance
        </h2>
        <p className="mt-1 text-slate-500">
          View and update student attendance for the selected date.
        </p>
      </div>

      {/* Date and search */}
      <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="attendance-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Attendance Date
            </label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="student-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search Students
            </label>
            <input
              id="student-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or ID..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {[
          {
            label: "Total Students",
            count: records.length,
            color: "text-blue-600",
            border: "border-blue-500",
          },
          {
            label: "Present",
            count: presentCount,
            color: "text-green-600",
            border: "border-green-500",
          },
          {
            label: "Absent",
            count: absentCount,
            color: "text-red-600",
            border: "border-red-500",
          },
          {
            label: "Not Marked",
            count: notMarkedCount,
            color: "text-amber-600",
            border: "border-amber-500",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border-l-4 ${item.border} bg-white p-4 shadow-sm sm:p-5`}
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-2 text-3xl font-bold ${item.color}`}>
              {item.count}
            </p>
          </div>
        ))}
      </section>

      {/* Feedback messages */}
      {saveMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
        >
          ✓ {saveMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setSelectedDate((current) => current)}
            className="mt-2 font-semibold underline"
          >
            Check the message above
          </button>
        </div>
      )}

      {/* Attendance table */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Student Attendance List
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Attendance for {selectedDate}
            </p>
          </div>

          <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
            {filteredRecords.length} student(s)
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-600">
              Loading attendance records...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mb-3 text-3xl">📋</div>
            <h4 className="font-semibold text-slate-700">
              No Student Records Found
            </h4>
            <p className="mt-2 text-sm text-slate-500">
              No attendance records match this date or search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Student ID</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Check-in Time</th>
                  <th className="px-5 py-4">Current Status</th>
                  <th className="px-5 py-4">Edit Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => {
                  const selectedStatus =
                    editedStatuses[record.user_id] ??
                    record.status ??
                    "";

                  return (
                    <tr
                      key={record.user_id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {record.user_id}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {record.name || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {record.email || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatCheckInTime(
                          record.check_in_time,
                          record.status
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyle(
                            record.status
                          )}`}
                        >
                          {record.status || "Not marked"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          aria-label={`Edit attendance status for ${record.name || record.user_id}`}
                          value={selectedStatus}
                          onChange={(event) =>
                            setEditedStatuses((previous) => ({
                              ...previous,
                              [record.user_id]: event.target.value,
                            }))
                          }
                          disabled={savingId === record.user_id}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                        >
                          <option value="" disabled>
                            Select status
                          </option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            saveAttendance(record.user_id, selectedStatus)
                          }
                          disabled={savingId !== null}
                          className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingId === record.user_id
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Present: {presentCount} · Absent: {absentCount} · Late: {lateCount}
          </p>

          <p className="text-sm text-slate-500">
            Changes are saved to your existing backend.
          </p>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-slate-400">
        AttendEase · Attendance Management
      </p>
    </main>
  </div>
);
}
