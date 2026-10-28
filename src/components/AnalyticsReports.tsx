import React, { useState } from 'react';
import { Student, SmsLog } from '../types';
import { DEPARTMENTS } from '../data/mockStudents';
import { 
  BarChart3, 
  AlertTriangle, 
  Download, 
  TrendingDown, 
  CheckCircle2, 
  Send, 
  UserX,
  FileWarning,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface AnalyticsReportsProps {
  students: Student[];
  smsLogs: SmsLog[];
  onTriggerSingleSms: (student: Student) => void;
  onOpenParentSimulator: (phone: string) => void;
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({
  students,
  smsLogs,
  onTriggerSingleSms,
  onOpenParentSimulator,
}) => {
  const [issuedWarningMap, setIssuedWarningMap] = useState<Record<string, boolean>>({});

  // Calculate high-level institutional statistics
  const totalStudents = students.length;
  const avgAttendance = Math.round(
    students.reduce((acc, s) => acc + s.historicalAttendanceRate, 0) / (totalStudents || 1)
  );

  const totalDispatched = smsLogs.length;
  const totalDelivered = smsLogs.filter(l => l.status === 'DELIVERED' || l.status === 'ACKNOWLEDGED').length;
  const deliveryRate = totalDispatched > 0 ? Math.round((totalDelivered / totalDispatched) * 100) : 98;
  const totalAck = smsLogs.filter(l => l.status === 'ACKNOWLEDGED').length;
  const ackRate = totalDispatched > 0 ? Math.round((totalAck / totalDispatched) * 100) : 40;

  // Identify chronic absenteeism watchlist students (<75% attendance or >=3 consecutive absences)
  const watchlistStudents = students.filter(
    s => s.historicalAttendanceRate < 75 || s.consecutiveAbsences >= 3
  );

  // Department metrics breakdown
  const departmentStats = DEPARTMENTS.map(dept => {
    const deptStudents = students.filter(s => s.department === dept);
    const count = deptStudents.length;
    const avg = count > 0 
      ? Math.round(deptStudents.reduce((acc, s) => acc + s.historicalAttendanceRate, 0) / count)
      : 85;
    const atRisk = deptStudents.filter(s => s.historicalAttendanceRate < 75).length;
    return { name: dept, count, avg, atRisk };
  });

  const handleIssueWarningNotice = (studentId: string, studentName: string) => {
    setIssuedWarningMap(prev => ({ ...prev, [studentId]: true }));
    alert(`Statutory Attendance Shortage Notice issued for ${studentName}. Automated alert copy queued to Guardian & Dean's Office.`);
  };

  const handleExportWatchlistCsv = () => {
    const headers = ['RollNo', 'StudentName', 'Department', 'Semester', 'AttendanceRatePct', 'ConsecutiveAbsences', 'ParentName', 'ParentPhone'];
    const rows = watchlistStudents.map(s => [
      s.rollNo,
      `"${s.name}"`,
      `"${s.department}"`,
      s.semester,
      s.historicalAttendanceRate,
      s.consecutiveAbsences,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chronic_absenteeism_watchlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Institutional Intelligence</span>
            <span className="text-slate-300">|</span>
            <span>Regulatory Compliance</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Attendance Analytics & Chronic Absenteeism Watchlist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify repeat truancy, monitor carrier deliverability SLAs, and enforce university 75% statutory attendance thresholds.
          </p>
        </div>

        <button
          onClick={handleExportWatchlistCsv}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start md:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Watchlist (CSV)</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Overall Campus Attendance</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {avgAttendance}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <span>Target: &gt;80%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Carrier Deliverability SLA</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {deliveryRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {totalDelivered} / {totalDispatched} Delivered
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Guardian 2-Way ACK Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {ackRate}%
          </div>
          <div className="text-[11px] text-blue-600 mt-1 font-medium">
            {totalAck} Verified Parent Replies
          </div>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm bg-rose-50/20">
          <div className="text-xs font-semibold text-rose-800">Chronic Absenteeism Watchlist</div>
          <div className="text-2xl font-bold text-rose-700 mt-1 font-mono tabular-nums">
            {watchlistStudents.length} Students
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            Below 75% statutory requirement
          </div>
        </div>
      </div>

      {/* Chronic Absenteeism Watchlist Table */}
      <div className="bg-white border border-rose-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-sm font-bold text-rose-950">
                Chronic Absenteeism & Truancy Escalation Roster
              </h2>
              <p className="text-xs text-rose-800/80">
                Students below the 75% statutory cutoff are ineligible to sit for final semester university examinations without dean condonation
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
            {watchlistStudents.length} Flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student & Cohort</th>
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
                <th className="py-3 px-4 text-center">Consecutive Absences</th>
                <th className="py-3 px-4 text-center">Statutory Risk</th>
                <th className="py-3 px-4 text-right">Intervention Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {watchlistStudents.map((student) => {
                const isUnder70 = student.historicalAttendanceRate < 70;
                const hasIssued = issuedWarningMap[student.id];

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Roll No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {student.rollNo}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {student.department} · {student.semester}
                      </div>
                    </td>

                    {/* Parent Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{student.parentName}</div>
                      <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>{student.parentPhone}</span>
                        <button
                          onClick={() => onOpenParentSimulator(student.parentPhone)}
                          className="text-blue-600 hover:underline text-[10px]"
                        >
                          Simulator
                        </button>
                      </div>
                    </td>

                    {/* Attendance % */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums">
                      <span className={isUnder70 ? 'text-rose-700' : 'text-amber-700'}>
                        {student.historicalAttendanceRate}%
                      </span>
                      <div className="text-[10px] text-slate-400">Cutoff: 75%</div>
                    </td>

                    {/* Consecutive absences */}
                    <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-xs">
                        {student.consecutiveAbsences} Days
                      </span>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {isUnder70 ? (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                          CRITICAL EXAM SHORTAGE
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                          ATTENDANCE WARNING
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {hasIssued ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Notice Dispatched</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleIssueWarningNotice(student.id, student.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                        >
                          <FileWarning className="w-3 h-3 text-rose-600" />
                          <span>Issue Dean Notice</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Departmental Attendance Benchmarks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentStats.map((dept) => (
            <div key={dept.name} className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-xs truncate max-w-[190px]" title={dept.name}>
                  {dept.name}
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                  {dept.avg}%
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    dept.avg >= 85 ? 'bg-emerald-500' : dept.avg >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${dept.avg}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{dept.count} Students</span>
                <span className={dept.atRisk > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'}>
                  {dept.atRisk} in Shortage
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
