import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Minus,
  RotateCcw,
  Play,
  Pause,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldAlert,
  Building2,
  Home,
  Waves,
  Eye,
  Crosshair,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { POI } from './terrainData';
import { ScenarioData, AnalyticsMetric } from '../../types/navigation';

interface MapOverlayControlsProps {
  is3D: boolean;
  onToggle2D3D: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  onFocusDam: () => void;
  onFocusWaveFront: () => void;
  simulationTimeHours: number;
  maxTimeHours: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeekTime: (time: number) => void;
  playbackSpeed: number;
  onChangeSpeed: (spd: number) => void;
  selectedPOI: POI | null;
  onClosePOI: () => void;
  onEditPOI?: (poi: POI) => void;
  scenario: ScenarioData;
  activeMetric: AnalyticsMetric;
}

export const MapOverlayControls: React.FC<MapOverlayControlsProps> = ({
  is3D,
  onToggle2D3D,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onFocusDam,
  onFocusWaveFront,
  simulationTimeHours,
  maxTimeHours,
  isPlaying,
  onTogglePlay,
  onSeekTime,
  playbackSpeed,
  onChangeSpeed,
  selectedPOI,
  onClosePOI,
  onEditPOI,
  scenario,
  activeMetric,
}) => {
  const [legendOpen, setLegendOpen] = useState(true);

  // Time format helper: e.g. 1.25 hrs -> "01h 15m"
  const hours = Math.floor(simulationTimeHours);
  const minutes = Math.floor((simulationTimeHours - hours) * 60);
  const timeFormatted = `t+${hours.toString().padStart(2, '0')}h ${minutes
    .toString()
    .padStart(2, '0')}m`;

  // Wave front distance estimate
  const frontDistKm = ((simulationTimeHours / maxTimeHours) * 16.5).toFixed(1);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 overflow-hidden">
      {/* Top Header Controls Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: GIS Telemetry & Location Breadcrumb */}
        <div className="pointer-events-auto bg-[#090d16]/90 border border-[#1e293b] backdrop-blur-md px-3 py-2 rounded shadow-lg text-xs font-mono space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-100 uppercase tracking-wide">
              {scenario.dam}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300">
              {is3D ? '3D PERSPECTIVE' : '2D PLAN VIEW'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-3">
            <span>Grid: 5m DEM</span>
            <span>•</span>
            <span>Crest: {scenario.maxReservoirLevel}m</span>
            <span>•</span>
            <span>Lake: {scenario.reservoirLevel}m</span>
          </div>
        </div>

        {/* Top Right: View Controls (2D/3D, Compass, Zoom, Focus) */}
        <div className="pointer-events-auto flex flex-col gap-2 items-end">
          {/* Main 2D / 3D Toggle Pill */}
          <div className="bg-[#090d16]/90 border border-[#1e293b] backdrop-blur-md p-1 rounded flex items-center shadow-lg">
            <button
              id="btn-toggle-2d-3d"
              type="button"
              onClick={onToggle2D3D}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider font-mono transition-all cursor-pointer ${
                is3D
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {is3D ? '3D VIEW' : '2D VIEW'}
            </button>
            <button
              type="button"
              onClick={onToggle2D3D}
              className={`px-2 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                !is3D
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D
            </button>
          </div>

          {/* Camera Shortcuts & Compass */}
          <div className="bg-[#090d16]/90 border border-[#1e293b] backdrop-blur-md p-1 rounded flex flex-col gap-1 shadow-lg">
            <button
              type="button"
              id="btn-reset-north"
              onClick={onResetCamera}
              title="Reset North & Angle"
              className="w-8 h-8 rounded hover:bg-slate-800 text-cyan-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-zoom-in"
              onClick={onZoomIn}
              title="Zoom In"
              className="w-8 h-8 rounded hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-zoom-out"
              onClick={onZoomOut}
              title="Zoom Out"
              className="w-8 h-8 rounded hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="w-full h-[1px] bg-[#1e293b] my-0.5" />

            <button
              type="button"
              id="btn-focus-dam"
              onClick={onFocusDam}
              title="Focus on Dam Structure"
              className="w-8 h-8 rounded hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer text-[10px] font-mono font-bold"
            >
              DAM
            </button>

            <button
              type="button"
              id="btn-focus-front"
              onClick={onFocusWaveFront}
              title="Track Advancing Flood Wave"
              className="w-8 h-8 rounded hover:bg-slate-800 text-cyan-300 flex items-center justify-center transition-colors cursor-pointer text-[10px] font-mono font-bold"
            >
              WAVE
            </button>
          </div>
        </div>
      </div>

      {/* Center Floating POI Callout (When a marker is clicked) */}
      {selectedPOI && (
        <div className="pointer-events-auto mx-auto max-w-sm w-full bg-[#090d16]/95 border border-cyan-500/50 backdrop-blur-md p-3.5 rounded shadow-2xl space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <div>
                <h4 className="font-semibold text-slate-100">{selectedPOI.name}</h4>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {selectedPOI.type}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClosePOI}
              className="text-slate-400 hover:text-slate-200 text-sm font-mono px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {selectedPOI.details}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px] text-slate-400">
            <div className="bg-[#0f172a] p-1.5 rounded border border-[#1e293b]">
              <div>DISTANCE</div>
              <div className="text-cyan-300 font-bold mt-0.5">{selectedPOI.distanceFromDamKm} km</div>
            </div>
            <div className="bg-[#0f172a] p-1.5 rounded border border-[#1e293b]">
              <div>LEAD TIME</div>
              <div className="text-amber-300 font-bold mt-0.5">+{selectedPOI.arrivalMinutes} min</div>
            </div>
            <div className="bg-[#0f172a] p-1.5 rounded border border-[#1e293b]">
              <div>ELEVATION</div>
              <div className="text-slate-200 font-bold mt-0.5">{selectedPOI.elevation} m</div>
            </div>
          </div>

          {onEditPOI && (
            <div className="pt-1.5 flex justify-end">
              <button
                type="button"
                id="btn-poi-edit-props"
                onClick={() => onEditPOI(selectedPOI)}
                className="px-2.5 py-1 text-[11px] font-medium rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Edit Demo Properties</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Area: Legend on Left & Simulation Scrub Controls in Center */}
      <div className="flex items-end justify-between w-full gap-4">
        {/* Collapsible GIS Map Legend */}
        <div className="pointer-events-auto bg-[#090d16]/90 border border-[#1e293b] backdrop-blur-md rounded shadow-lg text-xs w-64 overflow-hidden">
          <div
            onClick={() => setLegendOpen((prev) => !prev)}
            className="px-3 py-2 border-b border-[#1e293b] flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-slate-200 font-medium text-[11px]">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>GIS MAP LEGEND</span>
            </div>
            {legendOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          {legendOpen && (
            <div className="p-3 space-y-2.5 text-[11px] text-slate-300">
              {/* Flood Depth Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Flood Depth</span>
                  <span>0m — 14.2m</span>
                </div>
                <div className="h-2 rounded bg-gradient-to-r from-sky-400 via-blue-600 via-amber-500 to-red-600" />
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>Low (&lt;0.5m)</span>
                  <span>Mod</span>
                  <span>Extreme (&gt;3m)</span>
                </div>
              </div>

              {/* Infrastructure Symbols */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#1a2333] text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                  <span>Pinecrest Dam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                  <span>Substations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  <span>Towns / Parcels</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span>Road Bridges</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Simulation Playback Scrubber Bar */}
        <div className="pointer-events-auto flex-1 max-w-xl bg-[#090d16]/95 border border-[#1e293b] backdrop-blur-md px-4 py-2.5 rounded shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                id="btn-playback-play"
                onClick={onTogglePlay}
                className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'bg-cyan-600 text-white hover:bg-cyan-500'
                }`}
                title={isPlaying ? 'Pause Simulation' : 'Play Flood Propagation'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-300 font-bold text-sm">
                    {timeFormatted}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    / 24h 00m
                  </span>
                </div>
              </div>
            </div>

            {/* Wave front status indicator */}
            <div className="text-[10px] font-mono text-slate-300 hidden sm:flex items-center gap-2">
              <span className="text-slate-400">Flood Wave Front:</span>
              <span className="text-amber-300 font-semibold">{frontDistKm} km downstream</span>
            </div>

            {/* Speed Multiplier (1x, 2x, 5x) */}
            <div className="flex items-center gap-1 font-mono text-[10px]">
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onChangeSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-[#111827] border-[#1e293b] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Progress Slider */}
          <div className="flex items-center gap-2">
            <input
              id="slider-flood-timeline"
              type="range"
              min="0"
              max={maxTimeHours}
              step="0.05"
              value={simulationTimeHours}
              onChange={(e) => onSeekTime(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
