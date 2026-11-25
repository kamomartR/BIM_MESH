/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ClipboardList,
  Target,
  FileBarChart2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  ISO9001_CATEGORIES,
  ISO9001_DIMENSIONS,
  DEFAULT_ISO9001_SELECTIONS,
  computeIso9001CategoryActualScores,
  getIso9001MaturityLabel,
  Iso9001Category,
} from '../lib/iso9001Data';
import { subscribeToIso9001MatrixState } from '../lib/firebase';
import { LOCAL_ISO9001_DRAFT_KEY } from './Iso9001MatrixSlide';

interface Iso9001PortadaSlideProps {
  onOpenMatrix: (category?: Iso9001Category) => void;
  onOpenMetas: () => void;
  onOpenInforme: () => void;
}

export const Iso9001PortadaSlide: React.FC<Iso9001PortadaSlideProps> = ({
  onOpenMatrix,
  onOpenMetas,
  onOpenInforme,
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

  useEffect(() => {
    const unsub = subscribeToIso9001MatrixState((data) => {
      if (data?.selections) {
        setSelections({ ...DEFAULT_ISO9001_SELECTIONS, ...data.selections });
      }
    });
    return () => unsub();
  }, []);

  const totalPoints = ISO9001_DIMENSIONS.reduce((sum, d) => sum + (selections[d.id] ?? 0), 0);
  const maxPoints = ISO9001_DIMENSIONS.length * 4;
  const scorePct = Math.round((totalPoints / maxPoints) * 100);
  const maturity = getIso9001MaturityLabel(scorePct);
  const categoryScores = computeIso9001CategoryActualScores(selections);

  return (
    <div className="space-y-6 pb-16 text-slate-900">
      {/* Executive Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span>Sistema de Gestión de Calidad · ISO 9001:2015</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Plan de Implementación SGC — Mesh Estudio
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Evaluación estructurada de las 7 cláusulas auditables de la norma ISO 9001:2015
              (21 requisitos clave) integrada con la transformación digital BIM ISO 19650 de Mesh Estudio.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenMatrix()}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Abrir Matriz ISO 9001 (21 ítems)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onOpenMetas}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Target className="w-4 h-4 text-slate-600" />
                <span>Configurar Metas SGC</span>
              </button>
              <button
                type="button"
                onClick={onOpenInforme}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <FileBarChart2 className="w-4 h-4 text-slate-600" />
                <span>Informe de Calidad (PDF)</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 min-w-[240px] space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Madurez SGC Actual
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-slate-900">{scorePct}%</span>
              <span className="text-xs font-mono text-slate-500">
                ({totalPoints}/{maxPoints} pts)
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              {maturity.level} · {maturity.label}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">{maturity.summary}</p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Sincronizado con Firestore</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Clauses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ISO9001_CATEGORIES.map((cat) => {
          const stat = categoryScores[cat.id];
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onOpenMatrix(cat.id)}
              className="text-left bg-white border border-slate-200/90 hover:border-slate-400 rounded-2xl p-5 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-500 uppercase">{cat.clause}</span>
                  <span className="font-bold text-slate-900">{stat.percentage}%</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-slate-700">
                  {cat.title}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">
                    {cat.dimensionsCount} requisitos · Prom. N{stat.avgLevel}
                  </span>
                  <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                    Evaluar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
