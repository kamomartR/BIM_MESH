/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  CheckCircle2,
  Search,
  FileSpreadsheet,
  ArrowUpRight,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import {
  ISO9001_CATEGORIES,
  ISO9001_DIMENSIONS,
  DEFAULT_ISO9001_SELECTIONS,
  DEFAULT_ISO9001_TARGET_SELECTIONS,
  computeIso9001CategoryTargets,
  Iso9001Category,
} from '../lib/iso9001Data';
import {
  subscribeToIso9001MatrixState,
  subscribeToIso9001GoalsState,
  saveIso9001GoalsStateToCloud,
} from '../lib/firebase';
import { LOCAL_ISO9001_DRAFT_KEY } from './Iso9001MatrixSlide';
import { exportIso9001MatrixToExcel } from '../lib/excelExport';
import { cn } from '../lib/utils';

export const LOCAL_ISO9001_GOALS_KEY = 'mesh_iso9001_goals_v1';

const LEVEL_NAMES = ['N0: Inicial', 'N1: Definido', 'N2: Gestionado', 'N3: Integrado', 'N4: Optimizado'];

interface Iso9001MetasSlideProps {
  onOpenMatrix?: (category?: Iso9001Category) => void;
  onOpenInforme?: () => void;
}

export const Iso9001MetasSlide: React.FC<Iso9001MetasSlideProps> = () => {
  const [actualSelections, setActualSelections] = useState<Record<string, number>>(() => {
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

  const [targetSelections, setTargetSelections] = useState<Record<string, number>>(() => {
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

  const [targetPeriod, setTargetPeriod] = useState<string>('Q2 2027');
  const [activeFilter, setActiveFilter] = useState<'all' | Iso9001Category>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const unsubMatrix = subscribeToIso9001MatrixState((data) => {
      if (data?.selections) {
        setActualSelections({ ...DEFAULT_ISO9001_SELECTIONS, ...data.selections });
      }
    });
    const unsubGoals = subscribeToIso9001GoalsState((data) => {
      if (data?.targetSelections) {
        setTargetSelections({ ...DEFAULT_ISO9001_TARGET_SELECTIONS, ...data.targetSelections });
      }
      if (data?.targetPeriod) setTargetPeriod(data.targetPeriod);
    });
    return () => {
      unsubMatrix();
      unsubGoals();
    };
  }, []);

  const maxPoints = ISO9001_DIMENSIONS.length * 4;
  const actualTotalPts = useMemo(
    () => ISO9001_DIMENSIONS.reduce((sum, d) => sum + (actualSelections[d.id] ?? 0), 0),
    [actualSelections]
  );
  const actualPct = Math.round((actualTotalPts / maxPoints) * 100);

  const targetTotalPts = useMemo(
    () => ISO9001_DIMENSIONS.reduce((sum, d) => sum + (targetSelections[d.id] ?? 0), 0),
    [targetSelections]
  );
  const targetPct = Math.round((targetTotalPts / maxPoints) * 100);
  const gapPct = targetPct - actualPct;
  const gapPts = targetTotalPts - actualTotalPts;

  const itemsAlreadyMet = useMemo(
    () =>
      ISO9001_DIMENSIONS.filter(
        (d) => (actualSelections[d.id] ?? 0) >= (targetSelections[d.id] ?? 0)
      ).length,
    [actualSelections, targetSelections]
  );

  const categoryStats = useMemo(() => {
    return ISO9001_CATEGORIES.map((cat) => {
      const dims = ISO9001_DIMENSIONS.filter((d) => d.category === cat.id);
      const maxPts = dims.length * 4;
      const curPts = dims.reduce((s, d) => s + (actualSelections[d.id] ?? 0), 0);
      const tgtPts = dims.reduce((s, d) => s + (targetSelections[d.id] ?? 0), 0);
      const curPct = Math.round((curPts / maxPts) * 100);
      const tgtPct = Math.round((tgtPts / maxPts) * 100);
      return {
        ...cat,
        curPct,
        tgtPct,
        gap: tgtPct - curPct,
      };
    });
  }, [actualSelections, targetSelections]);

  const levelDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    ISO9001_DIMENSIONS.forEach((d) => {
      const lvl = Math.max(0, Math.min(4, targetSelections[d.id] ?? 0));
      counts[lvl] += 1;
    });
    return counts.map((count, idx) => ({
      level: idx,
      label: LEVEL_NAMES[idx],
      count,
      pct: Math.round((count / ISO9001_DIMENSIONS.length) * 100),
    }));
  }, [targetSelections]);

  const handleSetItemTarget = (dimId: string, lvl: number) => {
    const next = { ...targetSelections, [dimId]: lvl };
    setTargetSelections(next);
    try {
      localStorage.setItem(
        LOCAL_ISO9001_GOALS_KEY,
        JSON.stringify({
          targetSelections: next,
          categoryTargets: computeIso9001CategoryTargets(next),
          targetPeriod,
        })
      );
    } catch {
      // Ignore
    }
  };

  const persistGoals = async () => {
    const catTargets = computeIso9001CategoryTargets(targetSelections);
    const payload = {
      targetSelections,
      categoryTargets: catTargets,
      targetScorePercentage: targetPct,
      targetPeriod,
      targetDate: '2027-06-30',
      responsibleRole: 'Director de Calidad / Auditor SGC',
      notes: 'Metas de implementación ISO 9001:2015 de Mesh Estudio.',
    };

    try {
      localStorage.setItem(LOCAL_ISO9001_GOALS_KEY, JSON.stringify(payload));
    } catch {
      // Ignore
    }

    setSaveState('saving');
    await saveIso9001GoalsStateToCloud(payload);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 2000);
  };

  const applyQuickPreset = (mode: 'align' | 'plus1' | 'n2' | 'n3') => {
    const next: Record<string, number> = {};
    ISO9001_DIMENSIONS.forEach((d) => {
      const cur = actualSelections[d.id] ?? 0;
      if (mode === 'align') next[d.id] = cur;
      else if (mode === 'plus1') next[d.id] = Math.min(4, cur + 1);
      else if (mode === 'n2') next[d.id] = Math.max(cur, 2);
      else next[d.id] = Math.max(cur, 3);
    });
    setTargetSelections(next);
  };

  const filteredDimensions = useMemo(() => {
    return ISO9001_DIMENSIONS.filter((d) => {
      const matchesCat = activeFilter === 'all' || d.category === activeFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.clauseNumber.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-16 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Metas de Calidad SGC (ISO 9001:2015)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configuración cuantitativa automática por cláusula y requisito individual para Mesh Estudio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Período:</span>
            <select
              value={targetPeriod}
              onChange={(e) => setTargetPeriod(e.target.value)}
              className="font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Q4 2026">Q4 2026</option>
              <option value="Q1 2027">Q1 2027</option>
              <option value="Q2 2027">Q2 2027</option>
              <option value="Q3 2027">Q3 2027</option>
              <option value="Q4 2027">Q4 2027</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => exportIso9001MatrixToExcel(actualSelections, targetSelections, targetPeriod)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Descargar Excel</span>
          </button>

          <button
            type="button"
            onClick={persistGoals}
            disabled={saveState === 'saving'}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-60"
          >
            {saveState === 'saved' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Metas Guardadas</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{saveState === 'saving' ? 'Guardando...' : 'Guardar Metas'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Estado Actual (Hoy)
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{actualPct}%</div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              {actualTotalPts} de {maxPoints} pts
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Evaluado en matriz</span>
            <span className="font-mono font-semibold text-slate-700">Base hoy</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Meta Objetivo Total
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{targetPct}%</div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              {targetTotalPts} de {maxPoints} pts
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-medium">Cálculo 100% automático</span>
            <span className="font-mono font-semibold text-slate-700">21 ítems</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Brecha por Cerrar
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {gapPct >= 0 ? `+${gapPct}%` : `${gapPct}%`}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              {gapPts >= 0 ? `+${gapPts}` : gapPts} pts requeridos
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{gapPct > 0 ? 'Avance pendiente' : 'Meta alcanzada'}</span>
            <span className="font-mono font-semibold text-slate-700">{targetPeriod}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Requisitos en Meta
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{itemsAlreadyMet}</span>
              <span className="text-sm font-mono text-slate-400">/{ISO9001_DIMENSIONS.length}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {ISO9001_DIMENSIONS.length - itemsAlreadyMet} por completar
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all"
                style={{ width: `${Math.round((itemsAlreadyMet / ISO9001_DIMENSIONS.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Balance de Madurez por Cláusula
              </div>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-xs text-slate-500">Hoy</span>
                <span className="text-lg font-extrabold font-mono text-slate-900">{actualPct}%</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Meta</span>
                <span className="text-lg font-extrabold font-mono text-slate-900">{targetPct}%</span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  ({gapPct >= 0 ? `+${gapPct}%` : `${gapPct}%`})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap',
                  activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                )}
              >
                Todas
              </button>
              {ISO9001_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveFilter(c.id)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap',
                    activeFilter === c.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  )}
                >
                  {c.clause}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-slate-900" />
                    <span className="font-bold text-slate-900">
                      {cat.clause}: {cat.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-500">
                      Hoy: <strong className="text-slate-900">{cat.curPct}%</strong>
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500">
                      Meta: <strong className="text-slate-900">{cat.tgtPct}%</strong>
                    </span>
                    <span className="font-bold text-emerald-700 w-10 text-right">
                      {cat.gap >= 0 ? `+${cat.gap}%` : `${cat.gap}%`}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-slate-300 rounded-full transition-all"
                    style={{ width: `${cat.tgtPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-slate-900 rounded-full transition-all"
                    style={{ width: `${cat.curPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Distribución por Niveles
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-600">{targetPeriod}</span>
            </div>

            <div className="space-y-3">
              {levelDistribution.map((row) => (
                <div key={row.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{row.label}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {row.count} de {ISO9001_DIMENSIONS.length} ({row.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Acciones Rápidas
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyQuickPreset('align')}
                className="px-2.5 py-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                Alinear a Hoy ({actualPct}%)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('plus1')}
                className="px-2.5 py-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                Subir +1 Nivel
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('n2')}
                className="px-2.5 py-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                Todo Nivel 2 (50%)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('n3')}
                className="px-2.5 py-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                Todo Nivel 3 (75%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Requisitos y Metas Individuales ISO 9001
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cláusula o requisito..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-16">Num.</th>
                <th className="py-3 px-4">Requisito ISO 9001</th>
                <th className="py-3 px-4 w-28">Hoy</th>
                <th className="py-3 px-4 w-28">Meta</th>
                <th className="py-3 px-4 w-28">Estado</th>
                <th className="py-3 px-4 w-48 text-right">Fijar Meta (N0 - N4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDimensions.map((dim) => {
                const cur = actualSelections[dim.id] ?? 0;
                const tgt = targetSelections[dim.id] ?? 0;
                const diff = tgt - cur;
                return (
                  <tr key={dim.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{dim.clauseNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{dim.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{dim.description}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      N{cur} ({cur * 25}%)
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      N{tgt} ({tgt * 25}%)
                    </td>
                    <td className="py-3 px-4">
                      {diff <= 0 ? (
                        <span className="text-[11px] font-semibold text-emerald-700">En meta</span>
                      ) : (
                        <span className="text-[11px] font-mono font-semibold text-amber-700">
                          +{diff} {diff === 1 ? 'nivel' : 'niveles'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {[0, 1, 2, 3, 4].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleSetItemTarget(dim.id, lvl)}
                            className={cn(
                              'w-7 h-7 rounded-md font-mono text-[11px] font-bold transition-all cursor-pointer border',
                              tgt === lvl
                                ? 'bg-slate-900 text-white border-slate-900'
                                : cur === lvl
                                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                            )}
                          >
                            N{lvl}
                          </button>
                        ))}
                      </div>
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
