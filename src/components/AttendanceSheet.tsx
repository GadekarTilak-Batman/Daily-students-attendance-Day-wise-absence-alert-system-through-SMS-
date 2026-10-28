import React, { useState } from 'react';
import { Student, AttendanceStatus, AttendanceRecord, SmsLog } from '../types';
import { DEPARTMENTS, ATTENDANCE_DAYS, DAILY_CLASSES } from '../data/mockStudents';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Search, 
  AlertTriangle,
  Smartphone,
  Calendar,
  Building2,
  BookOpen
} from 'lucide-react';

interface AttendanceSheetProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  smsLogs: SmsLog[];
  onMarkAttendance: (studentId: string, status: AttendanceStatus) => void;
  onBatchMarkAll: (status: AttendanceStatus) => void;
  onResetAttendance: () => void;
  onTriggerBatchSms: (absentStudents: Student[]) => void;
  onTriggerSingleSms: (student: Student) => void;
  onOpenParentSimulator: (parentPhone: string) => void;
  currentDate: string;
  onSelectDate: (date: string) => void;
  selectedDept: string;
  onSelectDept: (dept: string) => void;
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  students,
  attendanceRecords,
  smsLogs,
  onMarkAttendance,
  onBatchMarkAll,
  onResetAttendance,
  onTriggerBatchSms,
  onTriggerSingleSms,
  onOpenParentSimulator,
  currentDate,
  onSelectDate,
  selectedDept,
  onSelectDept,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('Semester 6');
  const [sectionFilter, setSectionFilter] = useState('A');

  const currentDayObj = ATTENDANCE_DAYS.find(d => d.date === currentDate) || ATTENDANCE_DAYS[0];

  // Filter students based on selection
  const filteredStudents = students.filter(student => {
    const matchesDept = selectedDept === 'All' || student.department === selectedDept;
    const matchesSem = semesterFilter === 'All' || student.semester === semesterFilter;
    const matchesSec = sectionFilter === 'All' || student.section === sectionFilter;
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSem && matchesSec && matchesSearch;
  });

  // Calculate day-wise attendance status map for the selected date
  const statusMap: Record<string, AttendanceStatus> = {};
  attendanceRecords.forEach(rec => {
    if (rec.date === currentDate) {
      statusMap[rec.studentId] = rec.status;
    }
  });

  // Collect absent students who need parent notification for the day
  const absentStudents = filteredStudents.filter(s => (statusMap[s.id] || 'PRESENT') === 'ABSENT');
  const presentCount = filteredStudents.filter(s => (statusMap[s.id] || 'PRESENT') === 'PRESENT').length;
  const lateCount = filteredStudents.filter(s => statusMap[s.id] === 'LATE').length;
  const excusedCount = filteredStudents.filter(s => statusMap[s.id] === 'EXCUSED').length;
  const absentCount = absentStudents.length;
  const totalCount = filteredStudents.length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  // Check which students already have SMS logs for this date
  const sentSmsStudentIds = new Set(
    smsLogs
      .filter(l => l.date === currentDate)
      .map(l => l.studentId)
  );

  return (
    <div className="space-y-6">
      {/* Top Filter & Session Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Day: {currentDayObj.label}</span>
              <span className="text-slate-300">|</span>
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Mother Theressa College of Engg & Tech, Peddapalli</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Daily Student Attendance & Day-Wise Absence Alert System
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onBatchMarkAll('PRESENT')}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              onClick={() => onBatchMarkAll('ABSENT')}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Mark All Absent
            </button>
            <button
              onClick={onResetAttendance}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset records to default"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Attendance Day / Date</label>
            <select
              value={currentDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {ATTENDANCE_DAYS.map(day => (
                <option key={day.date} value={day.date}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => onSelectDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Semester & Section</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="All">All Sem</option>
                <option value="Semester 4">Sem 4</option>
                <option value="Semester 6">Sem 6</option>
              </select>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="All">All Sec</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Search Roster</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Name, Roll No, Parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Scheduled Day Classes Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Classes Scheduled for the Day:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 font-medium">
              {DAILY_CLASSES.map((cls, idx) => (
                <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 text-[11px] shadow-2xs">
                  {cls}
                </span>
              ))}
            </div>
          </div>
          <div className="text-slate-500 font-mono text-[11px] shrink-0">
            {filteredStudents.length} Students in Cohort
          </div>
        </div>
      </div>

      {/* KPI Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Enrolled</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Filtered cohort</div>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-sm bg-emerald-50/20">
          <div className="text-xs font-medium text-emerald-800">Present Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
            {presentCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">In attendance</div>
        </div>

        <div className={`rounded-xl p-4 shadow-sm border ${
          absentCount > 0 
            ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`text-xs font-bold ${absentCount > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Absent for Day
            </div>
            {absentCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            )}
          </div>
          <div className={`text-2xl font-bold mt-1 font-mono tabular-nums ${
            absentCount > 0 ? 'text-rose-700' : 'text-slate-900'
          }`}>
            {absentCount}
          </div>
          <div className={`text-[11px] mt-0.5 ${absentCount > 0 ? 'text-rose-700 font-medium' : 'text-slate-400'}`}>
            {absentCount > 0 ? 'Requires parent SMS' : 'No alerts needed'}
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-amber-800">Late Arrival</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
            {lateCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tardy entry</div>
        </div>

        <div className="bg-white border border-blue-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-blue-800">Excused Leave</div>
          <div className="text-2xl font-bold text-blue-600 mt-1 font-mono tabular-nums">
            {excusedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pre-authorized</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Day Attendance %</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {attendanceRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Full day turnout</div>
        </div>
      </div>

      {/* Prominent Automated Absence Alert Banner ("At a Time" Day Trigger) */}
      {absentCount > 0 && (
        <div className="bg-gradient-to-r from-rose-900 to-slate-900 text-white rounded-xl p-5 shadow-lg border border-rose-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Automated Absence Detection Triggered for the Day
                </h3>
                <span className="text-xs bg-rose-500 text-white font-mono px-2 py-0.5 rounded font-semibold">
                  {absentCount} Students Absent
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-1 max-w-xl">
                {absentCount} student{absentCount > 1 ? 's are' : ' is'} marked absent for <strong className="text-white">{currentDayObj.label}</strong> at Mother Theressa College of Engineering and Technology, Peddapalli. Classes missed: Computer Networks, DevOps, DAA, PPL, Computer Graphics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTriggerBatchSms(absentStudents)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white font-semibold text-xs rounded-lg shadow-md transition-all whitespace-nowrap cursor-pointer hover:shadow-rose-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Send Instant SMS to All {absentCount} Absent Parents for the Day at Once</span>
            </button>
          </div>
        </div>
      )}

      {/* Student Attendance Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Daily Attendance Roster — {currentDayObj.label}
            </h2>
            <p className="text-xs text-slate-500">
              Record full day student attendance; marking absent automatically generates daily SMS notification payload
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Showing {filteredStudents.length} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Parent / Guardian Contact</th>
                <th className="py-3 px-4 text-center">Historical Attendance</th>
                <th className="py-3 px-4 text-center">Day Attendance Status</th>
                <th className="py-3 px-4 text-right">Daily SMS Alert Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students match the selected filters or search query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentStatus = statusMap[student.id] || 'PRESENT';
                  const isAbsent = currentStatus === 'ABSENT';
                  const isDispatched = sentSmsStudentIds.has(student.id);
                  const isWatchlist = student.historicalAttendanceRate < 75 || student.consecutiveAbsences >= 3;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isAbsent ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Roll No */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {student.rollNo}
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {student.department} · {student.section}
                        </div>
                      </td>

                      {/* Parent Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {student.parentName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span>{student.parentPhone}</span>
                          <button
                            onClick={() => onOpenParentSimulator(student.parentPhone)}
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 text-[10px]"
                            title="Preview handset"
                          >
                            <Smartphone className="w-2.5 h-2.5" />
                            <span>Simulate</span>
                          </button>
                        </div>
                      </td>

                      {/* Historical Attendance Rate */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono tabular-nums font-semibold">
                          <span
                            className={
                              student.historicalAttendanceRate >= 85
                                ? 'text-emerald-700'
                                : student.historicalAttendanceRate >= 75
                                ? 'text-slate-700'
                                : 'text-rose-600'
                            }
                          >
                            {student.historicalAttendanceRate}%
                          </span>
                        </div>
                        {isWatchlist && (
                          <div className="text-[10px] text-rose-600 font-medium">
                            Shortage Warning
                          </div>
                        )}
                      </td>

                      {/* Day Status Selector Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                          <button
                            onClick={() => onMarkAttendance(student.id, 'PRESENT')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => onMarkAttendance(student.id, 'ABSENT')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => onMarkAttendance(student.id, 'LATE')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => onMarkAttendance(student.id, 'EXCUSED')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                              currentStatus === 'EXCUSED'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-blue-700'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>

                      {/* Day SMS Notification Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isAbsent ? (
                          isDispatched ? (
                            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>SMS Dispatched for Day</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => onTriggerSingleSms(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Send className="w-3 h-3 text-rose-600" />
                              <span>Send Day Alert</span>
                            </button>
                          )
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
