import React, { useState } from 'react';
import { SmsLog } from '../types';
import { 
  RotateCw, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Smartphone, 
  Edit3, 
  Download, 
  Check, 
  MessageSquare,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface SmsLogViewerProps {
  logs: SmsLog[];
  onResendSingle: (log: SmsLog) => void;
  onBulkResendFailed: () => void;
  onEditPhoneAndResend: (logId: string, newPhone: string) => void;
  onOpenParentSimulator: (phone: string) => void;
}

export const SmsLogViewer: React.FC<SmsLogViewerProps> = ({
  logs,
  onResendSingle,
  onBulkResendFailed,
  onEditPhoneAndResend,
  onOpenParentSimulator,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'FAILED' | 'ACKNOWLEDGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<SmsLog | null>(null);
  
  // Edit Phone Modal state
  const [editingLog, setEditingLog] = useState<SmsLog | null>(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const failedLogs = logs.filter(l => l.status === 'FAILED');

  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesSearch = 
      log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.parentPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = ['MessageID', 'RollNo', 'StudentName', 'ParentName', 'ParentPhone', 'Date', 'Day', 'Status', 'CarrierCode', 'SentAt', 'DeliveredAt', 'RetryCount', 'ParentResponse'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.rollNo,
      `"${l.studentName}"`,
      `"${l.parentName}"`,
      `"${l.parentPhone}"`,
      `"${l.date}"`,
      `"${l.dayName || ''}"`,
      l.status,
      l.carrierCode,
      l.sentAt,
      l.deliveredAt || '',
      l.retryCount,
      `"${l.acknowledgement?.replyText || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sms_attendance_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartEditPhone = (log: SmsLog) => {
    setEditingLog(log);
    setNewPhoneNumber(log.parentPhone);
  };

  const handleSavePhoneAndResend = () => {
    if (editingLog && newPhoneNumber.trim()) {
      onEditPhoneAndResend(editingLog.id, newPhoneNumber.trim());
      setEditingLog(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              SMS Delivery Logs & Resend Engine
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive telecommunication audit trail tracking real-time delivery receipts (DLR) and 2-way parent replies
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {failedLogs.length > 0 && (
              <button
                onClick={onBulkResendFailed}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Resend All {failedLogs.length} Failed Alerts</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV Audit</span>
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Logs ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('DELIVERED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'DELIVERED' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              Delivered ({logs.filter(l => l.status === 'DELIVERED').length})
            </button>
            <button
              onClick={() => setStatusFilter('FAILED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'FAILED' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-rose-800'
              }`}
            >
              Failed ({failedLogs.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACKNOWLEDGED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'ACKNOWLEDGED' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-blue-800'
              }`}
            >
              Acknowledged ({logs.filter(l => l.status === 'ACKNOWLEDGED').length})
            </button>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, roll no, parent phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Parent Recipient</th>
                <th className="py-3 px-4">Message Snippet</th>
                <th className="py-3 px-4">Carrier Status</th>
                <th className="py-3 px-4 text-center">Retries</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No SMS transmission logs match your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isFailed = log.status === 'FAILED';
                  const isAck = log.status === 'ACKNOWLEDGED';
                  const isDelivered = log.status === 'DELIVERED';

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isFailed ? 'bg-rose-50/20' : isAck ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <div>{log.sentAt}</div>
                        <div className="text-[10px] text-slate-400">{log.dayName ? `${log.dayName} · ${log.date}` : log.date}</div>
                      </td>

                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{log.studentName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{log.rollNo}</div>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{log.parentName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{log.parentPhone}</div>
                      </td>

                      {/* Snippet */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <p className="text-slate-600 truncate text-[11px] cursor-pointer hover:text-slate-900"
                           onClick={() => setSelectedLogForDetails(log)}
                           title="Click to view full message"
                        >
                          {log.messageContent}
                        </p>
                        {log.acknowledgement && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">Reply: &ldquo;{log.acknowledgement.replyText}&rdquo;</span>
                          </div>
                        )}
                      </td>

                      {/* Carrier Status */}
                      <td className="py-3 px-4">
                        {isDelivered && (
                          <div>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Delivered</span>
                            </span>
                            <div className="font-mono text-[10px] text-slate-400">{log.carrierCode}</div>
                          </div>
                        )}
                        {isFailed && (
                          <div>
                            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Failed</span>
                            </span>
                            <div className="font-mono text-[10px] text-rose-600 font-medium">
                              {log.carrierCode}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[150px]" title={log.failureReason}>
                              {log.failureReason}
                            </div>
                          </div>
                        )}
                        {isAck && (
                          <div>
                            <span className="inline-flex items-center gap-1 text-blue-700 font-semibold text-[11px]">
                              <Check className="w-3.5 h-3.5 text-blue-600" />
                              <span>Acknowledged</span>
                            </span>
                            <div className="text-[10px] text-blue-600">
                              {log.acknowledgement?.excuseType}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Retry Count */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                        {log.retryCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {log.retryCount}x
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {isFailed ? (
                            <>
                              <button
                                onClick={() => handleStartEditPhone(log)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Edit Phone Number & Resend"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onResendSingle(log)}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors"
                              >
                                <RotateCw className="w-3 h-3 text-rose-600" />
                                <span>Resend</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => onOpenParentSimulator(log.parentPhone)}
                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                title="Inspect in Phone Simulator"
                              >
                                <Smartphone className="w-3 h-3 text-slate-500" />
                                <span>Handset</span>
                              </button>
                              <button
                                onClick={() => onResendSingle(log)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                title="Send duplicate alert"
                              >
                                <RotateCw className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Phone & Resend Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Correct Parent Phone & Trigger Resend
              </h3>
              <button
                onClick={() => setEditingLog(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Student: <strong className="text-slate-900">{editingLog.studentName}</strong> ({editingLog.rollNo})
              </p>
              <p>
                Parent: <strong className="text-slate-900">{editingLog.parentName}</strong>
              </p>
              <p className="text-rose-600 font-mono text-[11px]">
                Previous Failure: {editingLog.carrierCode} - {editingLog.failureReason}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Updated Parent Mobile Number
              </label>
              <input
                type="text"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard E.164 or formatted mobile phone number
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingLog(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePhoneAndResend}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                Save Phone & Resend SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Details Inspector Modal */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Carrier Transmission Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Message UUID</span>
                  <span className="font-mono text-slate-800 font-medium">{selectedLogForDetails.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Carrier DLR Code</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedLogForDetails.carrierCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Student / Roll</span>
                  <span className="text-slate-800">{selectedLogForDetails.studentName} ({selectedLogForDetails.rollNo})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Parent Handset</span>
                  <span className="font-mono text-slate-800">{selectedLogForDetails.parentPhone}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Transmitted Text Payload
                </label>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedLogForDetails.messageContent}
                </div>
              </div>

              {selectedLogForDetails.acknowledgement && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1">
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span>Inbound Parent Response ({selectedLogForDetails.acknowledgement.excuseType})</span>
                    <span className="font-mono text-[10px]">{selectedLogForDetails.acknowledgement.repliedAt}</span>
                  </div>
                  <p className="text-xs">&ldquo;{selectedLogForDetails.acknowledgement.replyText}&rdquo;</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
