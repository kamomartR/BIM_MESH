/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Target,
  FileBarChart2,
  Save,
} from 'lucide-react';
import {
  ISO9001_CATEGORIES,
  ISO9001_DIMENSIONS,
  DEFAULT_ISO9001_SELECTIONS,
  getIso9001MaturityLabel,
  Iso9001Category,
} from '../lib/iso9001Data';
import {
  subscribeToIso9001MatrixState,
  saveIso9001MatrixStateToCloud,
} from '../lib/firebase';
import { exportIso9001MatrixToExcel } from '../lib/excelExport';
import { cn } from '../lib/utils';

export const LOCAL_ISO9001_DRAFT_KEY = 'mesh_iso9001_maturity_draft_v1';

interface Iso9001MatrixSlideProps {
  initialCategory?: Iso9001Category | 'todas';
  onOpenMetas?: () => void;
  onOpenInforme?: () => void;
}

export const Iso9001MatrixSlide: React.FC<Iso9001MatrixSlideProps> = ({
  initialCategory = 'todas',
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

  const [activeCategory, setActiveCategory] = useState<Iso9001Category | 'todas'>(initialCategory);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const unsub = subscribeToIso9001MatrixState((data) => {
      if (data?.selections) {
        setSelections({ ...DEFAULT_ISO9001_SELECTIONS, ...data.selections });
      }
    });
    return () => unsub();
  }, []);

  const maxPoints = ISO9001_DIMENSIONS.length * 4;
  const totalPoints = useMemo(
    () => ISO9001_DIMENSIONS.reduce((sum, d) => sum + (selections[d.id] ?? 0), 0),
    [selections]
  );
  const scorePct = Math.round((totalPoints / maxPoints) * 100);
  const maturity = getIso9001MaturityLabel(scorePct);

  const handleSelectLevel = async (dimId: string, lvl: number) => {
    const next = { ...selections, [dimId]: lvl };
    setSelections(next);

    const nextTotal = ISO9001_DIMENSIONS.reduce((s, d) => s + (next[d.id] ?? 0), 0);
    const nextPct = Math.round((nextTotal / maxPoints) * 100);
    const nextMaturity = getIso9001MaturityLabel(nextPct);

    try {
      localStorage.setItem(
        LOCAL_ISO9001_DRAFT_KEY,
        JSON.stringify({ selections: next, scorePercentage: nextPct })
      );
    } catch {
      // Ignore
    }

    setSaveStatus('saving');
    await saveIso9001MatrixStateToCloud(next, nextPct, `${nextMaturity.level}: ${nextMaturity.label}`);
    setSaveStatus('saved');
    window.setTimeout(() => setSaveStatus('idle'), 1600);
  };

  const visibleDimensions = useMemo(() => {
    if (activeCategory === 'todas') return ISO9001_DIMENSIONS;
    return ISO9001_DIMENSIONS.filter((d) => d.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-6 pb-16 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Sistema de Gestión de Calidad · ISO 9001:2015
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Matriz de Madurez de Calidad (21 ítems)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Selecciona el nivel actual (N0 a N4) para cada requisito normativo de Mesh Estudio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
            <span className="text-slate-500">Avance SGC:</span>
            <span className="font-mono font-extrabold text-slate-900">{scorePct}%</span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({totalPoints}/{maxPoints})
            </span>
          </div>

          <button
            type="button"
            onClick={() => exportIso9001MatrixToExcel(selections)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>

          {onOpenMetas && (
            <button
              type="button"
              onClick={onOpenMetas}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Metas SGC</span>
            </button>
          )}

          {onOpenInforme && (
            <button
              type="button"
              onClick={onOpenInforme}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer"
            >
              <FileBarChart2 className="w-3.5 h-3.5" />
              <span>Informe PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto gap-1 border border-slate-200/70">
          <button
            type="button"
            onClick={() => setActiveCategory('todas')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeCategory === 'todas'
                ? 'bg-slate-900 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Todas (21)
          </button>
          {ISO9001_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap',
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {cat.shortTitle}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
          {saveStatus === 'saving' ? (
            <>
              <Save className="w-3.5 h-3.5 animate-pulse text-slate-600" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {maturity.level} · {maturity.label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Rubric Cards */}
      <div className="space-y-4">
        {visibleDimensions.map((dim) => {
          const selected = selections[dim.id] ?? 0;
          const catMeta = ISO9001_CATEGORIES.find((c) => c.id === dim.category);
          return (
            <div
              key={dim.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-slate-700">Numeral {dim.clauseNumber}</span>
                    <span>·</span>
                    <span>{catMeta?.clause} — {catMeta?.title}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{dim.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{dim.description}</p>
                </div>
                <div className="shrink-0 font-mono text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  Nivel actual: N{selected} ({selected * 25}%)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {dim.levels.map((lvl, idx) => {
                  const isActive = selected === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLevel(dim.id, idx)}
                      className={cn(
                        'text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2',
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-[11px] font-mono font-bold',
                            isActive ? 'text-emerald-300' : 'text-slate-900'
                          )}
                        >
                          {lvl.title}
                        </span>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <p
                        className={cn(
                          'text-[11px] leading-snug',
                          isActive ? 'text-slate-200' : 'text-slate-600'
                        )}
                      >
                        {lvl.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
