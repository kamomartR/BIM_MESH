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
import { DIMENSIONS, DEFAULT_SELECTIONS } from './BimMaturityMatrixSlide';
import { MatrixCategory } from './PortadaSlide';
import {
  subscribeToMatrixState,
  subscribeToGoalsState,
  saveGoalsStateToCloud,
} from '../lib/firebase';
import { exportBimMatrixToExcel } from '../lib/excelExport';
import { cn } from '../lib/utils';

export const LOCAL_GOALS_KEY = 'mesh_bim_implementation_goals_v1';
const LOCAL_MATRIX_KEY = 'mesh_bim_maturity_draft_v1';

export const DEFAULT_CATEGORY_TARGETS: Record<MatrixCategory, number> = {
  tecnologia: 50,
  procesos: 47,
  politicas: 43,
  capacidad: 55,
  escala: 42,
};

export const DEFAULT_TARGET_SELECTIONS: Record<string, number> = {
  // Tecnología (9)
  sw_seleccion: 2,
  sw_modelos: 2,
  sw_gestion: 2,
  sw_intercambios: 2,
  hw_equipamiento: 2,
  hw_actualizacion: 2,
  red_infraestructura: 2,
  red_canales: 2,
  red_conectividad: 2,
  // Procesos (9)
  rec_entorno: 2,
  rec_conocimiento: 2,
  act_roles: 2,
  act_colaboracion: 2,
  act_productividad: 2,
  mod_lod: 2,
  lid_vision: 3,
  lid_estrategia: 2,
  lid_innovacion: 2,
  // Políticas (7)
  ent_requisitos: 2,
  ent_programas: 2,
  est_politicas: 2,
  est_gestion: 2,
  est_calidad: 2,
  con_responsabilidades: 2,
  ind_desempeño: 2,
  // Capacidad BIM (5)
  cap_modelado: 3,
  cap_col_metodo: 2,
  cap_col_confianza: 2,
  cap_red_modelos: 2,
  cap_red_coordinacion: 2,
  // Escala (3)
  esc_organizaciones: 2,
  esc_equipos: 2,
  esc_mercados: 2,
};

const CATEGORIES: { id: MatrixCategory; label: string; short: string }[] = [
  { id: 'tecnologia', label: 'Tecnología', short: 'Tecnología' },
  { id: 'procesos', label: 'Procesos', short: 'Procesos' },
  { id: 'politicas', label: 'Políticas', short: 'Políticas' },
  { id: 'capacidad', label: 'Capacidad BIM', short: 'Capacidad' },
  { id: 'escala', label: 'Escala de Adopción', short: 'Escala' },
];

const LEVEL_NAMES = ['N0: Inicial', 'N1: Definido', 'N2: Gestionado', 'N3: Integrado', 'N4: Optimizado'];

interface MetasConfigSlideProps {
  onOpenMatrix?: (category?: MatrixCategory) => void;
}

export const MetasConfigSlide: React.FC<MetasConfigSlideProps> = () => {
  const [actualSelections, setActualSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MATRIX_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections) return { ...DEFAULT_SELECTIONS, ...parsed.selections };
      }
    } catch {
      // Ignore
    }
    return { ...DEFAULT_SELECTIONS };
  });

  const [targetSelections, setTargetSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GOALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.targetSelections) return { ...DEFAULT_TARGET_SELECTIONS, ...parsed.targetSelections };
      }
    } catch {
      // Ignore
    }
    return { ...DEFAULT_TARGET_SELECTIONS };
  });

  const [targetPeriod, setTargetPeriod] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GOALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.targetPeriod) return parsed.targetPeriod;
      }
    } catch {
      // Ignore
    }
    return 'Q2 2027';
  });

  const [targetDate, setTargetDate] = useState<string>('2027-06-30');
  const [responsibleRole, setResponsibleRole] = useState<string>('BIM Manager / Dirección Técnica');
  const [notes, setNotes] = useState<string>(
    'Meta estratégica institucional de Mesh Estudio para consolidar la adopción ISO 19650-1/2.'
  );
  const [activeFilter, setActiveFilter] = useState<'all' | MatrixCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const unsubMatrix = subscribeToMatrixState((data) => {
      if (data?.selections) {
        setActualSelections({ ...DEFAULT_SELECTIONS, ...data.selections });
      }
    });
    const unsubGoals = subscribeToGoalsState((data) => {
      if (data?.targetSelections) {
        setTargetSelections({ ...DEFAULT_TARGET_SELECTIONS, ...data.targetSelections });
      }
      if (data?.targetPeriod) setTargetPeriod(data.targetPeriod);
      if (data?.targetDate) setTargetDate(data.targetDate);
      if (data?.responsibleRole) setResponsibleRole(data.responsibleRole);
      if (typeof data?.notes === 'string') setNotes(data.notes);
    });
    return () => {
      unsubMatrix();
      unsubGoals();
    };
  }, []);

  const maxPoints = DIMENSIONS.length * 4;

  const actualTotalPts = useMemo(
    () => DIMENSIONS.reduce((sum, d) => sum + (actualSelections[d.id] ?? 0), 0),
    [actualSelections]
  );
  const actualPct = Math.round((actualTotalPts / maxPoints) * 100);

  const targetTotalPts = useMemo(
    () => DIMENSIONS.reduce((sum, d) => sum + (targetSelections[d.id] ?? 0), 0),
    [targetSelections]
  );
  const targetPct = Math.round((targetTotalPts / maxPoints) * 100);
  const gapPct = targetPct - actualPct;
  const gapPts = targetTotalPts - actualTotalPts;

  const itemsAlreadyMet = useMemo(
    () => DIMENSIONS.filter((d) => (actualSelections[d.id] ?? 0) >= (targetSelections[d.id] ?? 0)).length,
    [actualSelections, targetSelections]
  );

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const dims = DIMENSIONS.filter((d) => d.category === cat.id);
      const maxPts = dims.length * 4;
      const curPts = dims.reduce((s, d) => s + (actualSelections[d.id] ?? 0), 0);
      const tgtPts = dims.reduce((s, d) => s + (targetSelections[d.id] ?? 0), 0);
      const curPct = Math.round((curPts / maxPts) * 100);
      const tgtPct = Math.round((tgtPts / maxPts) * 100);
      return {
        ...cat,
        count: dims.length,
        curPct,
        tgtPct,
        gap: tgtPct - curPct,
      };
    });
  }, [actualSelections, targetSelections]);

  const levelDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    DIMENSIONS.forEach((d) => {
      const lvl = Math.max(0, Math.min(4, targetSelections[d.id] ?? 0));
      counts[lvl] += 1;
    });
    return counts.map((count, idx) => ({
      level: idx,
      label: LEVEL_NAMES[idx],
      count,
      pct: Math.round((count / DIMENSIONS.length) * 100),
    }));
  }, [targetSelections]);

  const persistGoals = async (
    nextTargets: Record<string, number>,
    nextPeriod = targetPeriod
  ) => {
    const nextCategoryTargets: Record<MatrixCategory, number> = {
      tecnologia: 0,
      procesos: 0,
      politicas: 0,
      capacidad: 0,
      escala: 0,
    };
    CATEGORIES.forEach((cat) => {
      const dims = DIMENSIONS.filter((d) => d.category === cat.id);
      const pts = dims.reduce((s, d) => s + (nextTargets[d.id] ?? 0), 0);
      nextCategoryTargets[cat.id] = Math.round((pts / (dims.length * 4)) * 100);
    });
    const nextTotalPts = DIMENSIONS.reduce((s, d) => s + (nextTargets[d.id] ?? 0), 0);
    const nextTotalPct = Math.round((nextTotalPts / maxPoints) * 100);

    const payload = {
      targetSelections: nextTargets,
      categoryTargets: nextCategoryTargets,
      targetScorePercentage: nextTotalPct,
      targetPeriod: nextPeriod,
      targetDate,
      responsibleRole,
      notes,
    };

    try {
      localStorage.setItem(LOCAL_GOALS_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues
    }

    setSaveState('saving');
    await saveGoalsStateToCloud(payload);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 2000);
  };

  const handleSetItemTarget = (dimId: string, lvl: number) => {
    const next = { ...targetSelections, [dimId]: lvl };
    setTargetSelections(next);
    try {
      const catTargets = Object.fromEntries(
        CATEGORIES.map((cat) => {
          const dims = DIMENSIONS.filter((d) => d.category === cat.id);
          const pts = dims.reduce((s, d) => s + (next[d.id] ?? 0), 0);
          return [cat.id, Math.round((pts / (dims.length * 4)) * 100)];
        })
      );
      localStorage.setItem(
        LOCAL_GOALS_KEY,
        JSON.stringify({
          targetSelections: next,
          categoryTargets: catTargets,
          targetPeriod,
          targetDate,
          responsibleRole,
          notes,
        })
      );
    } catch {
      // Ignore
    }
  };

  const applyQuickPreset = (mode: 'align' | 'plus1' | 'n2' | 'n3') => {
    const next: Record<string, number> = {};
    DIMENSIONS.forEach((d) => {
      const cur = actualSelections[d.id] ?? 0;
      if (mode === 'align') next[d.id] = cur;
      else if (mode === 'plus1') next[d.id] = Math.min(4, cur + 1);
      else if (mode === 'n2') next[d.id] = Math.max(cur, 2);
      else next[d.id] = Math.max(cur, 3);
    });
    setTargetSelections(next);
  };

  const filteredDimensions = useMemo(() => {
    return DIMENSIONS.filter((d) => {
      const matchesCat = activeFilter === 'all' || d.category === activeFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-16 text-slate-900">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Metas de Implementación BIM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configuración cuantitativa automática por área e ítem individual para Mesh Estudio.
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
            onClick={() => exportBimMatrixToExcel(actualSelections, targetSelections, targetPeriod)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Descargar Excel</span>
          </button>

          <button
            type="button"
            onClick={() => persistGoals(targetSelections, targetPeriod)}
            disabled={saveState === 'saving'}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
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
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {actualPct}%
            </div>
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
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {targetPct}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              {targetTotalPts} de {maxPoints} pts
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-medium">Cálculo 100% automático</span>
            <span className="font-mono font-semibold text-slate-700">{DIMENSIONS.length} ítems</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Brecha por Cerrar
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
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
            Ítems en Meta
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {itemsAlreadyMet}
              </span>
              <span className="text-sm font-mono text-slate-400">/{DIMENSIONS.length}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {DIMENSIONS.length - itemsAlreadyMet} por completar
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all"
                style={{ width: `${Math.round((itemsAlreadyMet / DIMENSIONS.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Balance by Area */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Balance de Madurez por Área
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
                  'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap',
                  activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                )}
              >
                Todas (360°)
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveFilter(c.id)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap',
                    activeFilter === c.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  )}
                >
                  {c.short}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-slate-900" />
                    <span className="font-bold text-slate-900">{cat.label}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({cat.count} ítems)</span>
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
                <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-900" />
                Estado Hoy
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300" />
                Meta Automática
              </span>
            </div>
            <span className="font-mono">Recalculado en tiempo real según selección</span>
          </div>
        </div>

        {/* Distribution & Quick Presets */}
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
                      {row.count} de {DIMENSIONS.length} ({row.pct}%)
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
                className="px-2.5 py-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-colors"
              >
                Alinear a Hoy ({actualPct}%)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('plus1')}
                className="px-2.5 py-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-colors"
              >
                Subir +1 Nivel
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('n2')}
                className="px-2.5 py-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-colors"
              >
                Todo Nivel 2 (50%)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('n3')}
                className="px-2.5 py-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-colors"
              >
                Todo Nivel 3 (75%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item-by-Item Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Ítems y Metas Individuales
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredDimensions.length} de {DIMENSIONS.length} indicadores)
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ítem o descripción..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12">ID</th>
                <th className="py-3 px-4">Indicador BIM</th>
                <th className="py-3 px-4 w-32">Área</th>
                <th className="py-3 px-4 w-28">Estado Hoy</th>
                <th className="py-3 px-4 w-28">Meta Objetivo</th>
                <th className="py-3 px-4 w-28">Estado</th>
                <th className="py-3 px-4 w-48 text-right">Fijar Meta (N0 - N4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDimensions.map((dim, idx) => {
                const cur = actualSelections[dim.id] ?? 0;
                const tgt = targetSelections[dim.id] ?? 0;
                const diff = tgt - cur;
                const catLabel = CATEGORIES.find((c) => c.id === dim.category)?.short ?? dim.category;
                return (
                  <tr key={dim.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{dim.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{dim.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{catLabel}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
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
                            title={`Fijar meta en Nivel ${lvl}`}
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
