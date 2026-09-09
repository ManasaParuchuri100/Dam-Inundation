import React from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  Crosshair,
  Shield,
  Layers,
  MapPin,
  Cpu,
  Activity,
  Waves,
} from 'lucide-react';
import { NavTabId, ScenarioData } from '../types/navigation';

interface ViewportCanvasProps {
  scenario: ScenarioData;
  activeTab: NavTabId | null;
  isSubpanelOpen: boolean;
  simulationStatus: 'idle' | 'running' | 'completed';
  simProgress: number;
}

export const ViewportCanvas: React.FC<ViewportCanvasProps> = ({
  scenario,
  activeTab,
  isSubpanelOpen,
  simulationStatus,
  simProgress,
}) => {
  return (
    <main
      id="gis-canvas-viewport"
      className="flex-1 h-full relative overflow-hidden bg-[#070b12] flex flex-col justify-between select-none"
    >
      {/* Subtle GIS Graticule Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Coordinate Reticle in Canvas Center */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="relative w-64 h-64 border border-dashed border-cyan-500/30 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <div className="absolute top-0 w-[1px] h-4 bg-cyan-400" />
          <div className="absolute bottom-0 w-[1px] h-4 bg-cyan-400" />
          <div className="absolute left-0 h-[1px] w-4 bg-cyan-400" />
          <div className="absolute right-0 h-[1px] w-4 bg-cyan-400" />
        </div>
      </div>

      {/* Top Telemetry Bar */}
      <div className="relative z-10 px-5 py-3 flex items-center justify-between border-b border-[#141d2b]/80 bg-[#080d16]/70 backdrop-blur-sm text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>HYDRO-RISK 2D</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 truncate max-w-[280px]">
            {scenario.dam}
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:inline text-cyan-300/90">
            {scenario.name}
          </span>
        </div>

        {/* Right Tools: Compass & Scale */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">GPU SOLVER READY</span>
          </div>

          <div
            id="gis-compass-indicator"
            className="w-7 h-7 rounded border border-[#1e293b] bg-[#0c121e] flex items-center justify-center text-cyan-400 shadow-sm"
            title="Grid Orientation: True North"
          >
            <Compass className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Center Informational Staging Card (Aesthetic, non-invasive) */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 pointer-events-none">
        <div className="max-w-md w-full bg-[#0d131f]/85 border border-[#1e293b] backdrop-blur-md p-6 rounded text-center space-y-3 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center">
            <Waves className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">
              Hydraulic Modeling Workspace
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Professional Dam-Break Navigation Station. Select hydraulic parameters in the left panel to configure breach geometry, evaluate flood analytics, and manage spatial layers.
            </p>
          </div>

          {/* Key Simulation Context Strip */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1a2333] text-[10px] font-mono text-slate-300">
            <div className="bg-[#080d16] p-2 rounded border border-[#162030]">
              <div className="text-slate-500">RESERVOIR</div>
              <div className="font-bold text-cyan-300 text-xs mt-0.5">{scenario.reservoirLevel} m</div>
            </div>
            <div className="bg-[#080d16] p-2 rounded border border-[#162030]">
              <div className="text-slate-500">BREACH WIDTH</div>
              <div className="font-bold text-cyan-300 text-xs mt-0.5">{scenario.breachWidth} m</div>
            </div>
            <div className="bg-[#080d16] p-2 rounded border border-[#162030]">
              <div className="text-slate-500">SIM RUNTIME</div>
              <div className="font-bold text-cyan-300 text-xs mt-0.5">{scenario.simulationDuration} hrs</div>
            </div>
          </div>

          {simulationStatus === 'running' && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Simulating Shallow Water Wave Front... {simProgress}%
              </span>
            </div>
          )}

          {simulationStatus === 'completed' && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Hydrodynamic Solution Converged (24h)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom GIS Status and Scale Bar */}
      <footer
        id="gis-status-bar"
        className="relative z-10 px-5 py-2.5 border-t border-[#141d2b] bg-[#080d16]/90 backdrop-blur-sm flex items-center justify-between text-[10px] font-mono text-slate-400"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">CRS:</span>
            <span className="text-slate-300">WGS 84 / UTM Zone 12N (EPSG:32612)</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">CURSOR:</span>
            <span className="text-slate-300">39°44'21" N, 104°59'25" W</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">ELEV: 1,422 m MSL</span>
        </div>

        {/* GIS Scale Bar */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[9px]">SCALE:</span>
          <div className="flex flex-col items-center">
            <div className="w-24 h-1 border-b-2 border-l-2 border-r-2 border-cyan-400/80" />
            <span className="text-[8px] text-cyan-300 font-mono mt-0.5">2.5 km</span>
          </div>
        </div>
      </footer>
    </main>
  );
};
