import React, { useState, useEffect } from 'react';
import { 
  Student, 
  AttendanceStatus, 
  AttendanceRecord, 
  SmsLog, 
  SmsGatewaySettings, 
  ActiveTab 
} from './types';
import { INITIAL_STUDENTS, ATTENDANCE_DAYS, DAILY_CLASSES } from './data/mockStudents';
import { storageService, getTodayDateString } from './services/storageService';
import { dispatchSingleSms } from './services/smsService';
import { Header } from './components/Header';
import { AttendanceSheet } from './components/AttendanceSheet';
import { BatchDispatchModal } from './components/BatchDispatchModal';
import { SmsLogViewer } from './components/SmsLogViewer';
import { ParentPhoneSimulator } from './components/ParentPhoneSimulator';
import { AnalyticsReports } from './components/AnalyticsReports';
import { TechnicalBlueprint } from './components/TechnicalBlueprint';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('attendance');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [settings, setSettings] = useState<SmsGatewaySettings>(storageService.getGatewaySettings());
  
  // Day selection filter (defaults to today)
  const [currentDate, setCurrentDate] = useState<string>(ATTENDANCE_DAYS[0].date);
  const [selectedDept, setSelectedDept] = useState<string>('Computer Science & Engineering');

  // Modals & Handset focus
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchAbsentStudents, setBatchAbsentStudents] = useState<Student[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [simulatorPhone, setSimulatorPhone] = useState<string>('+1 (555) 345-6712');

  const currentDayObj = ATTENDANCE_DAYS.find(d => d.date === currentDate) || ATTENDANCE_DAYS[0];
  const classesList = DAILY_CLASSES.join(', ');

  // Load persisted state & seed realistic initial roll call for first launch
  useEffect(() => {
    const savedRecords = storageService.getAttendanceRecords();

    if (savedRecords.length > 0) {
      setAttendanceRecords(savedRecords);
    } else {
      // Seed initial day-wise attendance across all attendance days
      const allSeeded: AttendanceRecord[] = [];

      ATTENDANCE_DAYS.forEach((day, dIdx) => {
        INITIAL_STUDENTS.forEach((std, sIdx) => {
          let status: AttendanceStatus = 'PRESENT';

          // For Today (dIdx === 0):
          // Diya Patel (sIdx 1), Ananya Iyer (sIdx 3), Tanvi Nair (sIdx 6) are marked ABSENT for the day
          if (dIdx === 0) {
            if (sIdx === 1 || sIdx === 3 || sIdx === 6) {
              status = 'ABSENT';
            } else if (sIdx === 4) {
              status = 'LATE';
            }
          } 
          // For Yesterday (dIdx === 1):
          else if (dIdx === 1) {
            if (sIdx === 1 || sIdx === 6) {
              status = 'ABSENT';
            }
          }
          // For Monday (dIdx === 2):
          else if (dIdx === 2) {
            if (sIdx === 1 || sIdx === 11) {
              status = 'ABSENT';
            }
          }

          allSeeded.push({
            id: `att_${std.id}_${day.date}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            studentId: std.id,
            date: day.date,
            dayName: day.dayName,
            period: 'Full Day',
            subject: classesList,
            status,
            markedAt: '08:30 AM',
            markedBy: 'Prof. S. R. Sharma (HOD CSE, MTCET)',
          });
        });
      });

      setAttendanceRecords(allSeeded);
      storageService.saveAttendanceRecords(allSeeded);
    }

    setSmsLogs(storageService.getSmsLogs());
  }, [currentDate, classesList]);

  // Mark single student day attendance
  const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(
        r => r.studentId === studentId && r.date === currentDate
      );
      let updated: AttendanceRecord[];
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          markedAt: nowStr
        };
      } else {
        const newRecord: AttendanceRecord = {
          id: `att_${studentId}_${currentDate}_${Date.now()}`,
          studentId,
          date: currentDate,
          dayName: currentDayObj.dayName,
          period: 'Full Day',
          subject: classesList,
          status,
          markedAt: nowStr,
          markedBy: 'Prof. S. R. Sharma (HOD CSE, MTCET)'
        };
        updated = [...prev, newRecord];
      }
      storageService.saveAttendanceRecords(updated);
      return updated;
    });
  };

  // Batch mark all for the current day
  const handleBatchMarkAll = (status: AttendanceStatus) => {
    const relevantStudents = students.filter(
      s => selectedDept === 'All' || s.department === selectedDept
    );
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceRecords(prev => {
      const otherRecords = prev.filter(
        r => !(r.date === currentDate && relevantStudents.some(s => s.id === r.studentId))
      );

      const newRecords: AttendanceRecord[] = relevantStudents.map(std => ({
        id: `att_${std.id}_${currentDate}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        studentId: std.id,
        date: currentDate,
        dayName: currentDayObj.dayName,
        period: 'Full Day',
        subject: classesList,
        status,
        markedAt: nowStr,
        markedBy: 'Prof. S. R. Sharma (HOD CSE, MTCET)'
      }));

      const combined = [...otherRecords, ...newRecords];
      storageService.saveAttendanceRecords(combined);
      return combined;
    });
  };

  // Reset attendance records for the selected day
  const handleResetAttendance = () => {
    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => r.date !== currentDate);
      storageService.saveAttendanceRecords(filtered);
      return filtered;
    });
  };

  // Batch SMS trigger for day absentees
  const handleTriggerBatchSms = (absentList: Student[]) => {
    setBatchAbsentStudents(absentList);
    setIsBatchModalOpen(true);
  };

  // Single SMS trigger
  const handleTriggerSingleSms = (student: Student) => {
    setBatchAbsentStudents([student]);
    setIsBatchModalOpen(true);
  };

  // On batch dispatch completion
  const handleDispatchComplete = (newLogs: SmsLog[]) => {
    const updated = storageService.addSmsLogs(newLogs);
    setSmsLogs(updated);
  };

  // Resend single failed SMS
  const handleResendSingle = async (log: SmsLog) => {
    const student = students.find(s => s.id === log.studentId);
    if (!student) return;

    const newLog = await dispatchSingleSms(
      student,
      log.date || currentDate,
      log.dayName || currentDayObj.dayName,
      settings,
      log.retryCount + 1,
      classesList
    );

    const updated = storageService.updateSmsLog(log.id, {
      status: newLog.status,
      carrierCode: newLog.carrierCode,
      retryCount: log.retryCount + 1,
      failureReason: newLog.failureReason,
      sentAt: newLog.sentAt,
      deliveredAt: newLog.deliveredAt,
    });
    setSmsLogs(updated);
  };

  // Bulk resend all failed
  const handleBulkResendFailed = async () => {
    const failed = smsLogs.filter(l => l.status === 'FAILED');
    for (const log of failed) {
      await handleResendSingle(log);
    }
  };

  // Edit phone number & resend
  const handleEditPhoneAndResend = async (logId: string, newPhone: string) => {
    const log = smsLogs.find(l => l.id === logId);
    if (!log) return;

    // Update in student list
    setStudents(prev => prev.map(s => (s.id === log.studentId ? { ...s, parentPhone: newPhone } : s)));

    // Re-dispatch SMS
    const student = students.find(s => s.id === log.studentId);
    if (!student) return;
    const updatedStudent = { ...student, parentPhone: newPhone };

    const newLog = await dispatchSingleSms(
      updatedStudent,
      log.date || currentDate,
      log.dayName || currentDayObj.dayName,
      settings,
      log.retryCount + 1,
      classesList
    );

    const updated = storageService.updateSmsLog(logId, {
      parentPhone: newPhone,
      status: newLog.status,
      carrierCode: newLog.carrierCode,
      retryCount: log.retryCount + 1,
      failureReason: newLog.failureReason,
      sentAt: newLog.sentAt,
      deliveredAt: newLog.deliveredAt,
    });
    setSmsLogs(updated);
  };

  // Parent 2-way ACK response handler
  const handleSendParentReply = (logId: string, replyText: string, excuseType: string) => {
    const updatedLogs = storageService.acknowledgeSms(logId, replyText, excuseType);
    setSmsLogs(updatedLogs);

    // Also update student's attendance note with the excuse
    const log = updatedLogs.find(l => l.id === logId);
    if (log) {
      setAttendanceRecords(prev =>
        prev.map(r => {
          if (r.studentId === log.studentId && r.date === log.date) {
            return {
              ...r,
              notes: `[Parent Acknowledged - ${excuseType}]: "${replyText}"`
            };
          }
          return r;
        })
      );
    }
  };

  // Open simulator for specific parent
  const handleOpenParentSimulator = (phone: string) => {
    setSimulatorPhone(phone);
    setActiveTab('phone-simulator');
  };

  // Settings save & reset
  const handleSaveSettings = (newSettings: SmsGatewaySettings) => {
    setSettings(newSettings);
    storageService.saveGatewaySettings(newSettings);
  };

  const handleResetAllData = () => {
    storageService.resetAllData();
    window.location.reload();
  };

  // Compute pending absent students for current day
  const statusMap: Record<string, AttendanceStatus> = {};
  attendanceRecords.forEach(rec => {
    if (rec.date === currentDate) {
      statusMap[rec.studentId] = rec.status;
    }
  });
  const filteredStudents = students.filter(
    s => selectedDept === 'All' || s.department === selectedDept
  );
  const pendingAbsentCount = filteredStudents.filter(
    s => (statusMap[s.id] || 'PRESENT') === 'ABSENT'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Universal Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        pendingAbsentCount={pendingAbsentCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'attendance' && (
          <AttendanceSheet
            students={students}
            attendanceRecords={attendanceRecords}
            smsLogs={smsLogs}
            onMarkAttendance={handleMarkAttendance}
            onBatchMarkAll={handleBatchMarkAll}
            onResetAttendance={handleResetAttendance}
            onTriggerBatchSms={handleTriggerBatchSms}
            onTriggerSingleSms={handleTriggerSingleSms}
            onOpenParentSimulator={handleOpenParentSimulator}
            currentDate={currentDate}
            onSelectDate={setCurrentDate}
            selectedDept={selectedDept}
            onSelectDept={setSelectedDept}
          />
        )}

        {activeTab === 'dispatch-logs' && (
          <SmsLogViewer
            logs={smsLogs}
            onResendSingle={handleResendSingle}
            onBulkResendFailed={handleBulkResendFailed}
            onEditPhoneAndResend={handleEditPhoneAndResend}
            onOpenParentSimulator={handleOpenParentSimulator}
          />
        )}

        {activeTab === 'phone-simulator' && (
          <ParentPhoneSimulator
            students={students}
            smsLogs={smsLogs}
            selectedPhone={simulatorPhone}
            onSelectPhone={setSimulatorPhone}
            onSendParentReply={handleSendParentReply}
            collegeName={settings.collegeName}
            senderId={settings.senderId}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsReports
            students={students}
            smsLogs={smsLogs}
            onTriggerSingleSms={handleTriggerSingleSms}
            onOpenParentSimulator={handleOpenParentSimulator}
          />
        )}

        {activeTab === 'architecture' && (
          <TechnicalBlueprint />
        )}
      </main>

      {/* Batch Dispatch Modal (Concurrent Broadcast) */}
      <BatchDispatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        absentStudents={batchAbsentStudents}
        currentDate={currentDate}
        dayLabel={currentDayObj.label}
        dayName={currentDayObj.dayName}
        settings={settings}
        onDispatchComplete={handleDispatchComplete}
        onOpenSimulatorForParent={handleOpenParentSimulator}
        onViewLogs={() => setActiveTab('dispatch-logs')}
        classesList={classesList}
      />

      {/* Settings & Test Ping Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}
