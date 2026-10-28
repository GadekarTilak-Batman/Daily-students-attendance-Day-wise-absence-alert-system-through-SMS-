import { AttendanceRecord, SmsLog, SmsGatewaySettings } from '../types';
import { INITIAL_GATEWAY_SETTINGS } from '../data/mockStudents';

const ATTENDANCE_KEY = 'campus_alert_attendance_v3';
const SMS_LOGS_KEY = 'campus_alert_sms_logs_v3';
const SETTINGS_KEY = 'campus_alert_settings_v3';

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

const INITIAL_SEED_LOGS: SmsLog[] = [
  {
    id: 'sms_seed_01',
    studentId: 'std_002',
    studentName: 'Diya Patel',
    rollNo: 'CS-2026-042',
    parentName: 'Vikram Patel',
    parentPhone: '+1 (555) 345-6712',
    department: 'Computer Science & Engineering',
    date: '2026-10-28',
    dayName: 'Wednesday',
    period: 'Full Day',
    subject: 'Computer Networks, DevOps, DAA, PPL, Computer Graphics',
    messageContent: "Dear Vikram Patel, this is an automated attendance notice from Mother Theressa College of Engineering and Technology, Peddapalli. Your ward Diya Patel (Roll: CS-2026-042) was marked ABSENT for today (Wednesday, 28 Oct 2026). Scheduled classes today: Computer Networks, DevOps, DAA, PPL, Computer Graphics. If this absence is authorized, please reply directly to this SMS.",
    status: 'ACKNOWLEDGED',
    sentAt: '08:45 AM',
    deliveredAt: '08:45 AM',
    carrierCode: 'DELIVRD_200',
    retryCount: 0,
    acknowledgement: {
      repliedAt: '08:52 AM',
      replyText: 'Diya is suffering from severe fever. She will report to college tomorrow with a doctor certificate.',
      excuseType: 'Medical Excuse',
    }
  },
  {
    id: 'sms_seed_02',
    studentId: 'std_002',
    studentName: 'Diya Patel',
    rollNo: 'CS-2026-042',
    parentName: 'Vikram Patel',
    parentPhone: '+1 (555) 345-6712',
    department: 'Computer Science & Engineering',
    date: '2026-10-27',
    dayName: 'Tuesday',
    period: 'Full Day',
    subject: 'Computer Networks, DevOps, DAA, PPL, Computer Graphics',
    messageContent: "Dear Vikram Patel, this is an automated attendance notice from Mother Theressa College of Engineering and Technology, Peddapalli. Your ward Diya Patel (Roll: CS-2026-042) was marked ABSENT for yesterday (Tuesday, 27 Oct 2026).",
    status: 'DELIVERED',
    sentAt: '09:00 AM',
    deliveredAt: '09:00 AM',
    carrierCode: 'DELIVRD_200',
    retryCount: 0,
  },
  {
    id: 'sms_seed_03',
    studentId: 'std_004',
    studentName: 'Ananya Iyer',
    rollNo: 'CS-2026-044',
    parentName: 'Karthik Iyer',
    parentPhone: '+1 (555) 567-8934',
    department: 'Computer Science & Engineering',
    date: '2026-10-28',
    dayName: 'Wednesday',
    period: 'Full Day',
    subject: 'Computer Networks, DevOps, DAA, PPL, Computer Graphics',
    messageContent: "Dear Karthik Iyer, this is an automated attendance notice from Mother Theressa College of Engineering and Technology, Peddapalli. Your ward Ananya Iyer (Roll: CS-2026-044) was marked ABSENT for today (Wednesday, 28 Oct 2026). Scheduled classes today: Computer Networks, DevOps, DAA, PPL, Computer Graphics.",
    status: 'DELIVERED',
    sentAt: '09:15 AM',
    deliveredAt: '09:15 AM',
    carrierCode: 'DELIVRD_200',
    retryCount: 0,
  },
  {
    id: 'sms_seed_04',
    studentId: 'std_007',
    studentName: 'Tanvi Nair',
    rollNo: 'CS-2026-047',
    parentName: 'Gopal Nair',
    parentPhone: '+1 (555) 890-1267',
    department: 'Computer Science & Engineering',
    date: '2026-10-28',
    dayName: 'Wednesday',
    period: 'Full Day',
    subject: 'Computer Networks, DevOps, DAA, PPL, Computer Graphics',
    messageContent: "Dear Gopal Nair, this is an automated attendance notice from Mother Theressa College of Engineering and Technology, Peddapalli. Your ward Tanvi Nair (Roll: CS-2026-047) was marked ABSENT for today (Wednesday, 28 Oct 2026).",
    status: 'FAILED',
    sentAt: '09:15 AM',
    carrierCode: 'ERR_TIMEOUT_504',
    retryCount: 1,
    failureReason: 'Carrier SMSC gateway response timeout. Upstream tower unreachable.'
  }
];

export const storageService = {
  getAttendanceRecords(): AttendanceRecord[] {
    try {
      const stored = localStorage.getItem(ATTENDANCE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  },

  saveAttendanceRecords(records: AttendanceRecord[]): void {
    try {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save attendance records', e);
    }
  },

  getSmsLogs(): SmsLog[] {
    try {
      const stored = localStorage.getItem(SMS_LOGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Seed initial logs for immediate demo
    localStorage.setItem(SMS_LOGS_KEY, JSON.stringify(INITIAL_SEED_LOGS));
    return INITIAL_SEED_LOGS;
  },

  saveSmsLogs(logs: SmsLog[]): void {
    try {
      localStorage.setItem(SMS_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save sms logs', e);
    }
  },

  addSmsLogs(newLogs: SmsLog[]): SmsLog[] {
    const existing = this.getSmsLogs();
    const updated = [...newLogs, ...existing];
    this.saveSmsLogs(updated);
    return updated;
  },

  updateSmsLog(logId: string, updates: Partial<SmsLog>): SmsLog[] {
    const existing = this.getSmsLogs();
    const updated = existing.map(l => (l.id === logId ? { ...l, ...updates } : l));
    this.saveSmsLogs(updated);
    return updated;
  },

  acknowledgeSms(logId: string, replyText: string, excuseType: string = 'Parent Notification Response'): SmsLog[] {
    const existing = this.getSmsLogs();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = existing.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          status: 'ACKNOWLEDGED' as const,
          acknowledgement: {
            repliedAt: now,
            replyText,
            excuseType
          }
        };
      }
      return l;
    });
    this.saveSmsLogs(updated);
    return updated;
  },

  getGatewaySettings(): SmsGatewaySettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_GATEWAY_SETTINGS;
  },

  saveGatewaySettings(settings: SmsGatewaySettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  resetAllData(): void {
    localStorage.removeItem(ATTENDANCE_KEY);
    localStorage.removeItem(SMS_LOGS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
};
