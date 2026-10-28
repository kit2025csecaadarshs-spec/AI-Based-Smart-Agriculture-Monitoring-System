import React from 'react';
import { Sprout, Wifi, Cpu, Box } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertsCount: number;
  onOpenDiagnosticModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  onOpenDiagnosticModal,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
          <Sprout className="w-5 h-5" />
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('overview');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 hover:text-emerald-600 transition-colors whitespace-nowrap shrink-0"
        >
          AgriSense <span className="text-emerald-600">AI</span>
        </a>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'text-emerald-700 border-emerald-600 font-semibold'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Telemetry & 3D Twin
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'zones'
              ? 'text-emerald-700 border-emerald-600 font-semibold'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Field Parcels
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'text-emerald-700 border-emerald-600 font-semibold'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          AI Plant Pathology
        </button>
        <button
          onClick={() => setActiveTab('irrigation')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'irrigation'
              ? 'text-emerald-700 border-emerald-600 font-semibold'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Irrigation & Nutrients
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'copilot'
              ? 'text-emerald-700 border-emerald-600 font-semibold'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Agronomy Copilot
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`relative transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'alerts'
              ? 'text-emerald-700 border-emerald-600 font-semibold'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Alerts
          {unreadAlertsCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-100 text-amber-800 rounded border border-amber-300">
              {unreadAlertsCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border-r border-slate-200 pr-3">
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-mono text-slate-600">24 Nodes Mesh</span>
        </div>
        <button
          onClick={onOpenDiagnosticModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-emerald-600/20 cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Quick Disease Scan</span>
        </button>
      </div>
    </header>
  );
};
