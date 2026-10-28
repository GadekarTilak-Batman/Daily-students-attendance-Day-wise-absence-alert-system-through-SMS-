import React, { useState } from 'react';
import { SmsGatewaySettings } from '../types';
import { DEFAULT_TEMPLATE } from '../data/mockStudents';
import { playChime } from '../services/smsService';
import { 
  X, 
  Sliders, 
  Send, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Radio, 
  Volume2, 
  VolumeX,
  Smartphone
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SmsGatewaySettings;
  onSaveSettings: (settings: SmsGatewaySettings) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetAllData,
}) => {
  const [formData, setFormData] = useState<SmsGatewaySettings>(settings);
  const [testPhoneNumber, setTestPhoneNumber] = useState('+1 (555) 999-8877');
  const [testSentSuccess, setTestSentSuccess] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  if (!isOpen) return null;

  const availableTokens = [
    { token: '{parent_name}', label: 'Parent Name' },
    { token: '{student_name}', label: 'Student Name' },
    { token: '{roll_no}', label: 'Roll Number' },
    { token: '{date}', label: 'Attendance Date' },
    { token: '{day_name}', label: 'Day Name' },
    { token: '{classes}', label: 'Scheduled Classes' },
    { token: '{college_name}', label: 'College Name' },
    { token: '{admin_phone}', label: 'Office Phone' },
  ];

  const handleInsertToken = (token: string) => {
    setFormData(prev => ({
      ...prev,
      template: prev.template + ' ' + token
    }));
  };

  const handleSendTestPing = async () => {
    setIsSendingTest(true);
    setTestSentSuccess(false);

    if (formData.enableAudioChime) {
      playChime('start');
    }

    await new Promise(r => setTimeout(r, 600));

    if (formData.enableAudioChime) {
      playChime('success');
    }

    setIsSendingTest(false);
    setTestSentSuccess(true);
    setTimeout(() => setTestSentSuccess(false), 3500);
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all attendance, logs, and settings to factory defaults?')) {
      onResetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                SMS Gateway & Template Settings
              </h2>
              <p className="text-xs text-slate-300">
                Configure carrier upstream providers, DLT sender IDs, and dynamic placeholder tokens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Provider & Sender Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Active SMS Gateway Provider
              </label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value as SmsGatewaySettings['provider'] })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
              >
                <option value="SIMULATED">Simulated Telecom Gateway (Carrier-Grade)</option>
                <option value="TWILIO">Twilio Programmable Messaging (REST / SMPP)</option>
                <option value="AWS_SNS">Amazon Web Services Simple Notification (AWS SNS)</option>
                <option value="INFOBIP">Infobip Enterprise SMS Gateway</option>
                <option value="MSG91">MSG91 Transactional DLT Route</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Sender ID (Header)
              </label>
              <input
                type="text"
                value={formData.senderId}
                onChange={(e) => setFormData({ ...formData, senderId: e.target.value.toUpperCase() })}
                placeholder="CAMPUS-ALRT"
                maxLength={11}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Up to 11 alphanumeric characters registered with telecom authority
              </span>
            </div>
          </div>

          {/* College Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                College / Institution Name
              </label>
              <input
                type="text"
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dean / Admin Contact Phone
              </label>
              <input
                type="text"
                value={formData.adminPhone}
                onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
              />
            </div>
          </div>

          {/* Dynamic Template Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Parent Absence SMS Template (DLT Registered)
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, template: DEFAULT_TEMPLATE })}
                className="text-[11px] text-blue-600 hover:underline"
              >
                Reset to Standard Template
              </button>
            </div>

            <textarea
              rows={4}
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            {/* Token helper chips */}
            <div>
              <div className="text-[11px] text-slate-500 mb-1.5 font-medium">
                Click to insert dynamic token at cursor:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableTokens.map((item) => (
                  <button
                    key={item.token}
                    type="button"
                    onClick={() => handleInsertToken(item.token)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono border border-slate-200 transition-colors"
                  >
                    + {item.token}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Controls: Failure Rate & Audio */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">
                  Simulated Carrier Failure Rate ({formData.simulatedFailureRatePct}%)
                </div>
                <div className="text-[11px] text-slate-500">
                  Injects realistic carrier timeouts (e.g. 504 Gateway Timeout) to test the retry and resend recovery engine
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={formData.simulatedFailureRatePct}
                onChange={(e) => setFormData({ ...formData, simulatedFailureRatePct: parseInt(e.target.value, 10) })}
                className="w-32 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {formData.enableAudioChime ? (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <div className="font-bold text-slate-900 text-xs">Operational Audio Cues</div>
                  <div className="text-[11px] text-slate-500">Play subtle synthesizer chimes during batch broadcast</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableAudioChime}
                onChange={(e) => setFormData({ ...formData, enableAudioChime: e.target.checked })}
                className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Test SMS Ping Tool */}
          <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                  <span>Test SMS Ping Transmitter</span>
                </h4>
                <p className="text-[11px] text-blue-800/80">
                  Verify telecom gateway connectivity with a simulated ping to any test handset
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleSendTestPing}
                disabled={isSendingTest}
                className="flex items-center gap-1 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>{isSendingTest ? 'Pinging...' : 'Send Test Ping'}</span>
              </button>
            </div>

            {testSentSuccess && (
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-100/70 p-2 rounded-lg border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Test SMS packet DELIVRD_200 acknowledged by gateway!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
