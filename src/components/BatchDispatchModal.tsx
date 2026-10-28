import React, { useState, useEffect } from 'react';
import { Student, SmsLog, SmsGatewaySettings } from '../types';
import { 
  dispatchBatchSmsConcurrent, 
  DispatchProgressItem, 
  interpolateTemplate 
} from '../services/smsService';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface BatchDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  absentStudents: Student[];
  currentDate: string;
  dayLabel: string;
  dayName: string;
  settings: SmsGatewaySettings;
  onDispatchComplete: (newLogs: SmsLog[]) => void;
  onOpenSimulatorForParent: (phone: string) => void;
  onViewLogs: () => void;
  classesList?: string;
  periodLabel?: string;
  subjectLabel?: string;
}

export const BatchDispatchModal: React.FC<BatchDispatchModalProps> = ({
  isOpen,
  onClose,
  absentStudents,
  currentDate,
  dayLabel,
  dayName,
  settings,
  onDispatchComplete,
  onOpenSimulatorForParent,
  onViewLogs,
  classesList = 'Computer Networks, DevOps, DAA, PPL, Computer Graphics',
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, DispatchProgressItem>>({});
  const [dispatchedLogs, setDispatchedLogs] = useState<SmsLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      setIsExecuting(false);
      setIsFinished(false);
      setProgressMap({});
      setDispatchedLogs([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Sample message interpolation for preview
  const sampleStudent = absentStudents[0] || {
    name: 'Diya Patel',
    rollNo: 'CS-2026-042',
    parentName: 'Vikram Patel',
    department: 'Computer Science & Engineering',
  };

  const previewMessage = interpolateTemplate(settings.template, {
    parent_name: sampleStudent.parentName,
    student_name: sampleStudent.name,
    roll_no: sampleStudent.rollNo,
    department: sampleStudent.department,
    date: currentDate,
    day_name: dayName,
    classes: classesList,
    college_name: settings.collegeName,
    admin_phone: settings.adminPhone,
    period: 'Full Day',
    subject: classesList,
  });

  const handleStartSimultaneousDispatch = async () => {
    setIsExecuting(true);
    setIsFinished(false);

    try {
      const logs = await dispatchBatchSmsConcurrent(
        absentStudents,
        currentDate,
        dayName,
        settings,
        (updatedProgress) => {
          setProgressMap({ ...updatedProgress });
        },
        classesList
      );

      setDispatchedLogs(logs);
      setIsExecuting(false);
      setIsFinished(true);
      onDispatchComplete(logs);
    } catch (e) {
      console.error('Batch dispatch error:', e);
      setIsExecuting(false);
    }
  };

  const completedCount = Object.values(progressMap).filter(
    item => item.status === 'DELIVERED' || item.status === 'FAILED'
  ).length;
  const deliveredCount = Object.values(progressMap).filter(item => item.status === 'DELIVERED').length;
  const failedCount = Object.values(progressMap).filter(item => item.status === 'FAILED').length;
  const progressPercent = absentStudents.length > 0 ? Math.round((completedCount / absentStudents.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Simultaneous Absence Alert Broadcast
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>Concurrent Carrier Fan-Out</span>
                <span>·</span>
                <span className="font-mono">{absentStudents.length} Targets</span>
                <span>·</span>
                <span>Sender: {settings.senderId}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="text-slate-400 hover:text-white transition-colors p-1 disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {!isExecuting && !isFinished ? (
            /* Pre-dispatch state */
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Dynamic SMS Payload Preview (Interpolated)
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap">
                  {previewMessage}
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Tokens ({'{parent_name}'}, {'{student_name}'}, {'{roll_no}'}) are substituted per student</span>
                  <span className="font-mono">{previewMessage.length} chars</span>
                </div>
              </div>

              {/* Recipient Roster */}
              <div>
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Targeted Guardians ({absentStudents.length})</span>
                  <span className="text-[11px] font-normal text-slate-500">All dispatched simultaneously</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {absentStudents.map((student) => (
                    <div key={student.id} className="p-3 flex items-center justify-between bg-white text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{student.name}</span>
                        <span className="text-slate-400 ml-2 font-mono">({student.rollNo})</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-700">{student.parentName}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{student.parentPhone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety & Compliance Notice */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-blue-50/70 border border-blue-200/60 rounded-xl p-3.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Messages are sent via institutional SMS gateway with registered DLT sender header <strong className="font-mono text-blue-900">{settings.senderId}</strong>. Delivery receipts (DLR) are logged automatically.
                </span>
              </div>
            </div>
          ) : (
            /* During & Post Execution Live Stream */
            <div className="space-y-5">
              {/* Progress status */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span className="text-slate-200">Broadcasting to Telecom Gateways Concurrently...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-200 font-semibold">Simultaneous Dispatch Sequence Finished</span>
                      </>
                    )}
                  </div>
                  <span className="font-mono text-slate-300 font-semibold">{progressPercent}%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Processed: {completedCount} / {absentStudents.length}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">Delivered: {deliveredCount}</span>
                    {failedCount > 0 && (
                      <span className="text-rose-400">Failed: {failedCount}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Transmission Stream */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Carrier Transmission Stream
                </div>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto bg-slate-50">
                  {absentStudents.map((student) => {
                    const item = progressMap[student.id];
                    const status = item ? item.status : 'PENDING';

                    return (
                      <div key={student.id} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {student.parentName}
                            <span className="font-normal text-slate-500 ml-1.5">
                              (ward: {student.name})
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-slate-400">
                            {student.parentPhone}
                          </div>
                        </div>

                        <div className="text-right">
                          {status === 'SENDING' && (
                            <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Carrier Dispatching</span>
                            </span>
                          )}
                          {status === 'DELIVERED' && (
                            <div className="text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>DELIVRD_200</span>
                            </div>
                          )}
                          {status === 'FAILED' && (
                            <div>
                              <div className="text-rose-600 font-semibold flex items-center gap-1 justify-end">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{item?.carrierCode || 'ERR_CARRIER'}</span>
                              </div>
                              <div className="text-[10px] text-rose-500 max-w-[180px] truncate" title={item?.error}>
                                {item?.error}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* If Finished, provide rapid testing shortcuts */}
              {isFinished && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Parent Notifications Dispatched</span>
                  </div>
                  <p className="text-emerald-800/90 leading-relaxed">
                    SMS payloads were transmitted concurrently to all recipient carriers. You can test the recipient parent experience immediately using the interactive Phone Simulator or audit the transmission in Delivery Logs.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {absentStudents[0] && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenSimulatorForParent(absentStudents[0].parentPhone);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-xs transition-colors"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Inspect in Parent Handset Simulator</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onClose();
                        onViewLogs();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-medium rounded-lg text-xs transition-colors"
                    >
                      <span>View Delivery Audit Logs</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {!isExecuting && !isFinished
              ? `Ready to broadcast ${absentStudents.length} messages simultaneously.`
              : isExecuting
              ? 'Transmitting via upstream telecom aggregator...'
              : 'Broadcast complete.'}
          </div>

          <div className="flex items-center gap-2">
            {!isFinished ? (
              <>
                <button
                  onClick={onClose}
                  disabled={isExecuting}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartSimultaneousDispatch}
                  disabled={isExecuting || absentStudents.length === 0}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Start Concurrent Broadcast Now</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close Window
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
