import { Student, SmsLog, SmsGatewaySettings } from '../types';

export function interpolateTemplate(
  template: string,
  params: {
    parent_name: string;
    student_name: string;
    roll_no: string;
    department: string;
    date: string;
    day_name?: string;
    classes?: string;
    college_name: string;
    admin_phone: string;
    period?: string;
    subject?: string;
  }
): string {
  let result = template;
  result = result.replace(/{parent_name}/g, params.parent_name);
  result = result.replace(/{student_name}/g, params.student_name);
  result = result.replace(/{roll_no}/g, params.roll_no);
  result = result.replace(/{department}/g, params.department);
  result = result.replace(/{date}/g, params.date);
  result = result.replace(/{day_name}/g, params.day_name || 'Today');
  result = result.replace(/{classes}/g, params.classes || 'Computer Networks, DevOps, DAA, PPL, Computer Graphics');
  result = result.replace(/{college_name}/g, params.college_name);
  result = result.replace(/{admin_phone}/g, params.admin_phone);
  result = result.replace(/{period}/g, params.period || 'Full Day');
  result = result.replace(/{subject}/g, params.subject || 'All Scheduled Classes');
  return result;
}

// Web Audio synthesizer for operational audio cues (no external audio files needed)
export function playChime(type: 'start' | 'success' | 'alert') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'start') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'success') {
      const notes = [587.33, 880]; // D5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(280, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export interface DispatchProgressItem {
  studentId: string;
  studentName: string;
  parentPhone: string;
  status: 'PENDING' | 'SENDING' | 'DELIVERED' | 'FAILED';
  carrierCode?: string;
  error?: string;
}

export async function dispatchSingleSms(
  student: Student,
  dateStr: string,
  dayName: string,
  settings: SmsGatewaySettings,
  retryCount: number = 0,
  classesList: string = 'Computer Networks, DevOps, DAA, PPL, Computer Graphics'
): Promise<SmsLog> {
  const messageBody = interpolateTemplate(settings.template, {
    parent_name: student.parentName,
    student_name: student.name,
    roll_no: student.rollNo,
    department: student.department,
    date: dateStr,
    day_name: dayName,
    classes: classesList,
    college_name: settings.collegeName,
    admin_phone: settings.adminPhone,
    period: 'Full Day',
    subject: classesList,
  });

  // Simulate network latency (200ms - 550ms)
  const delay = Math.floor(Math.random() * 350) + 200;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Determine carrier response based on failure rate setting
  const isFailure = Math.random() * 100 < settings.simulatedFailureRatePct;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (isFailure) {
    const errorCodes = [
      { code: 'ERR_TIMEOUT_504', reason: 'Carrier SMSC gateway response timeout. Upstream tower unreachable.' },
      { code: 'ERR_HANDSET_BUSY_486', reason: 'Subscriber line busy / network congestion on terminating carrier.' },
      { code: 'ERR_INVALID_ROUTING_502', reason: 'SMPP peer connection drop on regional aggregator.' },
    ];
    const chosen = errorCodes[Math.floor(Math.random() * errorCodes.length)];

    return {
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      department: student.department,
      date: dateStr,
      dayName: dayName,
      period: 'Full Day',
      subject: classesList,
      messageContent: messageBody,
      status: 'FAILED',
      sentAt: timeStr,
      carrierCode: chosen.code,
      retryCount,
      failureReason: chosen.reason,
    };
  }

  return {
    id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    studentId: student.id,
    studentName: student.name,
    rollNo: student.rollNo,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    department: student.department,
    date: dateStr,
    dayName: dayName,
    period: 'Full Day',
    subject: classesList,
    messageContent: messageBody,
    status: 'DELIVERED',
    sentAt: timeStr,
    deliveredAt: timeStr,
    carrierCode: 'DELIVRD_200',
    retryCount,
  };
}

export async function dispatchBatchSmsConcurrent(
  students: Student[],
  dateStr: string,
  dayName: string,
  settings: SmsGatewaySettings,
  onProgress?: (progressMap: Record<string, DispatchProgressItem>) => void,
  classesList: string = 'Computer Networks, DevOps, DAA, PPL, Computer Graphics'
): Promise<SmsLog[]> {
  if (settings.enableAudioChime) {
    playChime('start');
  }

  // Initialize progress map
  const progressMap: Record<string, DispatchProgressItem> = {};
  students.forEach(s => {
    progressMap[s.id] = {
      studentId: s.id,
      studentName: s.name,
      parentPhone: s.parentPhone,
      status: 'SENDING',
    };
  });
  if (onProgress) onProgress({ ...progressMap });

  // Execute simultaneously using Promise.all with live progressive status
  const promises = students.map(async (student) => {
    const log = await dispatchSingleSms(student, dateStr, dayName, settings, 0, classesList);

    progressMap[student.id] = {
      studentId: student.id,
      studentName: student.name,
      parentPhone: student.parentPhone,
      status: log.status === 'DELIVERED' ? 'DELIVERED' : 'FAILED',
      carrierCode: log.carrierCode,
      error: log.failureReason,
    };

    if (onProgress) {
      onProgress({ ...progressMap });
    }
    return log;
  });

  const results = await Promise.all(promises);

  if (settings.enableAudioChime) {
    const hasFailures = results.some(r => r.status === 'FAILED');
    playChime(hasFailures ? 'alert' : 'success');
  }

  return results;
}
