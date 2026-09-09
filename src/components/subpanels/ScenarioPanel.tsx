import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Sliders,
  ChevronDown,
  Info,
  MapPin,
  Mountain,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { ScenarioData } from '../../types/navigation';
import { DAM_PRESETS, SCENARIO_PRESETS, DEFAULT_SCENARIO } from '../../data/defaults';

interface ScenarioPanelProps {
  scenario: ScenarioData;
  onChange: (updated: Partial<ScenarioData>) => void;
  onReset: () => void;
  onRunSimulation: () => void;
  simulationStatus: 'idle' | 'running' | 'completed';
  simProgress: number;
}

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({
  scenario,
  onChange,
  onReset,
  onRunSimulation,
  simulationStatus,
  simProgress,
}) => {
  const [resetConfirmNotice, setResetConfirmNotice] = useState(false);

  const handleReset = () => {
    onReset();
    setResetConfirmNotice(true);
    setTimeout(() => setResetConfirmNotice(false), 2200);
  };

  // Calculate reservoir fill ratio
  const fillPercentage = Math.min(
    100,
    Math.round((scenario.reservoirLevel / scenario.maxReservoirLevel) * 100)
  );

  const freeboard = (scenario.maxReservoirLevel - scenario.reservoirLevel).toFixed(1);

  return (
    <div id="subpanel-scenario" className="flex flex-col h-full bg-[#0d131f]">
      {/* Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center justify-between shrink-0 bg-[#0a0f18]/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Simulation Scenario
            </h2>
            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase">
              2D Finite-Volume
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Configure hydraulic dam-break parameters and initial boundary conditions
          </p>
        </div>

        {resetConfirmNotice && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 animate-fade-in">
            <Check className="w-3 h-3" /> Defaults Restored
          </span>
        )}
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-5 text-xs text-slate-300">
        {/* Preset quick picker */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Quick Scenario Presets
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {SCENARIO_PRESETS.map((preset, idx) => {
              const isSelected = scenario.name === preset.name;
              return (
                <button
                  key={idx}
                  type="button"
                  id={`preset-btn-${idx}`}
                  onClick={() =>
                    onChange({
                      name: preset.name,
                      breachWidth: preset.breachWidth,
                      breachFormationTime: preset.breachFormationTime,
                      breachType: preset.breachType,
                      reservoirLevel: preset.reservoirLevel,
                    })
                  }
                  className={`text-left px-2.5 py-1.5 rounded text-[11px] border transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                      : 'bg-[#111827]/70 border-[#1f293d] text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="truncate">{preset.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Scenario Identification */}
        <div className="space-y-3 pt-1 border-t border-[#1a2333]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/90 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Scenario Identity
            </span>
          </div>

          <div>
            <label
              htmlFor="scenario-name-input"
              className="text-[11px] text-slate-400 block mb-1"
            >
              Scenario Name
            </label>
            <input
              id="scenario-name-input"
              type="text"
              value={scenario.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full bg-[#111827] border border-[#1f293d] focus:border-cyan-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label
              htmlFor="reservoir-select"
              className="text-[11px] text-slate-400 block mb-1"
            >
              Dam / Reservoir
            </label>
            <div className="relative">
              <select
                id="reservoir-select"
                value={scenario.dam}
                onChange={(e) => {
                  const selectedDam = DAM_PRESETS.find((d) => d.name === e.target.value);
                  if (selectedDam) {
                    onChange({
                      dam: selectedDam.name,
                      location: selectedDam.location,
                      damHeight: selectedDam.height,
                      maxReservoirLevel: selectedDam.crestElevation,
                      reservoirLevel: Number((selectedDam.crestElevation - 3.5).toFixed(1)),
                      reservoirVolume: selectedDam.nominalStorage,
                    });
                  } else {
                    onChange({ dam: e.target.value });
                  }
                }}
                className="w-full bg-[#111827] border border-[#1f293d] focus:border-cyan-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100 appearance-none cursor-pointer pr-8"
              >
                {DAM_PRESETS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.type})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="location-input"
              className="text-[11px] text-slate-400 block mb-1"
            >
              Location / Domain Extent
            </label>
            <div className="flex items-center gap-1.5 bg-[#111827] border border-[#1f293d] rounded px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <input
                id="location-input"
                type="text"
                value={scenario.location}
                onChange={(e) => onChange({ location: e.target.value })}
                className="w-full bg-transparent border-0 focus:outline-none text-[11px] text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dam Parameters */}
        <div className="space-y-3 pt-2 border-t border-[#1a2333]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/90 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Dam & Reservoir Parameters
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Crest: {scenario.maxReservoirLevel} m
            </span>
          </div>

          {/* Reservoir Level */}
          <div className="space-y-1.5 bg-[#111827]/60 p-2.5 rounded border border-[#1e293b]">
            <div className="flex items-center justify-between">
              <label htmlFor="reservoir-level-input" className="text-[11px] text-slate-300">
                Reservoir Water Level
              </label>
              <div className="flex items-center gap-1 font-mono text-cyan-300">
                <input
                  id="reservoir-level-input"
                  type="number"
                  step="0.1"
                  min="50"
                  max={scenario.maxReservoirLevel}
                  value={scenario.reservoirLevel}
                  onChange={(e) => onChange({ reservoirLevel: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-[#090d16] border border-[#1e293b] rounded px-1.5 py-0.5 text-right text-xs focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">m</span>
              </div>
            </div>

            <input
              id="reservoir-level-slider"
              type="range"
              min="80"
              max={scenario.maxReservoirLevel}
              step="0.5"
              value={scenario.reservoirLevel}
              onChange={(e) => onChange({ reservoirLevel: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
              <span className="flex items-center gap-1">
                Fill: <strong className="text-slate-200">{fillPercentage}%</strong>
              </span>
              <span className="text-amber-300/90">
                Freeboard: {freeboard} m
              </span>
            </div>
          </div>

          {/* Dam Height & Reservoir Volume */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#111827]/60 p-2 rounded border border-[#1e293b]">
              <label htmlFor="dam-height-input" className="text-[10px] text-slate-400 block mb-1">
                Dam Height
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="dam-height-input"
                  type="number"
                  step="1"
                  min="10"
                  max="300"
                  value={scenario.damHeight}
                  onChange={(e) => onChange({ damHeight: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#090d16] border border-[#1e293b] rounded px-1.5 py-0.5 text-right font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] font-mono text-slate-400">m</span>
              </div>
            </div>

            <div className="bg-[#111827]/60 p-2 rounded border border-[#1e293b]">
              <label htmlFor="reservoir-volume-input" className="text-[10px] text-slate-400 block mb-1">
                Reservoir Volume
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="reservoir-volume-input"
                  type="number"
                  step="0.5"
                  min="1"
                  max="1000"
                  value={scenario.reservoirVolume}
                  onChange={(e) => onChange({ reservoirVolume: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#090d16] border border-[#1e293b] rounded px-1.5 py-0.5 text-right font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] font-mono text-slate-400">Mm³</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Breach Parameters */}
        <div className="space-y-3 pt-2 border-t border-[#1a2333]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/90 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Breach Parameters (Froehlich / MacDonald)
            </span>
          </div>

          {/* Breach Width */}
          <div className="space-y-1.5 bg-[#111827]/60 p-2.5 rounded border border-[#1e293b]">
            <div className="flex items-center justify-between">
              <label htmlFor="breach-width-input" className="text-[11px] text-slate-300">
                Final Breach Width (B_avg)
              </label>
              <div className="flex items-center gap-1 font-mono text-cyan-300">
                <input
                  id="breach-width-input"
                  type="number"
                  step="1"
                  min="5"
                  max="400"
                  value={scenario.breachWidth}
                  onChange={(e) => onChange({ breachWidth: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-[#090d16] border border-[#1e293b] rounded px-1.5 py-0.5 text-right text-xs focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">m</span>
              </div>
            </div>
            <input
              id="breach-width-slider"
              type="range"
              min="10"
              max="250"
              step="5"
              value={scenario.breachWidth}
              onChange={(e) => onChange({ breachWidth: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Breach Formation Time */}
          <div className="space-y-1.5 bg-[#111827]/60 p-2.5 rounded border border-[#1e293b]">
            <div className="flex items-center justify-between">
              <label htmlFor="formation-time-input" className="text-[11px] text-slate-300">
                Breach Formation Time (t_f)
              </label>
              <div className="flex items-center gap-1 font-mono text-cyan-300">
                <input
                  id="formation-time-input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="12"
                  value={scenario.breachFormationTime}
                  onChange={(e) => onChange({ breachFormationTime: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-[#090d16] border border-[#1e293b] rounded px-1.5 py-0.5 text-right text-xs focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">hrs</span>
              </div>
            </div>
            <input
              id="formation-time-slider"
              type="range"
              min="0.2"
              max="6.0"
              step="0.1"
              value={scenario.breachFormationTime}
              onChange={(e) => onChange({ breachFormationTime: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Rapid (0.3h)</span>
              <span>Gradual (5.0h)</span>
            </div>
          </div>

          {/* Breach Type */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Breach Mechanism
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['overtopping', 'piping', 'structural'] as const).map((type) => {
                const isActive = scenario.breachType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    id={`breach-type-${type}`}
                    onClick={() => onChange({ breachType: type })}
                    className={`py-1.5 px-2 rounded text-[10px] font-medium tracking-wide uppercase transition-colors border ${
                      isActive
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-[#111827] border-[#1e293b] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Simulation Runtime */}
        <div className="space-y-3 pt-2 border-t border-[#1a2333]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/90 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Numerical Solver & Time Step
            </span>
          </div>

          {/* Simulation Duration */}
          <div className="space-y-1.5 bg-[#111827]/60 p-2.5 rounded border border-[#1e293b]">
            <div className="flex items-center justify-between">
              <label htmlFor="duration-input" className="text-[11px] text-slate-300">
                Simulation Duration
              </label>
              <div className="flex items-center gap-1 font-mono text-cyan-300">
                <input
                  id="duration-input"
                  type="number"
                  step="1"
                  min="2"
                  max="120"
                  value={scenario.simulationDuration}
                  onChange={(e) => onChange({ simulationDuration: parseInt(e.target.value) || 1 })}
                  className="w-16 bg-[#090d16] border border-[#1e293b] rounded px-1.5 py-0.5 text-right text-xs focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">hrs</span>
              </div>
            </div>
            <input
              id="duration-slider"
              type="range"
              min="4"
              max="72"
              step="2"
              value={scenario.simulationDuration}
              onChange={(e) => onChange({ simulationDuration: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Time Step */}
          <div>
            <label htmlFor="timestep-select" className="text-[11px] text-slate-400 block mb-1">
              Courant Condition / Time Step
            </label>
            <div className="relative">
              <select
                id="timestep-select"
                value={scenario.timeStep}
                onChange={(e) => onChange({ timeStep: e.target.value })}
                className="w-full bg-[#111827] border border-[#1f293d] focus:border-cyan-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100 appearance-none cursor-pointer pr-8 font-mono"
              >
                <option value="0.5s (High Precision CFL ≤ 0.5)">0.5s (High Precision CFL ≤ 0.5)</option>
                <option value="1.0s (Adaptive CFL ≤ 0.8)">1.0s (Adaptive CFL ≤ 0.8) [Recommended]</option>
                <option value="2.0s (Fast Preview CFL ≤ 1.0)">2.0s (Fast Preview CFL ≤ 1.0)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3.5 border-t border-[#1e293b] bg-[#0a0f18] space-y-2 shrink-0">
        {/* Progress bar during run */}
        {simulationStatus === 'running' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-300">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Solving 2D Shallow Water Equations...
              </span>
              <span>{simProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-amber-400 h-full transition-all duration-200"
                style={{ width: `${simProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Run Simulation Button */}
        <button
          id="btn-run-simulation"
          type="button"
          disabled={simulationStatus === 'running'}
          onClick={onRunSimulation}
          className={`w-full py-2.5 px-4 rounded text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
            simulationStatus === 'running'
              ? 'bg-amber-600/60 text-amber-100 cursor-not-allowed border border-amber-500/40'
              : simulationStatus === 'completed'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-emerald-950/40'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/40 shadow-cyan-950/40'
          }`}
        >
          {simulationStatus === 'running' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Simulating ({simProgress}%)</span>
            </>
          ) : simulationStatus === 'completed' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Re-run Simulation</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Simulation</span>
            </>
          )}
        </button>

        {/* Reset Scenario Button */}
        <button
          id="btn-reset-scenario"
          type="button"
          disabled={simulationStatus === 'running'}
          onClick={handleReset}
          className="w-full py-1.5 px-3 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-[#1e293b] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Scenario Defaults</span>
        </button>
      </div>
    </div>
  );
};
