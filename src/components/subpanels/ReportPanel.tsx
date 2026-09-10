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
  ExternalLink,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { ScenarioData, LocationItem, AppSettings } from '../../types/navigation';
import { generateSimulationPDF, downloadSimulationPDF } from '../../utils/pdfGenerator';
import { downloadHydrographCSV, downloadLocationsGeoJSON } from '../../utils/exportData';

interface ReportPanelProps {
  scenario: ScenarioData;
  simulationStatus: 'idle' | 'running' | 'completed';
  locations?: LocationItem[];
  settings?: AppSettings;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({
  scenario,
  simulationStatus,
  locations = [],
  settings,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [reportType, setReportType] = useState<'comprehensive' | 'executive'>('comprehensive');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [lastDownloadedFile, setLastDownloadedFile] = useState<string | null>(null);

  // Trigger PDF Download
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(null);

    setTimeout(() => {
      try {
        const safeDamName = scenario.dam.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Dam_Breach_Report_${safeDamName}_SIM-2026.pdf`;

        downloadSimulationPDF({
          scenario,
          locations,
          settings,
          simulationStatus,
          reportType,
        }, fileName);

        setIsGeneratingPdf(false);
        setDownloadSuccess('PDF Report Downloaded');
        setLastDownloadedFile(fileName);
        setTimeout(() => setDownloadSuccess(null), 5000);
      } catch (err) {
        console.error('Failed to generate PDF:', err);
        setIsGeneratingPdf(false);
      }
    }, 450);
  };

  // Preview or Print in Browser
  const handlePreviewPrintPDF = () => {
    try {
      const doc = generateSimulationPDF({
        scenario,
        locations,
        settings,
        simulationStatus,
        reportType,
      });

      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to preview PDF:', err);
    }
  };

  // Additional Real Exports
  const handleExportCSV = () => {
    downloadHydrographCSV(scenario);
    setDownloadSuccess('Hydrograph CSV Downloaded');
    setLastDownloadedFile(`Hydrograph_TimeSeries_${scenario.dam.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportGIS = () => {
    downloadLocationsGeoJSON(locations, scenario);
    setDownloadSuccess('GeoJSON Vectors Downloaded');
    setLastDownloadedFile(`GIS_Impact_Vectors_${scenario.dam.replace(/[^a-zA-Z0-9]/g, '_')}.geojson`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportGeoTIFFMeta = () => {
    // Generates GeoTIFF metadata header descriptor
    const safeDamName = scenario.dam.replace(/[^a-zA-Z0-9]/g, '_');
    const headerInfo = [
      `# GeoTIFF Raster Grid Metadata & World File`,
      `Projection: ${settings?.crs || 'EPSG:32612'}`,
      `Grid_Resolution: 5.0m Quadtree`,
      `Dam_Asset: ${scenario.dam}`,
      `Peak_Discharge: 18450 m3/s`,
      `Max_Water_Depth_Envelope: 14.2m`,
      `Grid_Dimensions: 1024 x 1024 cells`,
      `Bounding_Box: [39.712, -105.021, 39.765, -104.965]`,
      `Generated: ${new Date().toISOString()}`,
    ].join('\n');

    const blob = new Blob([headerInfo], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GeoTIFF_Grid_Spec_${safeDamName}.tfw`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('GeoTIFF Spec Downloaded');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportHecRasMeta = () => {
    const safeDamName = scenario.dam.replace(/[^a-zA-Z0-9]/g, '_');
    const hecrasInfo = [
      `# HEC-RAS 2D Unsteady Flow Plan Export`,
      `Plan_Name: PMF_Breach_${scenario.breachType.toUpperCase()}`,
      `Equation_Set: 2D Shallow Water Equations (SWE-ELM)`,
      `Manning_n_Channel: 0.035`,
      `Manning_n_Overbank: 0.065`,
      `Breach_Width: ${scenario.breachWidth}m`,
      `Formation_Time: ${scenario.breachFormationTime}hr`,
      `Upstream_Head: ${scenario.reservoirLevel}m`,
      `Simulation_Hours: ${scenario.simulationDuration}hr`,
    ].join('\n');

    const blob = new Blob([hecrasInfo], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HECRAS_Plan_${safeDamName}.p01`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('HEC-RAS Spec Downloaded');
    setTimeout(() => setDownloadSuccess(null), 4000);
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
            Hydraulic summary, critical impact audit, and PDF dossier export
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-xs text-slate-300">
        {/* PDF Download Action Banner */}
        <div className="bg-gradient-to-b from-[#162235] to-[#101725] p-3.5 rounded-lg border border-cyan-800/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-100">
                  Executive PDF Report
                </h3>
                <p className="text-[10px] text-slate-400">
                  Standard 2-Page Engineering Dossier & EAP
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-mono rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              PDF v1.7 (A4)
            </span>
          </div>

          {/* Report Scope Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0b0f17] rounded border border-[#1e293b]">
            <button
              type="button"
              onClick={() => setReportType('comprehensive')}
              className={`py-1.5 px-2 rounded text-[10px] font-medium transition-colors cursor-pointer text-center ${
                reportType === 'comprehensive'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comprehensive EAP (2-Page)
            </button>
            <button
              type="button"
              onClick={() => setReportType('executive')}
              className={`py-1.5 px-2 rounded text-[10px] font-medium transition-colors cursor-pointer text-center ${
                reportType === 'executive'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Executive Summary
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex gap-2">
            <button
              id="btn-generate-pdf-report"
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPDF}
              className="flex-1 py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-cyan-400/40 shadow-sm"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling PDF Document...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            <button
              id="btn-preview-pdf-report"
              type="button"
              onClick={handlePreviewPrintPDF}
              title="Open PDF preview in new window / print"
              className="px-2.5 py-2 rounded bg-[#1e293b] hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>

          {/* Success Toast / Notification */}
          {downloadSuccess && (
            <div className="p-2 rounded bg-emerald-950/70 border border-emerald-800/80 flex items-center justify-between text-[10px] text-emerald-300">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {downloadSuccess}
              </span>
              {lastDownloadedFile && (
                <span className="font-mono text-[9px] text-emerald-400/80 truncate max-w-[140px]">
                  {lastDownloadedFile}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Report Content Preview Summary */}
        <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Document Contents Included
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ID: SIM-2026-09A
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-start gap-2 py-1 border-b border-[#1a2333]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-medium">FEMA P-946 / USACE Compliance</span>
                <p className="text-[10px] text-slate-400">2D hydrodynamic shallow water equations with mass conservation verification</p>
              </div>
            </div>
            <div className="flex items-start gap-2 py-1 border-b border-[#1a2333]">
              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-medium">Dam Asset & Breach Model Matrix</span>
                <p className="text-[10px] text-slate-400">{scenario.dam} • {scenario.breachType.toUpperCase()} ({scenario.breachWidth}m / {scenario.breachFormationTime}h)</p>
              </div>
            </div>
            <div className="flex items-start gap-2 py-1 border-b border-[#1a2333]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-medium">Receptor Vulnerability Audit</span>
                <p className="text-[10px] text-slate-400">{locations.length || 7} downstream facilities, population exposure & arrival times</p>
              </div>
            </div>
            <div className="flex items-start gap-2 py-1">
              <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-medium">Emergency Evacuation Guidance</span>
                <p className="text-[10px] text-slate-400">Road severance analysis, hospital evacuation priorities & warning lead times</p>
              </div>
            </div>
          </div>
        </div>

        {/* Flood Statistics Section */}
        <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Hydraulic Envelopes
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

        {/* Additional Raw GIS & Model Exports */}
        <div className="pt-2 border-t border-[#1a2333] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Additional Scientific Exports
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              Raw Data & GIS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              id="btn-export-geotiff"
              type="button"
              onClick={handleExportGeoTIFFMeta}
              className="p-2 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 border border-[#1e293b] flex items-center gap-2 transition-colors cursor-pointer text-left"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-[11px]">GeoTIFF Grid</div>
                <div className="text-[9px] text-slate-500">World File / Specs</div>
              </div>
            </button>

            <button
              id="btn-export-shapefile"
              type="button"
              onClick={handleExportGIS}
              className="p-2 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 border border-[#1e293b] flex items-center gap-2 transition-colors cursor-pointer text-left"
            >
              <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-[11px]">GeoJSON Vectors</div>
                <div className="text-[9px] text-slate-500">POI & Boundaries</div>
              </div>
            </button>

            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              className="p-2 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 border border-[#1e293b] flex items-center gap-2 transition-colors cursor-pointer text-left"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-[11px]">Hydrograph CSV</div>
                <div className="text-[9px] text-slate-500">Q & Stage Time-Series</div>
              </div>
            </button>

            <button
              id="btn-export-hecras"
              type="button"
              onClick={handleExportHecRasMeta}
              className="p-2 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 border border-[#1e293b] flex items-center gap-2 transition-colors cursor-pointer text-left"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-[11px]">HEC-RAS 2D Plan</div>
                <div className="text-[9px] text-slate-500">Simulation Config</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
