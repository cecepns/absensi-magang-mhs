import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import moment from "moment";
import Layout from "../components/Layout/Layout";
import { getUserFromToken } from "../utils/auth";
import { formatDate, formatTime } from "../utils/time";
import ApiService from "../utils/api";

// Mentor Stats Component
function MentorStats() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const students = await ApiService.getStudents();
      const today = moment().format('YYYY-MM-DD');

      // Fetch today's attendance for all students
      const attendancePromises = students.map(async (student) => {
        try {
          const history = await ApiService.getStudentAttendance(
            student.id,
            "all",
            new Date().getMonth() + 1,
            new Date().getFullYear()
          );
          const todayClockIn = history.find(
            (item) => {
              if (!item.tanggal) return false;
              const itemDate = moment(item.tanggal).format('YYYY-MM-DD');
              return itemDate === today && item.type === "clock_in";
            }
          );
          const todayClockOut = history.find(
            (item) => {
              if (!item.tanggal) return false;
              const itemDate = moment(item.tanggal).format('YYYY-MM-DD');
              return itemDate === today && item.type === "clock_out";
            }
          );

          return {
            id: student.id,
            clockIn: todayClockIn,
            clockOut: todayClockOut,
          };
        } catch {
          return { id: student.id, clockIn: null, clockOut: null };
        }
      });

      const attendances = await Promise.all(attendancePromises);

      const present = attendances.filter((a) => a.clockIn && a.clockOut).length;
      const late = attendances.filter((a) => {
        if (!a.clockIn) return false;
        const clockInTime = a.clockIn.jam;
        return clockInTime > "08:00:00";
      }).length;
      const absent = attendances.filter((a) => !a.clockIn).length;
      const pending = attendances.filter(
        (a) =>
          (a.clockIn && a.clockIn.approved === null) ||
          (a.clockOut && a.clockOut.approved === null)
      ).length;

      setStats({
        totalStudents: students.length,
        presentToday: present,
        lateToday: late,
        absentToday: absent,
        pendingApprovals: pending,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Mahasiswa
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Hadir Hari Ini
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : stats.presentToday}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Terlambat</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : stats.lateToday}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tidak Hadir</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : stats.absentToday}
              </p>
            </div>
          </div>
        </div>
      </div>

      {stats.pendingApprovals > 0 && (
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm font-medium text-yellow-800">
              Ada {stats.pendingApprovals} absensi yang menunggu approval
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function Dashboard() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [todayLogbooks, setTodayLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUserFromToken();
  const location = useLocation();

  useEffect(() => {
    fetchTodayData();
  }, []);

  // Refresh data when returning from clock in/out or logbook pages
  useEffect(() => {
    const shouldRefresh = location.state?.refresh;
    if (shouldRefresh) {
      fetchTodayData();
      // Clear the refresh flag
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Auto-refresh when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchTodayData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchTodayData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // Get today's date using moment (format: YYYY-MM-DD)
      const todayMoment = moment();
      const todayDate = todayMoment.format('YYYY-MM-DD');

      // Fetch today's attendance
      const attendanceHistory = await ApiService.getAttendanceHistory(
        "all",
        month,
        year
      );
      const todayClockIn = attendanceHistory.find(
        (item) => {
          if (!item.tanggal) return false;
          const itemDate = moment(item.tanggal).format('YYYY-MM-DD');
          return itemDate === todayDate && item.type === "clock_in";
        }
      );
      const todayClockOut = attendanceHistory.find(
        (item) => {
          if (!item.tanggal) return false;
          const itemDate = moment(item.tanggal).format('YYYY-MM-DD');
          return itemDate === todayDate && item.type === "clock_out";
        }
      );

      setTodayAttendance({ clockIn: todayClockIn, clockOut: todayClockOut });

      // Fetch today's logbooks
      const logbooks = await ApiService.getLogbooks(month, year);
      const todayLogs = logbooks.filter((log) => {
        if (!log.tanggal) return false;
        const logDate = moment(log.tanggal).format('YYYY-MM-DD');
        return logDate === todayDate;
      });
      setTodayLogbooks(todayLogs);
    } catch (error) {
      console.error("Error fetching today data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClockStatus = () => {
    if (!todayAttendance) return "not_clocked";

    if (todayAttendance.clockIn && todayAttendance.clockOut) {
      return "completed";
    } else if (todayAttendance.clockIn) {
      return "clocked_in";
    }

    return "not_clocked";
  };

  const clockStatus = getClockStatus();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                👋 Selamat datang, {user?.nama_lengkap}!
              </h1>
              {user?.role === "mahasiswa" && (
                <p className="text-gray-600 mt-1">
                  {formatDate(new Date())} - Status:{" "}
                  <span
                    className={`font-semibold ${
                      clockStatus === "completed"
                        ? "text-green-600"
                        : clockStatus === "clocked_in"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {clockStatus === "completed"
                      ? "Absensi Lengkap"
                      : clockStatus === "clocked_in"
                      ? "Sudah Clock In"
                      : "Belum Absensi"}
                  </span>
                </p>
              )}
              {user?.role !== "mahasiswa" && (
                <p className="text-gray-600 mt-1">
                  {formatDate(new Date())}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Waktu Saat Ini</div>
              <div className="text-lg font-mono font-bold text-primary-600">
                {formatTime(new Date())}
              </div>
            </div>
          </div>
        </div>

        {user?.role === "mahasiswa" && (
          <>
            {/* Quick Actions for Students */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/clock-in"
                className={`card p-6 hover:shadow-lg transition-shadow ${
                  todayAttendance?.clockIn ? "bg-green-50 border-green-200" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-lg ${
                      todayAttendance?.clockIn
                        ? "bg-green-100"
                        : "bg-primary-100"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        todayAttendance?.clockIn
                          ? "text-green-600"
                          : "text-primary-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Clock In</h3>
                    <p className="text-sm text-gray-600">
                      {todayAttendance?.clockIn
                        ? `Sudah: ${todayAttendance.clockIn.jam}`
                        : "07:30 - 08:00"}
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/clock-out"
                className={`card p-6 hover:shadow-lg transition-shadow ${
                  todayAttendance?.clockOut
                    ? "bg-green-50 border-green-200"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-lg ${
                      todayAttendance?.clockOut
                        ? "bg-green-100"
                        : "bg-secondary-100"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        todayAttendance?.clockOut
                          ? "text-green-600"
                          : "text-secondary-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Clock Out</h3>
                    <p className="text-sm text-gray-600">
                      {todayAttendance?.clockOut
                        ? `Sudah: ${todayAttendance.clockOut.jam}`
                        : "17:00 - 17:30"}
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/logbook"
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-accent-100">
                    <svg
                      className="w-6 h-6 text-accent-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Logbook</h3>
                    <p className="text-sm text-gray-600">
                      {todayLogbooks.length}/4 kegiatan hari ini
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Today's Activities */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Aktivitas Hari Ini
              </h2>

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Attendance Status */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Status Absensi
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            todayAttendance?.clockIn
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span className="text-sm">
                          Clock In: {todayAttendance?.clockIn?.jam || "Belum"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            todayAttendance?.clockOut
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span className="text-sm">
                          Clock Out: {todayAttendance?.clockOut?.jam || "Belum"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Logbook Activities */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Logbook Hari Ini
                    </h3>
                    {todayLogbooks.length > 0 ? (
                      <div className="space-y-2">
                        {todayLogbooks.map((log, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">
                              {log.kegiatan}
                            </span>
                            <span className="text-gray-500">{log.durasi}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Belum ada kegiatan yang dicatat hari ini
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {(user?.role === "mentor" || user?.role === "pengurus") && (
          <>
            <MentorStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Link
                to="/mentor/students"
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Kelola Mahasiswa
                </h3>
                <p className="text-gray-600 mb-4">
                  Lihat daftar mahasiswa dan status kehadiran mereka
                </p>
                <div className="text-primary-600 font-medium">
                  Lihat Detail →
                </div>
              </Link>

              <Link
                to="/mentor/attendance"
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Kelola Absensi
                </h3>
                <p className="text-gray-600 mb-4">
                  Atur jadwal absensi dan approval kehadiran
                </p>
                <div className="text-primary-600 font-medium">
                  Kelola Absensi →
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
