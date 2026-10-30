import { useEffect, useState } from "react";
import { Link } from "react-router-dom";



export default function EmployeeDetails() {
  const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchEmployees() {
    setLoading(true);
    setError("");

    try {
      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is missing. Check your frontend .env file and restart Vite."
        );
      }

      const response = await fetch(
        `${API_URL}/api/admin/employees`
      );

      const text = await response.text();
      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `The backend returned an invalid response (HTTP ${response.status}). Check the API URL and backend route.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Could not load employee details (HTTP ${response.status}).`
        );
      }

      const records = Array.isArray(data)
        ? data
        : data.employees;

      if (!Array.isArray(records)) {
        throw new Error(
          "The backend response does not contain an employee list."
        );
      }

      setEmployees(records);
    } catch (err) {
      setEmployees([]);
      setError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="mb-7">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Employee Management
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Employee Details
          </h1>

          <p className="mt-2 text-slate-500">
            View employee records stored in AttendEase.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-2 bg-blue-600" />

          <div className="p-6 sm:p-8">
            <div className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-700">
                  ♙
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Employee Directory
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {loading
                      ? "Loading employee records..."
                      : `${employees.length} employee record${
                          employees.length === 1 ? "" : "s"
                        } found`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchEmployees}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p>{error}</p>

                <button
                  type="button"
                  onClick={fetchEmployees}
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="rounded-xl bg-slate-50 p-10 text-center">
                <p className="font-medium text-slate-600">
                  Loading employee details...
                </p>
              </div>
            ) : !error && employees.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="mb-3 text-3xl text-blue-600">
                  ♙
                </div>

                <h3 className="font-semibold text-slate-700">
                  No Employee Records Found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Existing employee records will appear here.
                </p>
              </div>
            ) : !error ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="whitespace-nowrap px-5 py-4">
                          Employee
                        </th>
                        <th className="whitespace-nowrap px-5 py-4">
                          Contact Number
                        </th>
                        <th className="whitespace-nowrap px-5 py-4">
                          Designation
                        </th>
                        <th className="whitespace-nowrap px-5 py-4">
                          Date of Joining
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {employees.map((employee, index) => (
                        <tr
                          key={
                            employee.admin_id ??
                            employee.user_id ??
                            index
                          }
                          className="transition hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                                {(employee.first_name || "E")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {[
                                    employee.first_name,
                                    employee.last_name,
                                  ]
                                    .filter(Boolean)
                                    .join(" ") || "—"}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Employee ID: {employee.admin_id ?? "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {employee.contact || "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                              {employee.designation || "—"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {employee.date_of_join
                              ? String(employee.date_of_join).slice(0, 10)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">
                Employee records are retrieved from your existing database.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          AttendEase · Employee Management
        </p>
      </div>
    </div>
  );
}