import React from 'react';
import {
  Sliders,
  BarChart3,
  Layers,
  FileText,
  Settings,
  Waves,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { NavTabId } from '../types/navigation';

interface MainRailProps {
  activeTab: NavTabId | null;
  isOpen: boolean;
  onSelectTab: (tab: NavTabId) => void;
  onTogglePanel: () => void;
  simulationStatus: 'idle' | 'running' | 'completed';
  simProgress: number;
}

interface TabConfig {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const TABS: TabConfig[] = [
  { id: 'scenario', label: 'Scenario', icon: Sliders },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'layers', label: 'Layers', icon: Layers, badge: '9' },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const MainRail: React.FC<MainRailProps> = ({
  activeTab,
  isOpen,
  onSelectTab,
  onTogglePanel,
  simulationStatus,
  simProgress,
}) => {
  return (
    <aside
      id="main-navigation-rail"
      aria-label="Main Navigation"
      className="w-[60px] h-full bg-[#080c14] border-r border-[#1a2333] flex flex-col justify-between items-center py-2.5 z-30 shrink-0 select-none"
    >
      {/* Top Branding Section */}
      <div className="flex flex-col items-center w-full px-1.5">
        <div
          id="brand-logo"
          title="HydroBreak 2D Dam Simulation System"
          className="w-9 h-9 rounded border border-cyan-500/30 bg-cyan-950/40 flex items-center justify-center text-cyan-400 hover:border-cyan-400/60 transition-all cursor-pointer group shadow-sm shadow-cyan-950/50 relative"
          onClick={() => onSelectTab('scenario')}
        >
          <Waves className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          {/* Status pip */}
          <span
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#080c14] ${
              simulationStatus === 'running'
                ? 'bg-amber-400 animate-ping'
                : simulationStatus === 'completed'
                ? 'bg-emerald-400'
                : 'bg-cyan-400'
            }`}
          />
        </div>
        <div className="text-[9px] font-mono tracking-widest text-slate-400 mt-1 font-semibold uppercase">
          HYDRO
        </div>

        {/* Status Indicator */}
        <div
          className="mt-2 w-full px-1 py-0.5 rounded bg-[#0f172a] border border-[#1e293b] flex items-center justify-center gap-1 text-[8px] font-mono text-slate-400"
          title={
            simulationStatus === 'running'
              ? `Hydraulic Solver active (${simProgress}%)`
              : simulationStatus === 'completed'
              ? 'Simulation results loaded'
              : 'Solver Engine: Standby'
          }
        >
          {simulationStatus === 'running' ? (
            <Loader2 className="w-2 h-2 text-amber-400 animate-spin" />
          ) : simulationStatus === 'completed' ? (
            <CheckCircle2 className="w-2 h-2 text-emerald-400" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          )}
          <span className="text-[7.5px] tracking-wider uppercase font-semibold">
            {simulationStatus === 'running'
              ? `${simProgress}%`
              : simulationStatus === 'completed'
              ? 'SOLVED'
              : '2D'}
          </span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="flex flex-col items-center gap-1 w-full px-1.5 my-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id && isOpen;
          const isTabActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              aria-label={`Open ${tab.label} panel`}
              aria-selected={isSelected}
              className={`group relative w-full h-[52px] rounded flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 shadow-inner'
                  : isTabActive
                  ? 'bg-slate-900/90 text-slate-200 border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              {/* Left Accent indicator line */}
              {isSelected && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyan-400 rounded-r shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-4 h-4 transition-transform duration-150 ${
                    isSelected ? 'text-cyan-300 scale-105' : 'group-hover:scale-110'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[7px] font-mono font-bold rounded bg-slate-800 text-cyan-400 border border-slate-700 leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[9px] mt-1 font-medium tracking-tight transition-colors ${
                  isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Rail Footer Controls */}
      <div className="flex flex-col items-center w-full px-2 gap-2">
        {/* Toggle subpanel chevron */}
        <button
          id="btn-toggle-subpanel"
          onClick={onTogglePanel}
          title={isOpen ? 'Collapse Sub-Panel' : 'Expand Sub-Panel'}
          className="w-10 h-8 rounded border border-[#1e293b] bg-[#0d131f] hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Coordinates / CRS Mini indicator */}
        <div className="text-[8px] font-mono text-slate-400 tracking-tighter text-center">
          UTM 12N
        </div>
      </div>
    </aside>
  );
};
