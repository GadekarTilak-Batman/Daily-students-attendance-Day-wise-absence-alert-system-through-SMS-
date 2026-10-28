import React, { useState } from 'react';
import { Student, SmsLog } from '../types';
import { 
  Smartphone, 
  Send, 
  CheckCheck, 
  ShieldCheck, 
  Phone, 
  ChevronLeft, 
  MoreVertical, 
  Sparkles,
  Info,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface ParentPhoneSimulatorProps {
  students: Student[];
  smsLogs: SmsLog[];
  selectedPhone: string;
  onSelectPhone: (phone: string) => void;
  onSendParentReply: (logId: string, replyText: string, excuseType: string) => void;
  collegeName?: string;
  senderId?: string;
}

export const ParentPhoneSimulator: React.FC<ParentPhoneSimulatorProps> = ({
  students,
  smsLogs,
  selectedPhone,
  onSelectPhone,
  onSendParentReply,
  collegeName = 'Mother Theressa College of Engineering and Technology, Peddapalli',
  senderId = 'MTCET-ALRT',
}) => {
  const [customReplyText, setCustomReplyText] = useState('');
  const [justSentFeedback, setJustSentFeedback] = useState(false);

  // Find students and active logs for the selected phone number
  const activeStudent = students.find(s => s.parentPhone === selectedPhone) || students[0];
  const currentLogs = [...smsLogs.filter(l => l.parentPhone === (activeStudent?.parentPhone || selectedPhone))].reverse();
  const latestLog = currentLogs[currentLogs.length - 1];

  // Quick excuse presets
  const quickExcuses = [
    { label: 'Medical Illness', text: 'My ward has high fever and is under doctor care today. Medical certificate will be submitted tomorrow.', type: 'Medical Excuse' },
    { label: 'Traffic Delay', text: 'Stuck in severe metro transit breakdown; will reach campus by 10:15 AM.', type: 'Transit Delay' },
    { label: 'Family Event', text: 'Authorized family emergency out of station for today. Kindly excuse.', type: 'Family Emergency' },
    { label: 'Attendance Dispute', text: 'Student reached college at 8:30 AM; please verify lab attendance with HOD.', type: 'Dispute / Verification' },
  ];

  const handleSendReply = (text: string, type: string) => {
    if (!latestLog) return;
    onSendParentReply(latestLog.id, text, type);
    setCustomReplyText('');
    setJustSentFeedback(true);
    setTimeout(() => setJustSentFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the feature */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Handset Emulation</span>
            <span className="text-slate-300">|</span>
            <span>2-Way Telecom Inbound Loop</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Parent Handset Simulator & Inbound ACK
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Preview the exact SMS delivered to a parent&apos;s handset and simulate their two-way response to automatically update roll call logs to Acknowledged.
          </p>
        </div>

        {/* Parent selector dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Select Parent Handset:
          </label>
          <select
            value={activeStudent?.parentPhone || ''}
            onChange={(e) => onSelectPhone(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 min-w-[220px]"
          >
            {students.map((std) => {
              const hasAlert = smsLogs.some(l => l.studentId === std.id);
              return (
                <option key={std.id} value={std.parentPhone}>
                  {std.parentName} ({std.name} - {std.rollNo}) {hasAlert ? '★ Alerted' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Phone Mockup (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[340px] h-[670px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-800 relative flex flex-col overflow-hidden">
            {/* Dynamic Island / Notch */}
            <div className="w-32 h-5 bg-slate-900 rounded-b-2xl mx-auto flex items-center justify-center gap-1.5 z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
            </div>

            {/* Phone Screen Container */}
            <div className="bg-slate-100 flex-1 rounded-[36px] overflow-hidden flex flex-col relative text-slate-900">
              {/* Phone Status Bar */}
              <div className="px-6 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-800 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
                <span>09:41</span>
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Message Thread Header */}
              <div className="px-4 py-2.5 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4 text-blue-600" />
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold tracking-tight">
                    MT
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>{senderId}</span>
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]" title={collegeName}>
                      {collegeName}
                    </div>
                  </div>
                </div>
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </div>

              {/* Message Feed Container */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-100/90">
                <div className="text-center my-1">
                  <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    Today · Priority Alert Channel
                  </span>
                </div>

                {currentLogs.length === 0 ? (
                  <div className="bg-white/80 border border-slate-200 rounded-xl p-4 text-center my-6 space-y-2">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                    <div className="text-xs font-semibold text-slate-700">No Absence Alerts Received Yet</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Mark {activeStudent.name} as Absent in the Roll Call tab and trigger SMS to see the real-time notification appear here!
                    </p>
                  </div>
                ) : (
                  currentLogs.map((log) => (
                    <div key={log.id} className="space-y-2">
                      {/* Inbound alert bubble (from College to Parent) */}
                      <div className="flex flex-col items-start max-w-[90%]">
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 text-slate-800 shadow-xs leading-relaxed text-[11px]">
                          {log.messageContent}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 ml-1 font-mono flex items-center gap-1">
                          <span>{log.sentAt}</span>
                          <span>·</span>
                          <span className="text-emerald-700">Delivered</span>
                        </div>
                      </div>

                      {/* Outbound response bubble (from Parent back to College) */}
                      {log.acknowledgement && (
                        <div className="flex flex-col items-end max-w-[90%] ml-auto">
                          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs p-3 shadow-xs leading-relaxed text-[11px]">
                            {log.acknowledgement.replyText}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-1 mr-1 font-mono flex items-center gap-1">
                            <span>{log.acknowledgement.repliedAt}</span>
                            <CheckCheck className="w-3 h-3 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Handset Message Input Bar */}
              <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={latestLog ? "Type SMS reply to college..." : "No alert to reply to"}
                  disabled={!latestLog}
                  value={customReplyText}
                  onChange={(e) => setCustomReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customReplyText.trim() && latestLog) {
                      handleSendReply(customReplyText.trim(), 'Custom Reply');
                    }
                  }}
                  className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  disabled={!latestLog || !customReplyText.trim()}
                  onClick={() => handleSendReply(customReplyText.trim(), 'Custom Parent Reply')}
                  className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-30 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* iOS Home Indicator Bar */}
              <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto my-1.5" />
            </div>
          </div>
        </div>

        {/* Right Column: Inbound ACK Simulator Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Handset Profile Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Active Recipient</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeStudent.parentName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Student Enrolled</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {activeStudent.name} ({activeStudent.rollNo})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Mobile Phone</span>
                <span className="font-mono text-slate-900 font-semibold">{activeStudent.parentPhone}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Current Alert Status</span>
                <span className={`font-semibold ${
                  latestLog?.status === 'ACKNOWLEDGED' 
                    ? 'text-blue-600' 
                    : latestLog?.status === 'DELIVERED' 
                    ? 'text-emerald-600' 
                    : 'text-slate-500'
                }`}>
                  {latestLog ? latestLog.status : 'No Active Alert'}
                </span>
              </div>
            </div>
          </div>

          {/* Simulate 2-Way Parent Responses */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Simulate 2-Way Parent SMS Reply
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                In a real telecom integration, parents reply directly to the SMS. Inbound webhooks parse the text and automatically update the college attendance log to Acknowledged.
              </p>
            </div>

            {/* Quick response buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Quick Preset Excuses (Click to Send from Handset):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickExcuses.map((excuse, idx) => (
                  <button
                    key={idx}
                    disabled={!latestLog}
                    onClick={() => handleSendReply(excuse.text, excuse.label)}
                    className="p-3 text-left bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 group cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-slate-800 group-hover:text-blue-900 flex items-center justify-between">
                      <span>{excuse.label}</span>
                      <Send className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div className="text-[11px] text-slate-500 group-hover:text-blue-800 mt-1 line-clamp-2">
                      &ldquo;{excuse.text}&rdquo;
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback notification */}
            {justSentFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Inbound SMS webhook received! College attendance record & delivery log updated to <strong>ACKNOWLEDGED</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Educational Callout explaining the Telecom Loop */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-5 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Info className="w-4 h-4 text-blue-400" />
              <span>How 2-Way SMS Inbound Webhooks Operate</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              When the parent sends an SMS reply, the telecommunication aggregator (e.g. Twilio / AWS SNS / Infobip) converts the carrier SMPP packet into an HTTP POST webhook request signed with an HMAC SHA-256 header. The college backend validates the signature, correlates the sender phone number with the daily absence session, and marks the absence reason in the student information database without manual administrative intervention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
