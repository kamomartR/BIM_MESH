import React, { useState, useEffect } from 'react';
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
  Layers,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { subscribeToMatrixState } from '../lib/firebase';
import {
  DIMENSIONS,
  DEFAULT_SELECTIONS,
  LOCAL_DRAFT_KEY,
  generateAuditorTipsForSelections,
} from './BimMaturityMatrixSlide';
import { MatrixCategory } from './PortadaSlide';

interface InformeImplementacionSlideProps {
  onOpenMatrix: (category?: MatrixCategory) => void;
}

interface VectorStat {
  id: MatrixCategory;
  name: string;
  shortName: string;
  color: string;
  rgb: [number, number, number];
  dimensionsCount: number;
  points: number;
  maxPoints: number;
  percentage: number;
  avgLevel: number;
  benchmark: number;
}

interface LevelDistItem {
  level: number;
  name: string;
  short: string;
  color: string;
  rgb: [number, number, number];
  count: number;
  percentage: number;
}

const VECTOR_CONFIG: {
  id: MatrixCategory;
  name: string;
  shortName: string;
  color: string;
  rgb: [number, number, number];
}[] = [
  {
    id: 'tecnologia',
    name: '1. Tecnología',
    shortName: 'Tecnología',
    color: '#2563eb',
    rgb: [37, 99, 235],
  },
  {
    id: 'procesos',
    name: '2. Procesos',
    shortName: 'Procesos',
    color: '#059669',
    rgb: [5, 150, 105],
  },
  {
    id: 'politicas',
    name: '3. Políticas',
    shortName: 'Políticas',
    color: '#9333ea',
    rgb: [147, 51, 234],
  },
  {
    id: 'capacidad',
    name: '4. Capacidad BIM',
    shortName: 'Capacidad BIM',
    color: '#d97706',
    rgb: [217, 119, 6],
  },
  {
    id: 'escala',
    name: '5. Escala',
    shortName: 'Escala',
    color: '#db2777',
    rgb: [219, 39, 119],
  },
];

const LEVEL_LABELS = [
  {
    level: 0,
    name: 'Nivel 0 · Inicial',
    short: 'N0 Inicial',
    color: '#dc2626',
    rgb: [220, 38, 38] as [number, number, number],
  },
  {
    level: 1,
    name: 'Nivel 1 · Definido',
    short: 'N1 Definido',
    color: '#ea580c',
    rgb: [234, 88, 12] as [number, number, number],
  },
  {
    level: 2,
    name: 'Nivel 2 · Gestionado',
    short: 'N2 Gestionado',
    color: '#d97706',
    rgb: [217, 119, 6] as [number, number, number],
  },
  {
    level: 3,
    name: 'Nivel 3 · Integrado',
    short: 'N3 Integrado',
    color: '#16a34a',
    rgb: [22, 163, 74] as [number, number, number],
  },
  {
    level: 4,
    name: 'Nivel 4 · Optimizado',
    short: 'N4 Optimizado',
    color: '#059669',
    rgb: [5, 150, 105] as [number, number, number],
  },
];

/**
 * Loads the Mesh Estudio logo as a high-res PNG DataURL for jsPDF
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
      // Try next source
    }
  }
  return null;
}

/**
 * Helper to draw rounded rectangles on an HTML5 Canvas
 */
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
 * Renders Chart 1 (Horizontal Bar Chart of the 5 Corporate Vectors) onto a 3x Retina Canvas
 */
function renderVectorBarChartPng(vectorStats: VectorStat[]): string {
  const canvas = document.createElement('canvas');
  const width = 1050;
  const height = 660;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Card background
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, 0, 0, width, height, 20);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Title & Subtitle
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('01. Porcentaje de Madurez por Vector Corporativo', 36, 52);

  ctx.fillStyle = '#64748b';
  ctx.font = '18px sans-serif';
  ctx.fillText('Comparativa del nivel alcanzado en cada vector (Escala 0% a 100%)', 36, 82);

  // Divider
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, 102);
  ctx.lineTo(width - 36, 102);
  ctx.stroke();

  const chartLeft = 220;
  const chartRight = width - 190;
  const chartTop = 135;
  const chartBottom = height - 85;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  // Vertical grid lines (0%, 20%, 40%, 60%, 80%, 100%)
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
    ctx.font = 'bold 17px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${t}%`, x, chartBottom + 32);
  });

  // 50% Benchmark line
  const benchX = chartLeft + 0.5 * chartW;
  ctx.save();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 5]);
  ctx.beginPath();
  ctx.moveTo(benchX, chartTop - 10);
  ctx.lineTo(benchX, chartBottom);
  ctx.stroke();
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Meta N2 (50%)', benchX, chartTop - 16);
  ctx.restore();

  // Bars for each vector
  const rowStep = chartH / vectorStats.length;
  const barH = 42;

  vectorStats.forEach((vec, idx) => {
    const centerY = chartTop + idx * rowStep + rowStep / 2;
    const barY = centerY - barH / 2;

    // Y-axis label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(vec.shortName, chartLeft - 18, centerY + 7);

    // Track background
    ctx.fillStyle = '#f1f5f9';
    drawRoundedRect(ctx, chartLeft, barY, chartW, barH, 10);
    ctx.fill();

    // Value bar
    const fillW = Math.max(12, (vec.percentage / 100) * chartW);
    ctx.fillStyle = vec.color;
    drawRoundedRect(ctx, chartLeft, barY, fillW, barH, 10);
    ctx.fill();

    // Right value label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 19px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${vec.percentage}% (${vec.points}/${vec.maxPoints})`,
      chartRight + 14,
      centerY + 7
    );
  });

  ctx.textAlign = 'left';
  return canvas.toDataURL('image/png');
}

/**
 * Renders Chart 2 (Pentagon Radar Chart of Organizational Balance) onto a 3x Retina Canvas
 */
function renderRadarChartPng(vectorStats: VectorStat[]): string {
  const canvas = document.createElement('canvas');
  const width = 820;
  const height = 660;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Card background
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, 0, 0, width, height, 20);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Title & Subtitle
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('02. Radar de Equilibrio Organizativo', 36, 52);

  ctx.fillStyle = '#64748b';
  ctx.font = '18px sans-serif';
  ctx.fillText('Balance actual frente al umbral de consolidación (50%)', 36, 82);

  // Divider
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, 102);
  ctx.lineTo(width - 36, 102);
  ctx.stroke();

  const cx = width / 2;
  const cy = 365;
  const maxR = 175;
  const count = vectorStats.length;

  const getVertex = (index: number, pct: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const r = (pct / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
    };
  };

  // Concentric pentagon rings (20%, 40%, 60%, 80%, 100%)
  const rings = [20, 40, 60, 80, 100];
  rings.forEach((rPct) => {
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const pt = getVertex(i, rPct);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ring percentage label
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${rPct}%`, cx, cy - (rPct / 100) * maxR - 4);
  });

  // Radial axes
  for (let i = 0; i < count; i++) {
    const outer = getVertex(i, 100);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(outer.x, outer.y);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 50% Benchmark Polygon (Meta Consolidación)
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const pt = getVertex(i, 50);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 5]);
  ctx.stroke();
  ctx.restore();

  // Actual Polygon (Estado Actual Mesh Estudio)
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const pt = getVertex(i, Math.max(4, vectorStats[i].percentage));
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(16, 185, 129, 0.34)';
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Vertex Dots & Labels
  for (let i = 0; i < count; i++) {
    const vec = vectorStats[i];
    const pt = getVertex(i, Math.max(4, vec.percentage));
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#059669';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    const labelPt = getVertex(i, 124);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 19px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${vec.shortName} (${vec.percentage}%)`, labelPt.x, labelPt.y + 6);
  }

  // Legend at bottom
  const legY = height - 38;
  ctx.fillStyle = '#64748b';
  ctx.fillRect(cx - 250, legY - 12, 22, 12);
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Meta Consolidación (50%)', cx - 220, legY - 1);

  ctx.fillStyle = '#10b981';
  ctx.fillRect(cx + 25, legY - 12, 22, 12);
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Estado Actual Mesh Estudio', cx + 55, legY - 1);

  return canvas.toDataURL('image/png');
}

/**
 * Renders Chart 3 (Global Maturity Donut Gauge + Level 0-4 Distribution Bars) onto a 3x Retina Canvas
 */
function renderDistributionAndGaugePng(
  levelDistribution: LevelDistItem[],
  scorePercentage: number,
  totalPoints: number,
  maxPoints: number,
  maturityCategory: string
): string {
  const canvas = document.createElement('canvas');
  const width = 1820;
  const height = 520;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Card background
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, 0, 0, width, height, 20);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(
    '03. Índice Global de Madurez y Distribución por Niveles (Nivel 0 a Nivel 4)',
    36,
    52
  );

  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, 76);
  ctx.lineTo(width - 36, 76);
  ctx.stroke();

  // LEFT SIDE: Radial Donut Gauge
  const gaugeCx = 290;
  const gaugeCy = 275;
  const gaugeR = 125;

  // Track ring
  ctx.beginPath();
  ctx.arc(gaugeCx, gaugeCy, gaugeR, 0, Math.PI * 2);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 28;
  ctx.stroke();

  // Progress arc
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (Math.max(2, scorePercentage) / 100) * (Math.PI * 2);
  ctx.beginPath();
  ctx.arc(gaugeCx, gaugeCy, gaugeR, startAngle, endAngle);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.lineCap = 'butt';

  // Center text
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 54px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${scorePercentage}%`, gaugeCx, gaugeCy + 10);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`${totalPoints} / ${maxPoints} PTS`, gaugeCx, gaugeCy + 42);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(maturityCategory, gaugeCx, gaugeCy + gaugeR + 52);

  // Vertical separator
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(580, 96);
  ctx.lineTo(580, height - 30);
  ctx.stroke();

  // RIGHT SIDE: Level 0 to 4 Distribution Bars
  const barsLeft = 630;
  const barsRight = width - 48;
  const trackLeft = 890;
  const trackW = barsRight - trackLeft - 230;

  levelDistribution.forEach((lvl, idx) => {
    const y = 122 + idx * 74;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 21px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lvl.name, barsLeft, y + 24);

    // Bar track
    ctx.fillStyle = '#f1f5f9';
    drawRoundedRect(ctx, trackLeft, y, trackW, 34, 9);
    ctx.fill();

    // Bar fill
    if (lvl.count > 0) {
      const fillW = Math.max(16, (lvl.count / DIMENSIONS.length) * trackW);
      ctx.fillStyle = lvl.color;
      drawRoundedRect(ctx, trackLeft, y, fillW, 34, 9);
      ctx.fill();
    }

    // Count & percentage label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${lvl.count} dim (${lvl.percentage}%)`,
      trackLeft + trackW + 20,
      y + 24
    );
  });

  return canvas.toDataURL('image/png');
}

export const InformeImplementacionSlide: React.FC<InformeImplementacionSlideProps> = ({
  onOpenMatrix,
}) => {
  const [selections, setSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections) return { ...DEFAULT_SELECTIONS, ...parsed.selections };
      }
    } catch {
      // Ignore error
    }
    return DEFAULT_SELECTIONS;
  });

  const [filterVector, setFilterVector] = useState<'all' | 'gaps' | MatrixCategory>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToMatrixState((cloudData) => {
      if (cloudData?.selections) {
        setSelections({ ...DEFAULT_SELECTIONS, ...cloudData.selections });
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute global metrics
  const totalPoints = (Object.values(selections) as number[]).reduce(
    (acc, curr) => acc + (Number(curr) || 0),
    0
  );
  const maxPoints = DIMENSIONS.length * 4;
  const scorePercentage = Math.round((totalPoints / maxPoints) * 100);
  const averageLevel = (totalPoints / DIMENSIONS.length).toFixed(2);

  let maturityCategory = 'BIM Inicial / Incipiente';
  if (scorePercentage >= 80) {
    maturityCategory = 'Nivel 3: Corporación Optimizada / Líder BIM';
  } else if (scorePercentage >= 50) {
    maturityCategory = 'Nivel 2: Corporación Integrada / Colaborativa';
  } else if (scorePercentage >= 20) {
    maturityCategory = 'Nivel 1: Corporación Modelado en Silo';
  }

  // Vector breakdown data
  const vectorStats: VectorStat[] = VECTOR_CONFIG.map((vec) => {
    const dims = DIMENSIONS.filter((d) => d.category === vec.id);
    const vecPoints = dims.reduce((acc, d) => acc + (selections[d.id] || 0), 0);
    const vecMax = dims.length * 4;
    const percentage = Math.round((vecPoints / vecMax) * 100);
    const avgLvl = Number((vecPoints / dims.length).toFixed(2));
    return {
      ...vec,
      dimensionsCount: dims.length,
      points: vecPoints,
      maxPoints: vecMax,
      percentage,
      avgLevel: avgLvl,
      benchmark: 50,
    };
  });

  // Distribution of dimensions across levels 0..4
  const levelDistribution: LevelDistItem[] = LEVEL_LABELS.map((lvlInfo) => {
    const count = DIMENSIONS.filter((d) => (selections[d.id] || 0) === lvlInfo.level).length;
    const pct = Math.round((count / DIMENSIONS.length) * 100);
    return {
      ...lvlInfo,
      count,
      percentage: pct,
    };
  });

  const consolidatedCount = DIMENSIONS.filter((d) => (selections[d.id] || 0) >= 2).length;
  const criticalGapsCount = DIMENSIONS.filter((d) => (selections[d.id] || 0) === 0).length;
  const auditorTips = generateAuditorTipsForSelections(selections, scorePercentage);

  // Filtered table rows
  const filteredDimensions = DIMENSIONS.filter((d) => {
    if (filterVector === 'all') return true;
    if (filterVector === 'gaps') return (selections[d.id] || 0) === 0;
    return d.category === filterVector;
  });

  const cleanTextForPdf = (str: string) =>
    str.replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const logoAsset = await loadMeshLogoPng();
      const barChartPng = renderVectorBarChartPng(vectorStats);
      const radarChartPng = renderRadarChartPng(vectorStats);
      const distGaugePng = renderDistributionAndGaugePng(
        levelDistribution,
        scorePercentage,
        totalPoints,
        maxPoints,
        maturityCategory
      );

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const todayStr = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Helper to draw the top corporate header with Mesh Estudio Logo
      const drawCorporateHeader = (isFirstPage: boolean) => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, isFirstPage ? 34 : 24, 'F');

        // Top emerald bar
        doc.setFillColor(5, 150, 105);
        doc.rect(0, 0, pageWidth, 2.5, 'F');

        // Logo on left
        if (logoAsset) {
          const logoH = isFirstPage ? 15 : 10;
          const logoW = Math.min(52, logoH * logoAsset.ratio);
          doc.addImage(logoAsset.dataUrl, 'PNG', margin, isFirstPage ? 7 : 6, logoW, logoH);
          if (isFirstPage) {
            doc.setTextColor(100, 116, 139);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.text('IMPLEMENTACIÓN BIM · ISO 19650', margin, 26);
          }
        } else {
          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text('MESH ESTUDIO', margin, 16);
        }

        // Title & Metadata on right
        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isFirstPage ? 8 : 7);
        doc.text(
          'PLAN DE IMPLEMENTACIÓN BIM MESH ESTUDIO',
          pageWidth - margin,
          isFirstPage ? 11 : 9,
          { align: 'right' }
        );

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isFirstPage ? 13.5 : 10.5);
        doc.text(
          'Informe del Estado de Implementación BIM',
          pageWidth - margin,
          isFirstPage ? 18 : 15,
          { align: 'right' }
        );

        if (isFirstPage) {
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(
            `Matriz de Madurez Bilal Succar (33 Dimensiones) · ${todayStr}`,
            pageWidth - margin,
            24.5,
            { align: 'right' }
          );
        }

        // Bottom border of header
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        const lineY = isFirstPage ? 31 : 20;
        doc.line(margin, lineY, pageWidth - margin, lineY);
      };

      // --- PAGE 1 ---
      drawCorporateHeader(true);
      let y = 36;

      // --- KPI SUMMARY BOXES ---
      const boxW = (contentWidth - 9) / 4;
      const boxH = 20;
      const kpis = [
        {
          label: 'ÍNDICE DE MADUREZ',
          value: `${scorePercentage}%`,
          sub: `${totalPoints} / ${maxPoints} puntos`,
        },
        {
          label: 'PROMEDIO NIVEL',
          value: `${averageLevel} / 4.0`,
          sub: 'Escala de 0 a 4',
        },
        {
          label: 'CONSOLIDADAS (N>=2)',
          value: `${consolidatedCount} / 33`,
          sub: `${Math.round((consolidatedCount / 33) * 100)}% del total`,
        },
        {
          label: 'BRECHAS (NIVEL 0)',
          value: `${criticalGapsCount} / 33`,
          sub: 'Prioridad de acción',
        },
      ];

      kpis.forEach((kpi, idx) => {
        const x = margin + idx * (boxW + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, y, boxW, boxH, 2, 2, 'FD');

        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.2);
        doc.text(kpi.label, x + 3, y + 5.5);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12.5);
        doc.text(kpi.value, x + 3, y + 13);

        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.text(kpi.sub, x + 3, y + 18);
      });

      y += boxH + 5;

      // --- EMBEDDED CHARTS ROW 1: BAR CHART + RADAR CHART ---
      const barW = 104;
      const barH = (barW * 660) / 1050; // ~65.3mm
      const radarW = contentWidth - barW - 4; // 74mm
      const radarH = barH;

      doc.addImage(barChartPng, 'PNG', margin, y, barW, barH);
      doc.addImage(radarChartPng, 'PNG', margin + barW + 4, y, radarW, radarH);

      y += barH + 5;

      // --- EMBEDDED CHART ROW 2: GAUGE + LEVEL DISTRIBUTION CHART ---
      const distW = contentWidth;
      const distH = (distW * 520) / 1820; // ~52mm
      doc.addImage(distGaugePng, 'PNG', margin, y, distW, distH);

      y += distH + 6;

      // --- AUDITOR PRESCRIPTIONS ---
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('04. Dictamen y Hoja de Ruta del Auditor BIM', margin, y);
      y += 4.5;

      auditorTips.forEach((tip) => {
        const cleaned = cleanTextForPdf(tip);
        const lines = doc.splitTextToSize(cleaned, contentWidth - 8);
        const blockH = lines.length * 4 + 4.5;

        if (y + blockH > pageHeight - 15) {
          doc.addPage();
          drawCorporateHeader(false);
          y = 26;
        }

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, blockH, 1.5, 1.5, 'FD');

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.text(lines, margin + 4, y + 4.5);
        y += blockH + 2.5;
      });

      // --- PAGE 2+: COMPLETE 33 DIMENSIONS TABLE ---
      doc.addPage();
      drawCorporateHeader(false);
      y = 26;

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('05. Desglose Detallado de las 33 Dimensiones Evaluadas', margin, y);
      y += 6;

      VECTOR_CONFIG.forEach((vec) => {
        const vecDims = DIMENSIONS.filter((d) => d.category === vec.id);
        const stat = vectorStats.find((s) => s.id === vec.id);

        if (y + 18 > pageHeight - 16) {
          doc.addPage();
          drawCorporateHeader(false);
          y = 26;
        }

        // Vector section header
        doc.setFillColor(vec.rgb[0], vec.rgb[1], vec.rgb[2]);
        doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.text(
          `${vec.name.toUpperCase()} — ${stat?.percentage}% Logrado (${stat?.points}/${stat?.maxPoints} pts)`,
          margin + 3,
          y + 4.8
        );
        y += 8.5;

        vecDims.forEach((dim) => {
          const selectedIdx = selections[dim.id] || 0;
          const selectedLvl = dim.levels[selectedIdx];
          const descLines = doc.splitTextToSize(selectedLvl.description, contentWidth - 68);
          const rowH = Math.max(8.5, descLines.length * 3.6 + 3.8);

          if (y + rowH > pageHeight - 15) {
            doc.addPage();
            drawCorporateHeader(false);
            y = 26;
          }

          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(226, 232, 240);
          doc.rect(margin, y, contentWidth, rowH, 'FD');

          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.6);
          const dimTitleLines = doc.splitTextToSize(dim.name, 44);
          doc.text(dimTitleLines, margin + 2.5, y + 4.3);

          doc.setTextColor(5, 150, 105);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.4);
          doc.text(`Nivel ${selectedIdx}`, margin + 49, y + 4.3);

          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.text(descLines, margin + 65, y + 4.3);

          y += rowH;
        });

        y += 4.5;
      });

      // Add footers to all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(
          'Plan de Implementación BIM Mesh Estudio · Modelo Bilal Succar · ISO 19650',
          margin,
          pageHeight - 6.5
        );
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 22, pageHeight - 6.5);
      }

      doc.save('Informe_Implementacion_BIM_Mesh_Estudio.pdf');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto text-slate-900 font-sans pb-10">
      {/* Header with PDF Download CTA */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileBarChart2 className="text-emerald-600 w-6 h-6 shrink-0" />
            <span>Informe del Estado de Implementación BIM</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Mesh Estudio</span>
            <span aria-hidden="true">·</span>
            <span>Consolidado en tiempo real de las 33 dimensiones</span>
            <span aria-hidden="true">·</span>
            <span>Incluye logo y gráficas en la exportación PDF</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isGeneratingPdf ? 'Generando PDF con Gráficas...' : 'Descargar Informe en PDF'}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-mono font-semibold text-slate-500">
            Índice Global de Madurez
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-mono font-extrabold text-emerald-700 tabular-nums">
              {scorePercentage}%
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {totalPoints} / {maxPoints} pts
            </span>
          </div>
          <span className="text-xs text-slate-600 truncate">{maturityCategory}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-mono font-semibold text-slate-500">
            Nivel Promedio Corporativo
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-mono font-extrabold text-slate-900 tabular-nums">
              {averageLevel}
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">sobre 4.00</span>
          </div>
          <span className="text-xs text-slate-600">Meta estándar recomendada: 2.00</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-mono font-semibold text-slate-500">
            Dimensiones Consolidadas
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-mono font-extrabold text-blue-700 tabular-nums">
              {consolidatedCount}
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              de {DIMENSIONS.length} ({Math.round((consolidatedCount / DIMENSIONS.length) * 100)}%)
            </span>
          </div>
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>En Nivel 2 (Gestionado) o superior</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-mono font-semibold text-slate-500">
            Brechas Críticas (Nivel 0)
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-mono font-extrabold text-amber-700 tabular-nums">
              {criticalGapsCount}
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              de {DIMENSIONS.length} ({Math.round((criticalGapsCount / DIMENSIONS.length) * 100)}%)
            </span>
          </div>
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Dimensiones en estado inicial</span>
          </span>
        </div>
      </div>

      {/* Charts Row: BarChart by Vector + Radar Balance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* BarChart: Madurez por Vector */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                01. Porcentaje de Madurez por Vector Corporativo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativa del nivel alcanzado en cada uno de los 5 vectores de Bilal Succar.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">Escala 0% – 100%</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vectorStats}
                layout="vertical"
                margin={{ top: 8, right: 28, left: 12, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={true} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={105}
                  tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 600 }}
                  stroke="#cbd5e1"
                />
                <Tooltip
                  formatter={(
                    value: number,
                    _name: string,
                    props: { payload?: { points?: number; maxPoints?: number; avgLevel?: number } }
                  ) => [
                    `${value}% (${props?.payload?.points ?? 0}/${props?.payload?.maxPoints ?? 0} pts · Promedio N${props?.payload?.avgLevel ?? 0})`,
                    'Madurez Lograda',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#0f172a',
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={26}>
                  {vectorStats.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Vector quick numbers footer */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
            {vectorStats.map((vec) => (
              <button
                key={vec.id}
                type="button"
                onClick={() => onOpenMatrix(vec.id)}
                className="text-left p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-semibold text-slate-600 truncate">
                  {vec.shortName}
                </div>
                <div className="text-sm font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                  {vec.percentage}%{' '}
                  <span className="text-[11px] font-normal text-slate-500">
                    ({vec.points}/{vec.maxPoints})
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RadarChart: Equilibrio Organizativo vs Meta */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              02. Radar de Equilibrio Organizativo
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Balance actual frente al umbral de consolidación (Nivel 2 · 50%).
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={vectorStats}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="shortName"
                  tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Radar
                  name="Meta Consolidación (50%)"
                  dataKey="benchmark"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  fill="#94a3b8"
                  fillOpacity={0.12}
                />
                <Radar
                  name="Estado Actual Mesh Estudio"
                  dataKey="percentage"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.35}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Nivel']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Meta Nivel 2 Gestionado: 50%</span>
            <span className="font-mono font-bold text-emerald-700 tabular-nums">
              Actual Global: {scorePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Distribution by Level (N0 - N4) + Auditor Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Level Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              03. Distribución por Niveles de Madurez
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cantidad de dimensiones ubicadas en cada nivel (0 al 4).
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            {levelDistribution.map((lvl) => (
              <div key={lvl.level} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{lvl.name}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {lvl.count} dim · {lvl.percentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(lvl.count > 0 ? 4 : 0, lvl.percentage)}%`,
                      backgroundColor: lvl.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total evaluado</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              33 dimensiones (100%)
            </span>
          </div>
        </div>

        {/* Auditor Recommendations */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className="text-emerald-600 w-5 h-5 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    04. Dictamen y Hoja de Ruta del Auditor BIM
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Acciones prioritarias calculadas según las brechas entre vectores.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {auditorTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-xl"
                >
                  <p className="text-xs text-slate-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              El PDF incluye el logo de Mesh Estudio, las 3 gráficas y esta hoja de ruta.
            </span>
            <button
              type="button"
              onClick={() => onOpenMatrix()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <span>Ir a la Matriz de Madurez</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Complete Dimension Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>05. Resumen Detallado por Dimensión ({filteredDimensions.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Estado individual de cada dimensión evaluada en la organización.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFilterVector('all')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filterVector === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas (33)
            </button>
            <button
              type="button"
              onClick={() => setFilterVector('gaps')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filterVector === 'gaps'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Brechas N0 ({criticalGapsCount})
            </button>
            {VECTOR_CONFIG.map((vec) => (
              <button
                key={vec.id}
                type="button"
                onClick={() => setFilterVector(vec.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  filterVector === vec.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {vec.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-500 uppercase">
                <th className="py-2.5 px-3">Dimensión</th>
                <th className="py-2.5 px-3">Vector</th>
                <th className="py-2.5 px-3">Nivel Actual</th>
                <th className="py-2.5 px-3">Descripción del Estado Actual</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredDimensions.map((dim) => {
                const lvlIdx = selections[dim.id] || 0;
                const lvlObj = dim.levels[lvlIdx];
                const vecObj = VECTOR_CONFIG.find((v) => v.id === dim.category);
                return (
                  <tr key={dim.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {dim.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {vecObj?.shortName}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums whitespace-nowrap">
                      <span className={lvlObj.color}>{lvlObj.title}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-md leading-relaxed">
                      {lvlObj.description}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenMatrix(dim.category)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        Ver en matriz →
                      </button>
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
