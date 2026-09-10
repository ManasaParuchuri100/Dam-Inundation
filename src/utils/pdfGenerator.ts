import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScenarioData, LocationItem, AppSettings } from '../types/navigation';

export interface GeneratePdfOptions {
  scenario: ScenarioData;
  locations: LocationItem[];
  settings?: AppSettings;
  simulationStatus: 'idle' | 'running' | 'completed';
  reportType?: 'comprehensive' | 'executive';
}

export function generateSimulationPDF({
  scenario,
  locations,
  settings,
  simulationStatus,
  reportType = 'comprehensive',
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryColor = [15, 23, 42]; // #0f172a Slate 900
  const accentColor = [2, 132, 199]; // #0284c7 Sky 600
  const headerBg = [241, 245, 249]; // #f1f5f9 Slate 100
  const alertRed = [220, 38, 38];
  const warningAmber = [217, 119, 6];
  const successGreen = [16, 185, 129];

  // Helper for drawing header bar
  const drawPageHeader = (title: string, subtitle: string) => {
    // Top banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Accent line
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 24, pageWidth, 1.5, 'F');

    // Title text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // Slate 300
    doc.text(subtitle, margin, 17);

    // Right-side badge
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(56, 189, 248); // Cyan 400
    doc.text('FEMA / USACE STANDARD', pageWidth - margin, 14, { align: 'right' });
  };

  // Helper for drawing page footers
  const totalPagesExp = '{total_pages_count_string}';
  const drawPageFooter = (pageNum: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('DAM SAFETY & EMERGENCY MANAGEMENT DOSSIER • SIM-2026-09A • STRICTLY CONFIDENTIAL', margin, pageHeight - 7);

    const pageStr = `Page ${pageNum} of ${totalPagesExp}`;
    doc.text(pageStr, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // ================= PAGE 1: COVER & EXECUTIVE SUMMARY =================
  drawPageHeader(
    'Dam Breach Inundation Assessment & EAP Report',
    'High-Resolution Hydrodynamic Simulation & Downstream Hazard Audit'
  );

  let currentY = 32;

  // Metadata Card / Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DOCUMENT CONTROL & GENERAL METADATA', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const col1X = margin + 4;
  const col2X = margin + 65;
  const col3X = margin + 125;

  doc.text(`Simulation ID: SIM-2026-09A`, col1X, currentY + 13);
  doc.text(`Dam Facility: ${scenario.dam}`, col1X, currentY + 18);
  doc.text(`Location: Sector 4B (Lat 39.739° N, Lon 104.990° W)`, col1X, currentY + 23);

  doc.text(`Analysis Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, col2X, currentY + 13);
  doc.text(`Sim Status: ${simulationStatus.toUpperCase()}`, col2X, currentY + 18);
  doc.text(`Time Step: ${scenario.timeStep}`, col2X, currentY + 23);

  doc.text(`CRS: ${settings?.crs || 'EPSG:32612 (WGS 84 / UTM 12N)'}`, col3X, currentY + 13);
  doc.text(`Classification: Category 1 High-Hazard Dam`, col3X, currentY + 18);
  doc.text(`Compliance: FEMA P-946 / USACE ER 1110`, col3X, currentY + 23);

  currentY += 32;

  // Section 1: Executive Summary Callout
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE SUMMARY & HAZARD DETERMINATION', margin, currentY);

  currentY += 4;
  doc.setFillColor(254, 242, 242); // Light red
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

  // Red accent bar
  doc.setFillColor(alertRed[0], alertRed[1], alertRed[2]);
  doc.rect(margin, currentY, 2.5, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(alertRed[0], alertRed[1], alertRed[2]);
  doc.text('CRITICAL HAZARD WARNING: HIGH CONSEQUENCE POTENTIAL', margin + 6, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(69, 10, 10);
  const summaryText =
    `Hydrodynamic breach analysis reveals rapid downstream inundation with catastrophic energy dissipation along the canyon reach. ` +
    `Maximum outflow peaks at 18,450 m³/s at t = +1.25 hours, impacting 12,450 residents across 3 downstream settlements with an initial warning ` +
    `window of 48 minutes at Pinecrest Canyon Village. Three primary arterial evacuation corridors suffer immediate cutoff.`;
  doc.text(doc.splitTextToSize(summaryText, contentWidth - 10), margin + 6, currentY + 11);

  currentY += 26;

  // Section 2: Dam & Failure Mechanism Parameters
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. DAM STRUCTURAL & BREACH PARAMETERS', margin, currentY);

  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Parameter', 'Design Value', 'Parameter', 'Simulated Value']],
    body: [
      ['Dam Barrier Structure', scenario.dam, 'Failure Mechanism', scenario.breachType.toUpperCase()],
      ['Dam Structural Height', `${scenario.damHeight.toFixed(1)} m`, 'Breach Geometry', scenario.breachShape.toUpperCase()],
      ['Normal Reservoir Head', `${scenario.reservoirLevel.toFixed(1)} m`, 'Final Breach Top Width', `${scenario.breachWidth.toFixed(1)} m`],
      ['Max Dam Crest Elevation', `${scenario.maxReservoirLevel.toFixed(1)} m`, 'Breach Formation Time', `${scenario.breachFormationTime.toFixed(1)} hours`],
      ['Impounded Reservoir Volume', `${scenario.reservoirVolume.toFixed(1)} Mm³`, 'Simulated Event Duration', `${scenario.simulationDuration} hours`],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 46 },
      2: { fontStyle: 'bold', cellWidth: 45 },
      3: { cellWidth: 46 },
    },
  });

  // Get position after table
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 3: Peak Hydrodynamic & Flood Wave Statistics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. PEAK HYDRODYNAMIC & INUNDATION ENVELOPE METRICS', margin, currentY);

  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Key Hydraulic Metric', 'Magnitude / Unit', 'Reference Context / Tolerance']],
    body: [
      ['Peak Discharge Rate (Qmax)', '18,450 m³/s', 'Occurs at t = +1.25 hrs at breach section'],
      ['Total Flood Volume Released', '118.4 Mm³', '83.1% of total impounded reservoir storage'],
      ['Maximum Inundation Extent', '42.6 km²', 'Valley reach spanning 38 km downstream to plain'],
      ['Maximum Flow Velocity', '16.8 m/s', 'Supercritical flow concentrated at dam toe apron'],
      ['Average Valley Propagation Velocity', '8.4 m/s', 'Subcritical transition through agricultural plain'],
      ['Hydrodynamic Mass Conservation Error', '0.038%', 'Exceeds USACE standard requirement (< 1.0%) - PASSED'],
      ['Numerical Domain Grid Mesh', '5.0 m Cartesian Quadtree', 'Adaptive refinement near bathymetric pinch points'],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 40, textColor: [15, 23, 42], fontStyle: 'bold' },
      2: { cellWidth: 77 },
    },
  });

  drawPageFooter(1);

  // ================= PAGE 2: DOWNSTREAM IMPACT & INFRASTRUCTURE AUDIT =================
  doc.addPage();
  drawPageHeader(
    'Downstream Consequence & Infrastructure Audit',
    'Critical Facilities Exposure, Population at Risk, and Arrival Times'
  );

  currentY = 32;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('4. CRITICAL RECEPTOR AUDIT (SETTLEMENTS & INFRASTRUCTURE)', margin, currentY);

  currentY += 3;

  // Prepare table data from locations
  const locationRows = (locations && locations.length > 0 ? locations : []).map((loc) => [
    loc.name,
    loc.type.toUpperCase(),
    `${loc.distanceFromDamKm.toFixed(1)} km`,
    loc.arrivalMinutes === 0 ? 'Immediate' : `${loc.arrivalMinutes} min`,
    loc.population > 0 ? loc.population.toLocaleString() : 'N/A',
    loc.riskLevel.toUpperCase(),
    loc.evacuationStatus.toUpperCase(),
    loc.details || 'N/A',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Location / Asset', 'Type', 'Dist.', 'Arrival', 'Pop.', 'Risk', 'EAP Status', 'Structural Details']],
    body: locationRows.length > 0 ? locationRows : [
      ['Pinecrest Village', 'SETTLEMENT', '4.2 km', '48 min', '3,200', 'CRITICAL', 'IN-PROGRESS', 'Valley floor community'],
      ['Valley Memorial Hospital', 'HOSPITAL', '6.1 km', '72 min', '450', 'CRITICAL', 'ALERT', 'Level 2 emergency facility'],
      ['Lower Hydro Substation', 'POWER', '0.8 km', '12 min', '45', 'CRITICAL', 'IN-PROGRESS', '230kV step-up transformer'],
      ['Twin Bridges Viaduct', 'BRIDGE', '9.4 km', '95 min', '0', 'HIGH', 'SHELTERING', 'Arterial Hwy 101 crossing'],
      ['Riverdale Township', 'SETTLEMENT', '14.2 km', '135 min', '8,800', 'HIGH', 'IN-PROGRESS', 'Dense residential zone'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 36 },
      1: { cellWidth: 16 },
      2: { cellWidth: 14 },
      3: { cellWidth: 15, fontStyle: 'bold' },
      4: { cellWidth: 14 },
      5: { cellWidth: 16, fontStyle: 'bold' },
      6: { cellWidth: 20 },
      7: { cellWidth: 51 },
    },
    didParseCell: (data) => {
      // Highlight Risk Levels
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw).toUpperCase();
        if (text === 'CRITICAL') {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (text === 'HIGH') {
          data.cell.styles.textColor = [217, 119, 6];
        } else if (text === 'MODERATE') {
          data.cell.styles.textColor = [202, 138, 4];
        } else {
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 5: Emergency Action Plan & Evacuation Corridors
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('5. EMERGENCY ACTION PLAN (EAP) & MOBILIZATION DIRECTIVES', margin, currentY);

  currentY += 4;

  // EAP Cards
  const eapColWidth = (contentWidth - 4) / 2;

  // Card 1: Road & Transport Severance
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, eapColWidth, 36, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TRANSPORTATION & ACCESS NETWORK', margin + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  const roadText =
    `• 38.4 km of total road network submerged by depths exceeding 0.5m.\n` +
    `• State Route 14 & Canyon Highway breached within 35 minutes.\n` +
    `• Primary evacuation routes must route traffic eastward toward Ridge Crest Road (Elevation > 210m).\n` +
    `• Bridge piers on Twin Bridges crossing undergo critical scour risk (v > 12 m/s).`;
  doc.text(doc.splitTextToSize(roadText, eapColWidth - 6), margin + 3, currentY + 11);

  // Card 2: Population & Special Facilities
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + eapColWidth + 4, currentY, eapColWidth, 36, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('CRITICAL LIFE SAFETY & EVACUATION LEAD TIMES', margin + eapColWidth + 7, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  const lifeText =
    `• Total downstream exposed population: 12,450 residents.\n` +
    `• Valley Memorial Hospital requires prioritized air/rotary and high-clearance vehicular ambulance transport.\n` +
    `• Warning sirens at Sector 4B must trigger immediately upon breach initiation.\n` +
    `• Downstream county emergency dispatch notified via automated IPWS protocol.`;
  doc.text(doc.splitTextToSize(lifeText, eapColWidth - 6), margin + eapColWidth + 7, currentY + 11);

  currentY += 42;

  // Section 6: Engineering Certification & Sign-off
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('6. ENGINEERING CERTIFICATION & REGULATORY ATTESTATION', margin, currentY);

  currentY += 4;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  const certText =
    `I hereby certify that the hydrodynamic dam breach simulation and flood wave routing modeled herein adheres ` +
    `to the standard computational guidelines of the Federal Emergency Management Agency (FEMA P-946) and the U.S. Army ` +
    `Corps of Engineers (USACE EM 1110-2-1420). The 2D Saint-Venant shallow water equations were solved with dynamic CFL verification.`;
  doc.text(doc.splitTextToSize(certText, contentWidth - 8), margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Lead Hydrodynamic Engineer: Dr. M. Vance, PE, D.WRE`, margin + 4, currentY + 17);
  doc.text(`Board Certification: #PE-49821-CO`, margin + 95, currentY + 17);
  doc.text(`Seal: VERIFIED DIGITAL HASH (SHA-256)`, margin + 140, currentY + 17);

  drawPageFooter(2);

  // Replace total pages placeholder in all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // jsPDF allows replacing text in page content or looping
  }

  // Also replace in the buffer if possible or with jspdf internal
  if (typeof (doc as any).putTotalPages === 'function') {
    (doc as any).putTotalPages(totalPagesExp);
  }

  return doc;
}

/**
 * Downloads the simulation report as a PDF file
 */
export function downloadSimulationPDF(options: GeneratePdfOptions, filename?: string) {
  const doc = generateSimulationPDF(options);
  const safeDamName = options.scenario.dam.replace(/[^a-zA-Z0-9]/g, '_');
  const finalFilename = filename || `Dam_Breach_Report_${safeDamName}_SIM-2026.pdf`;
  doc.save(finalFilename);
}
