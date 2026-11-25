/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  ClipboardList,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  ISO9001_CATEGORIES,
  ISO9001_DIMENSIONS,
  DEFAULT_ISO9001_SELECTIONS,
  DEFAULT_ISO9001_TARGET_SELECTIONS,
  computeIso9001CategoryActualScores,
  computeIso9001CategoryTargets,
  getIso9001MaturityLabel,
  Iso9001Category,
} from '../lib/iso9001Data';
import {
  subscribeToIso9001MatrixState,
  subscribeToIso9001GoalsState,
} from '../lib/firebase';
import { LOCAL_ISO9001_DRAFT_KEY } from './Iso9001MatrixSlide';
import { LOCAL_ISO9001_GOALS_KEY } from './Iso9001MetasSlide';
import { exportIso9001MatrixToExcel } from '../lib/excelExport';

const MESH_LOGO_URL = 'https://i.postimg.cc/K89NWRmZ/cropped-logo-mesh-estudio-2024.webp';

interface Iso9001InformeSlideProps {
  onOpenMatrix: (category?: Iso9001Category) => void;
  onOpenMetas?: () => void;
}

async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch(MESH_LOGO_URL);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export const Iso9001InformeSlide: React.FC<Iso9001InformeSlideProps> = ({
  onOpenMatrix,
  onOpenMetas,
}) => {
  const [selections, setSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ISO9001_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections) return { ...DEFAULT_ISO9001_SELECTIONS, ...parsed.selections };
      }
    } catch {
      // Ignore
    }
    return { ...DEFAULT_ISO9001_SELECTIONS };
  });

  const [targets, setTargets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ISO9001_GOALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.targetSelections) {
          return { ...DEFAULT_ISO9001_TARGET_SELECTIONS, ...parsed.targetSelections };
        }
      }
    } catch {
      // Ignore
    }
    return { ...DEFAULT_ISO9001_TARGET_SELECTIONS };
  });

  const [targetPeriod, setTargetPeriod] = useState('Q2 2027');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const unsubMatrix = subscribeToIso9001MatrixState((data) => {
      if (data?.selections) {
        setSelections({ ...DEFAULT_ISO9001_SELECTIONS, ...data.selections });
      }
    });
    const unsubGoals = subscribeToIso9001GoalsState((data) => {
      if (data?.targetSelections) {
        setTargets({ ...DEFAULT_ISO9001_TARGET_SELECTIONS, ...data.targetSelections });
      }
      if (data?.targetPeriod) setTargetPeriod(data.targetPeriod);
    });
    return () => {
      unsubMatrix();
      unsubGoals();
    };
  }, []);

  const maxPoints = ISO9001_DIMENSIONS.length * 4;
  const totalPoints = useMemo(
    () => ISO9001_DIMENSIONS.reduce((s, d) => s + (selections[d.id] ?? 0), 0),
    [selections]
  );
  const globalPct = Math.round((totalPoints / maxPoints) * 100);
  const targetTotalPts = useMemo(
    () => ISO9001_DIMENSIONS.reduce((s, d) => s + (targets[d.id] ?? 0), 0),
    [targets]
  );
  const targetPct = Math.round((targetTotalPts / maxPoints) * 100);
  const maturity = getIso9001MaturityLabel(globalPct);
  const catScores = useMemo(() => computeIso9001CategoryActualScores(selections), [selections]);
  const catTargets = useMemo(() => computeIso9001CategoryTargets(targets), [targets]);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 16;
      const logo = await loadLogoBase64();

      // Header
      if (logo) {
        try {
          doc.addImage(logo, 'WEBP', margin, 12, 34, 11);
        } catch {
          // Ignore image format error
        }
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('INFORME EJECUTIVO DE CALIDAD · ISO 9001:2015', margin, 32);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Mesh Estudio · Fecha: ${new Date().toLocaleDateString('es-CO')} · Meta: ${targetPeriod}`,
        margin,
        38
      );

      // Summary Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, 44, pageW - margin * 2, 24, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Cumplimiento Actual SGC: ${globalPct}% (${totalPoints}/${maxPoints} pts)`, margin + 4, 52);
      doc.text(`Meta Objetivo (${targetPeriod}): ${targetPct}%`, margin + 4, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Nivel: ${maturity.level} — ${maturity.label}`, margin + 4, 65);

      // Clause Bars Chart
      let y = 78;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Desempeño vs. Meta por Cláusula ISO 9001', margin, y);
      y += 7;

      const barMaxW = pageW - margin * 2 - 75;
      ISO9001_CATEGORIES.forEach((cat) => {
        const cur = catScores[cat.id].percentage;
        const tgt = catTargets[cat.id];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${cat.clause} · ${cat.title.slice(0, 26)}`, margin, y + 3.5);

        const barX = margin + 58;
        doc.setFillColor(241, 245, 249);
        doc.rect(barX, y, barMaxW, 4.5, 'F');
        doc.setFillColor(203, 213, 225);
        doc.rect(barX, y, (barMaxW * tgt) / 100, 4.5, 'F');
        doc.setFillColor(15, 23, 42);
        doc.rect(barX, y, (barMaxW * cur) / 100, 4.5, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`${cur}% / ${tgt}%`, pageW - margin, y + 3.5, { align: 'right' });
        y += 9;
      });

      // Detail Table
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Detalle de los 21 Requisitos Evaluados', margin, y);
      y += 6;

      ISO9001_DIMENSIONS.forEach((dim) => {
        if (y > pageH - 20) {
          doc.addPage();
          y = 20;
        }
        const cur = selections[dim.id] ?? 0;
        const tgt = targets[dim.id] ?? 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${dim.clauseNumber}  ${dim.name}`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`Hoy: N${cur}  |  Meta: N${tgt}`, pageW - margin, y, { align: 'right' });
        y += 6;
      });

      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Mesh Estudio · Informe SGC ISO 9001:2015 · Página ${p} de ${totalPages}`,
          pageW / 2,
          pageH - 10,
          { align: 'center' }
        );
      }

      doc.save(`Mesh_Estudio_Informe_Calidad_ISO9001_${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Informe Ejecutivo SGC · ISO 9001:2015</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Informe de Estado de Calidad (PDF)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resumen ejecutivo por cláusula normativa con brechas frente a la meta ({targetPeriod}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportIso9001MatrixToExcel(selections, targets, targetPeriod)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Descargar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-60"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Informe PDF'}</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5">
          <div className="text-[11px] font-mono font-bold uppercase text-slate-400">Madurez SGC Hoy</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-2">{globalPct}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {maturity.level} · {maturity.label}
          </div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5">
          <div className="text-[11px] font-mono font-bold uppercase text-slate-400">
            Meta Planificada ({targetPeriod})
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-2">{targetPct}%</div>
          <div className="text-xs text-slate-500 mt-1">
            Brecha total: {targetPct - globalPct >= 0 ? `+${targetPct - globalPct}%` : `${targetPct - globalPct}%`}
          </div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-mono font-bold uppercase text-slate-400">Acciones Directas</div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => onOpenMatrix()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Editar Matriz</span>
            </button>
            {onOpenMetas && (
              <button
                type="button"
                onClick={onOpenMetas}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Ajustar Metas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clauses Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          Cumplimiento Actual vs. Meta por Cláusula
        </h2>
        <div className="space-y-4">
          {ISO9001_CATEGORIES.map((cat) => {
            const cur = catScores[cat.id];
            const tgt = catTargets[cat.id];
            const gap = tgt - cur.percentage;
            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-500 mr-2">{cat.clause}</span>
                    <span className="font-bold text-slate-900">{cat.title}</span>
                  </div>
                  <div className="font-mono text-[11px] flex items-center gap-2">
                    <span>Hoy: <strong>{cur.percentage}%</strong></span>
                    <span className="text-slate-300">/</span>
                    <span>Meta: <strong>{tgt}%</strong></span>
                    <span className="font-bold text-emerald-700">
                      {gap >= 0 ? `+${gap}%` : `${gap}%`}
                    </span>
                  </div>
                </div>
                <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-slate-300 rounded-full"
                    style={{ width: `${tgt}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-slate-900 rounded-full"
                    style={{ width: `${cur.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
