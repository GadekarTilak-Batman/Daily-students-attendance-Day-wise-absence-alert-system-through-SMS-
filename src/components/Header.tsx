import React from 'react';
import { ActiveTab } from '../types';
import { BellRing, CheckSquare, FileText, Smartphone, BarChart3, Network, Sliders } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  pendingAbsentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  pendingAbsentCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
              MT
            </div>
            <button
              onClick={() => onTabChange('attendance')}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors text-left"
            >
              MTCET Alert
            </button>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium truncate max-w-[320px]">
              Mother Theressa College of Engg & Tech, Peddapalli
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
            <button
              onClick={() => onTabChange('attendance')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'attendance'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-slate-500" />
              <span>Roll Call & Attendance</span>
              {pendingAbsentCount > 0 && (
                <span className="ml-1 text-xs px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-mono font-medium">
                  {pendingAbsentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('dispatch-logs')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dispatch-logs'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Delivery Logs & Resend</span>
            </button>

            <button
              onClick={() => onTabChange('phone-simulator')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'phone-simulator'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Parent Handset Simulator</span>
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span>Analytics & Watchlist</span>
            </button>

            <button
              onClick={() => onTabChange('architecture')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'architecture'
                  ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Network className="w-4 h-4 text-blue-600" />
              <span>Technical Blueprint</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              title="SMS Gateway & Template Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Gateway Settings</span>
            </button>

            {pendingAbsentCount > 0 ? (
              <button
                onClick={() => onTabChange('attendance')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{pendingAbsentCount} Absent Alert</span>
              </button>
            ) : (
              <button
                onClick={() => onTabChange('architecture')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Architecture Blueprint</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 border-t border-slate-100 gap-1.5 text-xs font-medium">
          <button
            onClick={() => onTabChange('attendance')}
            className={`px-3 py-1.5 rounded whitespace-nowrap shrink-0 ${
              activeTab === 'attendance' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Roll Call ({pendingAbsentCount} Absent)
          </button>
          <button
            onClick={() => onTabChange('dispatch-logs')}
            className={`px-3 py-1.5 rounded whitespace-nowrap shrink-0 ${
              activeTab === 'dispatch-logs' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Delivery Logs
          </button>
          <button
            onClick={() => onTabChange('phone-simulator')}
            className={`px-3 py-1.5 rounded whitespace-nowrap shrink-0 ${
              activeTab === 'phone-simulator' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Parent Simulator
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-1.5 rounded whitespace-nowrap shrink-0 ${
              activeTab === 'analytics' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Analytics & Watchlist
          </button>
          <button
            onClick={() => onTabChange('architecture')}
            className={`px-3 py-1.5 rounded whitespace-nowrap shrink-0 ${
              activeTab === 'architecture' ? 'bg-blue-600 text-white font-semibold' : 'text-blue-700 bg-blue-50'
            }`}
          >
            Blueprint
          </button>
        </div>
      </div>
    </header>
  );
};
