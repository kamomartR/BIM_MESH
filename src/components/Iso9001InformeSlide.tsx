import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from 'recharts';
import {
  FileBarChart2,
  Download,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  ISO9001_DIMENSIONS,
  ISO9001_CATEGORIES,
  Iso9001Category,
  Iso9001Dimension,
  DEFAULT_ISO9001_SELECTIONS,
  DEFAULT_ISO9001_TARGET_SELECTIONS,
  TOTAL_ISO9001_DIMENSIONS,
  MAX_ISO9001_POINTS,
  computeIso9001CategoryTargets,
  computeIso9001CategoryActualScores,
  getIso9001MaturityLabel,
} from '../lib/iso9001Data';
import {
  subscribeToIso9001MatrixState,
  subscribeToIso9001GoalsState,
} from '../lib/firebase';
import { LOCAL_ISO9001_DRAFT_KEY } from './Iso9001MatrixSlide';
import { LOCAL_ISO9001_GOALS_KEY } from './Iso9001MetasSlide';

interface Iso9001InformeSlideProps {
  onOpenMatrix?: () => void;
  onOpenMetas?: () => void;
}

interface ClauseStat {
  id: Iso9001Category;
  clause: string;
  name: string;
  shortName: string;
  color: string;
  rgb: [number, number, number];
  dimensionsCount: number;
  points: number;
  maxPoints: number;
  percentage: number;
  avgLevel: number;
  targetPercentage: number;
}

/**
 * Loads Mesh Estudio logo as a high-res PNG DataURL for jsPDF
 */
async function loadMeshLogoPng(): Promise<{ dataUrl: string; ratio: number } | null> {
  const sources = [
    '/logo-mesh.webp',
    'https://i.postimg.cc/K89NWRmZ/cropped-logo-mesh-estudio-2024.webp',
  ];

  for (const src of sources) {
    try {
      const result = await new Promise<{ dataUrl: string; ratio: number }>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const w = img.naturalWidth || 400;
          const h = img.naturalHeight || 140;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No 2d context'));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve({
            dataUrl: canvas.toDataURL('image/png'),
            ratio: w / h,
          });
        };
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
      });
      return result;
    } catch {
      // Try next
    }
  }
  return null;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Renders Chart 1: Bar chart comparing 7 Clauses (Hoy vs Meta)
 */
function renderClauseBarChartPng(clauseStats: ClauseStat[]): string {
  const canvas = document.createElement('canvas');
  const width = 1100;
  const height = 750;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, 0, 0, width, height, 20);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('01. Desempeño por Cláusula ISO 9001 (Hoy vs Meta)', 36, 52);

  ctx.fillStyle = '#64748b';
  ctx.font = '17px sans-serif';
  ctx.fillText('Nivel actual alcanzado comparado con la meta automática (Escala 0% a 100%)', 36, 82);

  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, 102);
  ctx.lineTo(width - 36, 102);
  ctx.stroke();

  const chartLeft = 250;
  const chartRight = width - 160;
  const chartTop = 135;
  const chartBottom = height - 85;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  const ticks = [0, 20, 40, 60, 80, 100];
  ticks.forEach((t) => {
    const x = chartLeft + (t / 100) * chartW;
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(x, chartTop);
    ctx.lineTo(x, chartBottom);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${t}%`, x, chartBottom + 30);
  });

  const rowCount = clauseStats.length;
  const rowHeight = chartH / rowCount;
  const barHeight = 22;

  clauseStats.forEach((c, idx) => {
    const centerY = chartTop + idx * rowHeight + rowHeight / 2;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${c.clause}: ${c.shortName}`, chartLeft - 18, centerY - 2);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(`${c.dimensionsCount} ítems`, chartLeft - 18, centerY + 18);

    const actualW = Math.max(8, (c.percentage / 100) * chartW);
    const targetW = Math.max(8, (c.targetPercentage / 100) * chartW);

    // Target bar (muted/dashed background)
    ctx.fillStyle = '#f1f5f9';
    drawRoundedRect(ctx, chartLeft, centerY - 14, targetW, barHeight, 6);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Actual bar (solid dark)
    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, chartLeft, centerY - 14, actualW, barHeight, 6);
    ctx.fill();

    // Text labels
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${c.percentage}%`, chartLeft + Math.max(actualW, targetW) + 14, centerY + 3);
  });

  return canvas.toDataURL('image/png');
}

/**
 * Renders Chart 2: Radar Chart of the 7 Clauses
 */
function renderClauseRadarChartPng(clauseStats: ClauseStat[]): string {
  const canvas = document.createElement('canvas');
  const width = 900;
  const height = 750;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, 0, 0, width, height, 20);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('02. Diagrama Radial de Cobertura ISO 9001', 36, 52);

  ctx.fillStyle = '#64748b';
  ctx.font = '17px sans-serif';
  ctx.fillText('Equilibrio de madurez entre las 7 cláusulas del SGC', 36, 82);

  const centerX = width / 2;
  const centerY = height / 2 + 25;
  const maxRadius = 230;
  const n = clauseStats.length;

  const circles = [0.2, 0.4, 0.6, 0.8, 1.0];
  circles.forEach((f) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = centerX + Math.cos(angle) * maxRadius * f;
      const y = centerY + Math.sin(angle) * maxRadius * f;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Spokes & Labels
  clauseStats.forEach((c, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = centerX + Math.cos(angle) * maxRadius;
    const y = centerY + Math.sin(angle) * maxRadius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const labelDist = maxRadius + 35;
    const lx = centerX + Math.cos(angle) * labelDist;
    const ly = centerY + Math.sin(angle) * labelDist;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${c.clause}`, lx, ly - 8);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${c.shortName} (${c.percentage}%)`, lx, ly + 10);
  });

  // Polygon Actual (Solid)
  ctx.beginPath();
  clauseStats.forEach((c, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (c.percentage / 100) * maxRadius;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Points
  clauseStats.forEach((c, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (c.percentage / 100) * maxRadius;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  return canvas.toDataURL('image/png');
}

export const Iso9001InformeSlide: React.FC<Iso9001InformeSlideProps> = ({
  onOpenMatrix,
  onOpenMetas,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Load selections
  const [actualSelections, setActualSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ISO9001_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections) return { ...DEFAULT_ISO9001_SELECTIONS, ...parsed.selections };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ISO9001_SELECTIONS;
  });

  // Load goals
  const [targetSelections, setTargetSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ISO9001_GOALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.targetSelections) return { ...DEFAULT_ISO9001_TARGET_SELECTIONS, ...parsed.targetSelections };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ISO9001_TARGET_SELECTIONS;
  });

  const [targetPeriod, setTargetPeriod] = useState('Q4 2026');
  const [responsibleRole, setResponsibleRole] = useState('Director de Calidad / Auditor Líder SGC');

  useEffect(() => {
    const unsubMatrix = subscribeToIso9001MatrixState((cloud) => {
      if (cloud?.selections && Object.keys(cloud.selections).length > 0) {
        setActualSelections((prev) => ({ ...prev, ...cloud.selections }));
      }
    });

    const unsubGoals = subscribeToIso9001GoalsState((cloud) => {
      if (cloud?.targetSelections && Object.keys(cloud.targetSelections).length > 0) {
        setTargetSelections((prev) => ({ ...prev, ...cloud.targetSelections }));
        if (cloud.targetPeriod) setTargetPeriod(cloud.targetPeriod);
        if (cloud.responsibleRole) setResponsibleRole(cloud.responsibleRole);
      }
    });

    return () => {
      unsubMatrix();
      unsubGoals();
    };
  }, []);

  // Compute clause stats
  const actualScores = useMemo(() => {
    return computeIso9001CategoryActualScores(actualSelections);
  }, [actualSelections]);

  const targetCategoryScores = useMemo(() => {
    return computeIso9001CategoryTargets(targetSelections);
  }, [targetSelections]);

  const clauseStats: ClauseStat[] = useMemo(() => {
    return ISO9001_CATEGORIES.map((cat) => {
      const act = actualScores[cat.id];
      const tgt = targetCategoryScores[cat.id];
      return {
        id: cat.id,
        clause: cat.clause,
        name: cat.title,
        shortName: cat.shortTitle,
        color: cat.color,
        rgb: cat.rgb,
        dimensionsCount: cat.dimensionsCount,
        points: act.points,
        maxPoints: act.maxPoints,
        percentage: act.percentage,
        avgLevel: act.avgLevel,
        targetPercentage: tgt,
      };
    });
  }, [actualScores, targetCategoryScores]);

  const totalPoints = useMemo(() => {
    return (Object.values(actualSelections) as number[]).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  }, [actualSelections]);

  const totalScorePercentage = useMemo(() => {
    return Math.round((totalPoints / MAX_ISO9001_POINTS) * 100);
  }, [totalPoints]);

  const maturityInfo = useMemo(() => {
    return getIso9001MaturityLabel(totalScorePercentage);
  }, [totalScorePercentage]);

  // Recharts radar data
  const radarData = useMemo(() => {
    return clauseStats.map((c) => ({
      subject: `${c.clause}: ${c.shortName}`,
      Hoy: c.percentage,
      Meta: c.targetPercentage,
    }));
  }, [clauseStats]);

  // PDF Generator
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;

      // Header with Mesh Logo
      const logoInfo = await loadMeshLogoPng();
      if (logoInfo) {
        const logoH = 14;
        const logoW = logoH * logoInfo.ratio;
        doc.addImage(logoInfo.dataUrl, 'PNG', margin, 12, logoW, logoH);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text('MESH ESTUDIO', margin, 20);
      }

      // Title & Date
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('INFORME EJECUTIVO DE AUDITORÍA SGC', margin, 34);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Norma ISO 9001:2015 · Sistema de Gestión de Calidad · Fecha: ${new Date().toLocaleDateString('es-CO')} · Periodo: ${targetPeriod}`,
        margin,
        40
      );

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, 44, pageWidth - margin, 44);

      // KPI Boxes (Page 1)
      const boxW = (pageWidth - margin * 2 - 9) / 4;
      const boxY = 48;
      const boxH = 22;

      // Box 1: Score
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, boxY, boxW, boxH, 2, 2, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('PUNTAJE GLOBAL', margin + 3, boxY + 6);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${totalScorePercentage}%`, margin + 3, boxY + 16);

      // Box 2: Maturity
      const b2X = margin + boxW + 3;
      doc.roundedRect(b2X, boxY, boxW, boxH, 2, 2, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('MADUREZ SGC', b2X + 3, boxY + 6);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(maturityInfo.badge, b2X + 3, boxY + 16);

      // Box 3: Items
      const b3X = margin + (boxW + 3) * 2;
      doc.roundedRect(b3X, boxY, boxW, boxH, 2, 2, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('ÍTEMS AUDITADOS', b3X + 3, boxY + 6);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${TOTAL_ISO9001_DIMENSIONS} de 21`, b3X + 3, boxY + 16);

      // Box 4: Responsible
      const b4X = margin + (boxW + 3) * 3;
      doc.roundedRect(b4X, boxY, boxW, boxH, 2, 2, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('LÍDER AUDITORÍA', b4X + 3, boxY + 6);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(responsibleRole.slice(0, 22), b4X + 3, boxY + 16);

      // CHARTS SECTION (Page 1)
      const chart1Png = renderClauseBarChartPng(clauseStats);
      const chart1H = 95;
      const chart1W = pageWidth - margin * 2;
      doc.addImage(chart1Png, 'PNG', margin, 74, chart1W, chart1H);

      const chart2Png = renderClauseRadarChartPng(clauseStats);
      const chart2H = 95;
      doc.addImage(chart2Png, 'PNG', margin, 74 + chart1H + 4, chart1W, chart2H);

      // Footer Page 1
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Mesh Estudio · Sistema de Gestión de Calidad ISO 9001:2015 · Página 1 de 2', margin, pageHeight - 8);

      // --- PAGE 2: DETAILED CLAUSE BREAKDOWN & RECOMMENDATIONS ---
      doc.addPage();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('DESGLOSE DETALLADO POR CLÁUSULA Y RECOMENDACIONES', margin, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Evaluación de conformidad y plan de acción priorizado para Mesh Estudio', margin, 24);

      let currentY = 32;

      clauseStats.forEach((c) => {
        // Clause card
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`${c.clause}: ${c.name}`, margin + 4, currentY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Ítems: ${c.dimensionsCount} · Puntaje Actual: ${c.percentage}% · Meta: ${c.targetPercentage}% · Nivel Promedio: N${c.avgLevel}`,
          margin + 4,
          currentY + 14
        );

        // Status text
        const statusText =
          c.percentage >= c.targetPercentage
            ? '✓ Meta cumplida: Procedimiento estandarizado y adoptado.'
            : `⚠️ Brecha de +${c.targetPercentage - c.percentage}%: Requiere formalización documental e integración al tablero de proyectos.`;

        doc.setFontSize(8.5);
        doc.setFont('helvetica', c.percentage >= c.targetPercentage ? 'normal' : 'bold');
        doc.setTextColor(c.percentage >= c.targetPercentage ? 16 : 180, c.percentage >= c.targetPercentage ? 149 : 83, c.percentage >= c.targetPercentage ? 106 : 9);
        doc.text(statusText, margin + 4, currentY + 21);

        currentY += 30;
      });

      // Signatures
      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('FIRMAS Y APROBACIÓN EJECUTIVA', margin, currentY);

      currentY += 16;
      const sigW = (pageWidth - margin * 2 - 12) / 2;

      doc.setDrawColor(203, 213, 225);
      doc.line(margin, currentY, margin + sigW, currentY);
      doc.line(margin + sigW + 12, currentY, margin + sigW * 2 + 12, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(responsibleRole, margin, currentY + 5);
      doc.text('Gerencia General · Mesh Estudio', margin + sigW + 12, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Auditor Líder del SGC', margin, currentY + 9);
      doc.text('Aprobación de Metas y Recursos', margin + sigW + 12, currentY + 9);

      // Footer Page 2
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Mesh Estudio · Sistema de Gestión de Calidad ISO 9001:2015 · Página 2 de 2', margin, pageHeight - 8);

      doc.save(`Informe_SGC_ISO9001_Mesh_Estudio_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error generating PDF: ', err);
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              INFORME EJECUTIVO DE AUDITORÍA
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              ISO 9001:2015 SGC
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Informe de Implementación de Calidad</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              Mesh Estudio
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gráficos comparativos de madurez, diagnóstico por cláusula y exportación oficial en PDF con branding de Mesh Estudio.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenMatrix && (
            <button
              type="button"
              onClick={onOpenMatrix}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Ver Matriz</span>
            </button>
          )}

          {onOpenMetas && (
            <button
              type="button"
              onClick={onOpenMetas}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Ajustar Metas</span>
            </button>
          )}

          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleGeneratePdf}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Informe PDF (ISO 9001)'}</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider font-mono text-slate-400 mb-1">
            PUNTAJE GLOBAL HOY
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {totalScorePercentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalPoints} de {MAX_ISO9001_POINTS} puntos posibles
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider font-mono text-slate-400 mb-1">
            NIVEL DE MADUREZ SGC
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {maturityInfo.badge}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {maturityInfo.label}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider font-mono text-slate-400 mb-1">
            COBERTURA NORMATIVA
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            21 / 21
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">
            100% de ítems evaluados
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider font-mono text-slate-400 mb-1">
            PERIODO DE AUDITORÍA
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {targetPeriod}
          </div>
          <div className="text-xs text-slate-500 truncate mt-1">
            {responsibleRole}
          </div>
        </div>
      </div>

      {/* CHARTS GRID (Interactive Recharts on web) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Bar Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              01. Madurez por Cláusula ISO 9001 (Hoy vs Meta)
            </h3>
            <p className="text-xs text-slate-500">
              Comparativa porcentual del nivel actual frente a la meta automática por área.
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clauseStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal vertical stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="shortName" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}%`, name === 'percentage' ? 'Estado Hoy' : 'Meta Objetivo']}
                />
                <Legend />
                <Bar dataKey="percentage" name="Estado Hoy" fill="#0f172a" radius={[0, 4, 4, 0]} />
                <Bar dataKey="targetPercentage" name="Meta Objetivo" fill="#94a3b8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Radar Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              02. Diagrama Radial de Cobertura SGC
            </h3>
            <p className="text-xs text-slate-500">
              Distribución del equilibrio de madurez entre las 7 cláusulas de la norma.
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Estado Hoy" dataKey="Hoy" stroke="#0f172a" fill="#0f172a" fillOpacity={0.35} />
                <Radar name="Meta Objetivo" dataKey="Meta" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                <Legend />
                <Tooltip formatter={(val: any) => [`${val}%`, '']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAILED TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Tabla Resumen de Auditoría por Cláusula
          </h3>
          <p className="text-xs text-slate-500">
            Diagnóstico cuantitativo, brechas identificadas y acciones correctivas sugeridas.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono">
                <th className="py-2.5 px-3">CLÁUSULA</th>
                <th className="py-2.5 px-3">TÍTULO DEL ÁREA</th>
                <th className="py-2.5 px-3 text-center">ÍTEMS</th>
                <th className="py-2.5 px-3 text-center">HOY</th>
                <th className="py-2.5 px-3 text-center">META</th>
                <th className="py-2.5 px-3 text-center">BRECHA</th>
                <th className="py-2.5 px-3">ESTADO AUDITORÍA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clauseStats.map((c) => {
                const gap = c.targetPercentage - c.percentage;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{c.clause}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{c.name}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{c.dimensionsCount}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{c.percentage}%</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600">{c.targetPercentage}%</td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        gap > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {gap > 0 ? `+${gap}%` : 'Cumplida'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {c.percentage >= c.targetPercentage ? (
                        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Conforme con objetivos</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Oportunidad de mejora</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
