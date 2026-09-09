import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Database,
  Printer,
  Loader2,
  Share2,
} from 'lucide-react';
import { ScenarioData } from '../../types/navigation';

interface ReportPanelProps {
  scenario: ScenarioData;
  simulationStatus: 'idle' | 'running' | 'completed';
}

export const ReportPanel: React.FC<ReportPanelProps> = ({
  scenario,
  simulationStatus,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleGenerate = (type: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDownloadSuccess(type);
      setTimeout(() => setDownloadSuccess(null), 3000);
    }, 1200);
  };

  return (
    <div id="subpanel-report" className="flex flex-col h-full bg-[#0d131f]">
      {/* Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center justify-between shrink-0 bg-[#0a0f18]/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Simulation Report
            </h2>
            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
              FEMA / USACE Standard
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Hydraulic summary, critical impact audit, and data export
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-xs text-slate-300">
        {/* Simulation Summary Section */}
        <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Simulation Summary
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ID: SIM-2026-09A
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between py-1 border-b border-[#1a2333]">
              <span className="text-slate-400">Dam Asset</span>
              <span className="font-mono text-slate-200 text-right">{scenario.dam}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1a2333]">
              <span className="text-slate-400">Breach Mechanism</span>
              <span className="font-mono text-cyan-300 uppercase">{scenario.breachType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1a2333]">
              <span className="text-slate-400">Breach Width / Time</span>
              <span className="font-mono text-slate-200">{scenario.breachWidth}m / {scenario.breachFormationTime}h</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1a2333]">
              <span className="text-slate-400">Domain Grid Resolution</span>
              <span className="font-mono text-slate-200">5.0 m Cartesian Quadtree</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Mass Conservation Error</span>
              <span className="font-mono text-emerald-400 font-medium">0.038% (Passed)</span>
            </div>
          </div>
        </div>

        {/* Flood Statistics Section */}
        <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Flood Statistics
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Peak Hydrograph
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#0b0f17] p-2 rounded border border-[#1e293b]">
              <div className="text-[10px] text-slate-400">Peak Outflow</div>
              <div className="text-sm font-mono text-slate-100 font-bold mt-0.5">18,450 m³/s</div>
              <div className="text-[9px] text-slate-500 mt-0.5">t = +1.25 hrs</div>
            </div>
            <div className="bg-[#0b0f17] p-2 rounded border border-[#1e293b]">
              <div className="text-[10px] text-slate-400">Total Volume Released</div>
              <div className="text-sm font-mono text-slate-100 font-bold mt-0.5">118.4 Mm³</div>
              <div className="text-[9px] text-slate-500 mt-0.5">83% of reservoir</div>
            </div>
            <div className="bg-[#0b0f17] p-2 rounded border border-[#1e293b]">
              <div className="text-[10px] text-slate-400">Max Inundated Extent</div>
              <div className="text-sm font-mono text-slate-100 font-bold mt-0.5">42.6 km²</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Valley reach 38km</div>
            </div>
            <div className="bg-[#0b0f17] p-2 rounded border border-[#1e293b]">
              <div className="text-[10px] text-slate-400">Max Flood Wave Velocity</div>
              <div className="text-sm font-mono text-slate-100 font-bold mt-0.5">16.8 m/s</div>
              <div className="text-[9px] text-slate-500 mt-0.5">At dam toe apron</div>
            </div>
          </div>
        </div>

        {/* Impact Summary Section */}
        <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Impact & Hazard Summary
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
              HIGH RISK
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between py-1 border-b border-[#1a2333]">
              <span className="text-slate-300">Exposed Population</span>
              <span className="font-mono text-amber-300 font-semibold">12,450 residents</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#1a2333]">
              <span className="text-slate-300">Submerged Evacuation Roads</span>
              <span className="font-mono text-slate-200">38.4 km (3 arterials cut)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#1a2333]">
              <span className="text-slate-300">Critical Infrastructure Affected</span>
              <span className="font-mono text-red-400 font-semibold">7 facilities (1 Hospital)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300">Warning Window (Lead Time)</span>
              <span className="font-mono text-cyan-300 font-semibold">48 min at first community</span>
            </div>
          </div>
        </div>

        {/* Generate Report & Export Data */}
        <div className="pt-2 border-t border-[#1a2333] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Generate & Export
            </span>
            {downloadSuccess && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 animate-fade-in">
                <CheckCircle2 className="w-3 h-3" /> {downloadSuccess} Ready
              </span>
            )}
          </div>

          {/* PDF Report Generation Button */}
          <button
            id="btn-generate-pdf-report"
            type="button"
            disabled={isGenerating}
            onClick={() => handleGenerate('Comprehensive PDF')}
            className="w-full py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-cyan-400/40 shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling Comprehensive Dossier...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Executive PDF Report</span>
              </>
            )}
          </button>

          {/* Export Formats Grid */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              id="btn-export-geotiff"
              type="button"
              onClick={() => handleGenerate('GeoTIFF Raster')}
              className="p-2 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 border border-[#1e293b] flex items-center gap-2 transition-colors cursor-pointer text-left"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-[11px]">GeoTIFF Grids</div>
                <div className="text-[9px] text-slate-500">Max Depth & Arrival</div>
              </div>
            </button>

            <button
              id="btn-export-shapefile"
              type="button"
              onClick={() => handleGenerate('Shapefile Vectors')}
              className="p-2 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 border border-[#1e293b] flex items-center gap-2 transition-colors cursor-pointer text-left"
            >
              <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-[11px]">Shapefile / GIS</div>
                <div className="text-[9px] text-slate-500">Inundation Polygons</div>
              </div>
            </button>

            <button
              id="btn-export-csv"
              type="button"
              onClick={() => handleGenerate('Hydrograph CSV')}
              className="p-2 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 border border-[#1e293b] flex items-center gap-2 transition-colors cursor-pointer text-left"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-[11px]">CSV Time-Series</div>
                <div className="text-[9px] text-slate-500">Gauge Hydrographs</div>
              </div>
            </button>

            <button
              id="btn-export-hecras"
              type="button"
              onClick={() => handleGenerate('HEC-RAS HDF5')}
              className="p-2 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 border border-[#1e293b] flex items-center gap-2 transition-colors cursor-pointer text-left"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-[11px]">HDF5 Export</div>
                <div className="text-[9px] text-slate-500">HEC-RAS 2D Plan</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
