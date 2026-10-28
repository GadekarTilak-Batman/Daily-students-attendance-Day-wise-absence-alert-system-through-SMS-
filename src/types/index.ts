export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type SmsDeliveryStatus = 'QUEUED' | 'SENDING' | 'DELIVERED' | 'FAILED' | 'ACKNOWLEDGED';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  semester: string;
  section: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  historicalAttendanceRate: number; // e.g. 82.5%
  consecutiveAbsences: number;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  dayName?: string; // e.g. "Wednesday"
  status: AttendanceStatus;
  markedAt: string;
  markedBy: string;
  notes?: string;
  period?: string;
  subject?: string;
}

export interface SmsLog {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  parentName: string;
  parentPhone: string;
  department: string;
  date: string;
  dayName?: string;
  messageContent: string;
  status: SmsDeliveryStatus;
  sentAt: string;
  deliveredAt?: string;
  carrierCode: string; // e.g. "DELIVRD_200", "ERR_TIMEOUT_504"
  retryCount: number;
  failureReason?: string;
  period?: string;
  subject?: string;
  acknowledgement?: {
    repliedAt: string;
    replyText: string;
    excuseType: string;
  };
}

export interface SmsGatewaySettings {
  provider: 'SIMULATED' | 'TWILIO' | 'AWS_SNS' | 'INFOBIP' | 'MSG91';
  senderId: string;
  template: string;
  retryLimit: number;
  simulatedFailureRatePct: number; // 0 to 100 for simulating carrier drops
  collegeName: string;
  adminPhone: string;
  enableAudioChime: boolean;
}

export type ActiveTab = 'attendance' | 'dispatch-logs' | 'phone-simulator' | 'analytics' | 'architecture';
