/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ListOrdered,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  Layers,
  ChevronDown,
  ChevronRight,
  Save,
  Check,
  Cpu,
  FileText,
  Compass,
  Award,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
  Info,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  RoadmapActivity,
  INITIAL_ROADMAP_ACTIVITIES,
  ROADMAP_CATEGORIES,
  computeRoadmapTimeline,
} from '../lib/roadmapData';
import {
  subscribeToRoadmapState,
  saveRoadmapStateToCloud,
  CloudRoadmapData,
} from '../lib/firebase';
import { exportRoadmapToExcel } from '../lib/excelExport';

const LOCAL_ROADMAP_KEY = 'mesh_bim_roadmap_draft_v1';

interface RoadmapSlideProps {
  onOpenMatrix?: () => void;
  onOpenMetas?: () => void;
  onOpenInforme?: () => void;
}

export const RoadmapSlide: React.FC<RoadmapSlideProps> = ({
  onOpenMatrix,
  onOpenMetas,
  onOpenInforme,
}) => {
  // Load saved state or default
  const [activities, setActivities] = useState<RoadmapActivity[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ROADMAP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.activities && Array.isArray(parsed.activities)) {
          return parsed.activities;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_ROADMAP_ACTIVITIES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tabla' | 'cronograma' | 'fases'>('tabla');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [expandedRow, setExpandedRow] = useState<string | null>('ACT-01');

  // Timeline computation
  const timeline = useMemo(() => computeRoadmapTimeline(activities), [activities]);

  // Statistics
  const completedCount = useMemo(
    () => activities.filter((a) => a.status === 'completada').length,
    [activities]
  );
  const inProgressCount = useMemo(
    () => activities.filter((a) => a.status === 'en_progreso').length,
    [activities]
  );
  const overallProgress = useMemo(() => {
    const total = activities.reduce((acc, a) => acc + (a.progress || 0), 0);
    return Math.round(total / activities.length);
  }, [activities]);

  // Subscribe to Cloud state
  useEffect(() => {
    const unsub = subscribeToRoadmapState((cloudData) => {
      if (cloudData?.activities) {
        setActivities((prev) =>
          prev.map((item) => {
            const cloudItem = cloudData.activities[item.code];
            if (cloudItem) {
              return {
                ...item,
                status: cloudItem.status ?? item.status,
                progress: cloudItem.progress ?? item.progress,
                notes: cloudItem.notes ?? item.notes,
              };
            }
            return item;
          })
        );
      }
    });
    return () => unsub();
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_ROADMAP_KEY,
        JSON.stringify({
          activities,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // LocalStorage handled
    }
  }, [activities]);

  // Handle Cloud Save
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const activitiesMap: Record<string, { status: any; progress: number; notes?: string }> = {};
      activities.forEach((a) => {
        activitiesMap[a.code] = {
          status: a.status || 'pendiente',
          progress: a.progress || 0,
          notes: a.notes || '',
        };
      });

      await saveRoadmapStateToCloud({
        activities: activitiesMap,
        overallProgress,
        completedCount,
        targetCompletionDate: '2026-12-31',
      });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error('Error saving roadmap to cloud', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = (
    code: string,
    status: 'completada' | 'en_progreso' | 'pendiente' | 'bloqueada'
  ) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.code === code) {
          const newProgress = status === 'completada' ? 100 : status === 'en_progreso' ? Math.max(act.progress || 25, 25) : 0;
          return { ...act, status, progress: newProgress };
        }
        return act;
      })
    );
  };

  const handleUpdateProgress = (code: string, progress: number) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.code === code) {
          const clamped = Math.max(0, Math.min(100, progress));
          const newStatus = clamped === 100 ? 'completada' : clamped > 0 ? 'en_progreso' : 'pendiente';
          return { ...act, progress: clamped, status: newStatus };
        }
        return act;
      })
    );
  };

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchCat = selectedCategory === 'all' || act.category === selectedCategory;
      const matchQuery =
        !searchQuery ||
        act.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.deliverables.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.stepName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activities, selectedCategory, searchQuery]);

  // Group by phases
  const phaseGroups = useMemo(() => {
    const groups: Record<string, RoadmapActivity[]> = {};
    activities.forEach((act) => {
      if (!groups[act.phaseGroup]) {
        groups[act.phaseGroup] = [];
      }
      groups[act.phaseGroup].push(act);
    });
    return groups;
  }, [activities]);

  return (
    <div className="space-y-6 pb-16 text-slate-900 font-sans">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              METODOLOGÍA BIM ISO 19650
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold">
              Plan Inicial · 10 Pasos Prioritarios
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ListOrdered className="w-6 h-6 text-slate-900 shrink-0" />
            <span>Plan de Implementación Inicial (Secuencia & Prioridades)</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Orden de prioridades, actividades puntuales, dependencias predecesoras, entregables físicos medibles y criterios de finalización para la adopción en Mesh Estudio.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => {
              const activitiesMap: Record<string, { status: string; progress: number; notes?: string }> = {};
              activities.forEach((a) => {
                activitiesMap[a.code] = {
                  status: a.status || 'pendiente',
                  progress: a.progress || 0,
                  notes: a.notes,
                };
              });
              exportRoadmapToExcel(activitiesMap);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            title="Descargar este cuadro en formato Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Descargar Cuadro Excel</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToCloud}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs text-white",
              saveStatus === 'saved'
                ? "bg-emerald-600 hover:bg-emerald-700"
                : saveStatus === 'error'
                ? "bg-red-600 hover:bg-red-700"
                : "bg-slate-900 hover:bg-slate-800"
            )}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Estado</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Avance Global */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              AVANCE GLOBAL PLAN
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {overallProgress}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              {completedCount} de 10 completadas
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>{inProgressCount} en ejecución</span>
            <span>{10 - completedCount - inProgressCount} pendientes</span>
          </div>
        </div>

        {/* Card 2: Duración Ruta Crítica */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              RUTA CRÍTICA TOTAL
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {timeline.criticalPathWeeks}
            </span>
            <span className="text-xs font-mono text-slate-500">
              semanas encadenadas
            </span>
          </div>
          <div className="text-xs text-slate-600 mt-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Aprox. 3 meses con dependencias</span>
          </div>
        </div>

        {/* Card 3: Dependencias Predecesoras */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              FLUJO DE PREDECESORAS
            </span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              10 Pasos
            </span>
            <span className="text-xs font-mono text-slate-500">
              5 Fases secuenciales
            </span>
          </div>
          <div className="text-xs text-slate-600 mt-3 truncate">
            Inicia en ACT-01 (Dirección) → Cierra en ACT-10 (Red)
          </div>
        </div>

        {/* Card 4: Entregables Medibles */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              CRITERIO FINALIZACIÓN
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              100%
            </span>
            <span className="text-xs font-mono text-slate-500">
              Con criterio verificable
            </span>
          </div>
          <div className="text-xs text-slate-600 mt-3 truncate">
            BEP + CDE + LOIN + QA/QC + IFC + Contratos
          </div>
        </div>
      </div>

      {/* VIEW SWITCHER TABS & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Tabs */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('tabla')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold",
              activeTab === 'tabla'
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Cuadro de Prioridades (Tabla)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cronograma')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold",
              activeTab === 'cronograma'
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Cronograma Visual (Gantt)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fases')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold",
              activeTab === 'fases'
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Fases & Hitos
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar actividad o código..."
              className="w-48 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-slate-400 transition-all cursor-pointer"
          >
            {ROADMAP_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB CONTENT 1: EXACT TABULAR REPLICA OF USER SPREADSHEET */}
      {activeTab === 'tabla' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Matriz de Prioridades y Predecesoras (10 Pasos)
              </h2>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Mostrando {filteredActivities.length} de 10 actividades
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-blue-700 text-white font-bold tracking-tight">
                  <th className="py-3 px-3.5 font-bold border-r border-blue-600 w-36 whitespace-nowrap">
                    Fase / Paso
                  </th>
                  <th className="py-3 px-3 font-bold border-r border-blue-600 w-20 text-center whitespace-nowrap">
                    Código
                  </th>
                  <th className="py-3 px-4 font-bold border-r border-blue-600 min-w-[280px]">
                    Actividad Puntual
                  </th>
                  <th className="py-3 px-3 font-bold border-r border-blue-600 w-28 whitespace-nowrap">
                    Predecesora
                  </th>
                  <th className="py-3 px-3 font-bold border-r border-blue-600 w-24 text-center whitespace-nowrap">
                    Duración
                  </th>
                  <th className="py-3 px-4 font-bold border-r border-blue-600 min-w-[260px]">
                    Entregable Físico / Medible
                  </th>
                  <th className="py-3 px-4 font-bold min-w-[260px]">
                    Criterio de Finalización
                  </th>
                  <th className="py-3 px-3 font-bold text-center w-28 bg-blue-800">
                    Estado / Avance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredActivities.map((act, index) => {
                  const isExpanded = expandedRow === act.code;
                  return (
                    <React.Fragment key={act.code}>
                      <tr
                        className={cn(
                          "transition-colors hover:bg-blue-50/40",
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                          act.status === 'completada' && "bg-emerald-50/30"
                        )}
                      >
                        {/* 1. Fase / Paso */}
                        <td className="py-3.5 px-3.5 font-bold text-slate-900 border-r border-slate-200 align-top whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setExpandedRow(isExpanded ? null : act.code)}
                            className="flex items-center gap-1.5 hover:text-blue-700 text-left cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span>{act.stepName}</span>
                          </button>
                        </td>

                        {/* 2. Código */}
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200 text-center align-top whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {act.code}
                          </span>
                        </td>

                        {/* 3. Actividad Puntual */}
                        <td className="py-3.5 px-4 text-slate-800 border-r border-slate-200 align-top leading-relaxed">
                          <span className="font-bold text-slate-900">{act.actionVerb}</span>{' '}
                          {act.activityName.replace(act.actionVerb, '').trim()}
                        </td>

                        {/* 4. Predecesora */}
                        <td className="py-3.5 px-3 font-mono text-slate-700 border-r border-slate-200 align-top whitespace-nowrap">
                          {act.predecessors.length === 0 ? (
                            <span className="text-slate-400 italic">Ninguna</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {act.predecessors.map((p) => (
                                <span
                                  key={p}
                                  className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold font-mono"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* 5. Duración */}
                        <td className="py-3.5 px-3 text-slate-700 border-r border-slate-200 text-center align-top whitespace-nowrap font-medium">
                          {act.durationText}
                        </td>

                        {/* 6. Entregable Físico / Medible */}
                        <td className="py-3.5 px-4 text-slate-700 border-r border-slate-200 align-top leading-relaxed">
                          <div className="flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{act.deliverables}</span>
                          </div>
                        </td>

                        {/* 7. Criterio de Finalización */}
                        <td className="py-3.5 px-4 text-slate-700 align-top leading-relaxed">
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{act.completionCriteria}</span>
                          </div>
                        </td>

                        {/* 8. Estado & Control */}
                        <td className="py-3.5 px-3 text-center align-top whitespace-nowrap bg-slate-50/50">
                          <select
                            value={act.status || 'pendiente'}
                            onChange={(e) => handleUpdateStatus(act.code, e.target.value as any)}
                            className={cn(
                              "text-[11px] font-bold rounded-lg px-2 py-1 border transition-colors cursor-pointer w-full text-center",
                              act.status === 'completada'
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : act.status === 'en_progreso'
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-white text-slate-700 border-slate-300"
                            )}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En Progreso</option>
                            <option value="completada">Completada</option>
                            <option value="bloqueada">Bloqueada</option>
                          </select>

                          <div className="mt-1.5 flex items-center justify-center gap-1.5">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={act.progress || 0}
                              onChange={(e) => handleUpdateProgress(act.code, Number(e.target.value))}
                              className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                            />
                            <span className="text-[10px] font-mono font-bold text-slate-600 w-7 text-right">
                              {act.progress || 0}%
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Accordion: Alignment with BIM and ISO 9001 */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <td colSpan={8} className="py-3 px-6 text-xs text-slate-700 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                                  Articulación con Matriz BIM (ISO 19650)
                                </span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {act.relatedBimDimensions.map((d) => (
                                    <span
                                      key={d}
                                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px]"
                                    >
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                                  Requisito de Calidad (ISO 9001:2015)
                                </span>
                                <span className="mt-1 font-semibold text-slate-800 block">
                                  {act.relatedIsoClause}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                                  Notas de Ejecución para Mesh Estudio
                                </span>
                                <span className="mt-1 text-slate-600 block">
                                  {act.notes}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: GANTT TIMELINE VISUALIZATION */}
      {activeTab === 'cronograma' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                Cronograma Encadenado por Predecesoras (Gantt - 12.5 Semanas)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Representación visual del orden secuencial considerando las dependencias de inicio y fin.
              </p>
            </div>
            <div className="text-xs text-slate-600 font-mono font-bold">
              Total Ruta Crítica: {timeline.criticalPathWeeks} semanas
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <div className="min-w-[850px] space-y-3">
              {/* Timeline Header Week Marks */}
              <div className="grid grid-cols-14 gap-1 text-[11px] font-mono text-slate-400 font-bold border-b border-slate-200 pb-2">
                <div className="col-span-3 text-slate-800 font-sans">Actividad / Código</div>
                {Array.from({ length: 11 }).map((_, i) => (
                  <div key={i} className="text-center">
                    Sem {i + 1}
                  </div>
                ))}
              </div>

              {/* Activity Gantt Bars */}
              {activities.map((act) => {
                const sched = timeline.activitySchedule[act.code] || { startWeek: 0, endWeek: act.durationWeeks };
                const startCol = Math.min(10, Math.floor(sched.startWeek));
                const spanCol = Math.max(1, Math.ceil(act.durationWeeks));

                return (
                  <div
                    key={act.code}
                    className="grid grid-cols-14 gap-1 items-center py-1.5 hover:bg-slate-50 rounded-lg px-1 transition-colors"
                  >
                    <div className="col-span-3 text-xs font-semibold text-slate-900 truncate flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-blue-700 shrink-0">
                        {act.code}:
                      </span>
                      <span className="truncate">{act.stepName.split(':')[1] || act.stepName}</span>
                    </div>

                    <div className="col-span-11 relative h-7 bg-slate-100 rounded-md overflow-hidden flex items-center">
                      <div
                        className={cn(
                          "absolute h-5 rounded-md text-[10px] font-mono font-bold text-white flex items-center px-2 shadow-2xs transition-all",
                          act.status === 'completada'
                            ? "bg-emerald-600"
                            : act.status === 'en_progreso'
                            ? "bg-blue-600"
                            : "bg-slate-700"
                        )}
                        style={{
                          left: `${(sched.startWeek / 12.5) * 100}%`,
                          width: `${(act.durationWeeks / 12.5) * 100}%`,
                          minWidth: '38px',
                        }}
                      >
                        <span className="truncate">{act.durationText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PHASE GROUPS & DELIVERABLES */}
      {activeTab === 'fases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(phaseGroups) as [string, RoadmapActivity[]][]).map(([phaseTitle, phaseActs]) => (
            <div
              key={phaseTitle}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {phaseTitle}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {phaseActs.length} actividades
                </span>
              </div>

              <div className="space-y-2.5">
                {phaseActs.map((a) => (
                  <div
                    key={a.code}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-900 text-white font-mono font-bold text-[10px]">
                          {a.code}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {a.stepName}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {a.durationText}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-snug">
                      {a.activityName}
                    </p>

                    <div className="pt-1.5 border-t border-slate-200/60 flex flex-col gap-1 text-[11px] text-slate-600">
                      <div>
                        <strong className="text-slate-800">Entregable:</strong> {a.deliverables}
                      </div>
                      <div>
                        <strong className="text-slate-800">Criterio:</strong> {a.completionCriteria}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER CALL TO ACTION */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Integración Total con las Metas y la Matriz BIM de Mesh Estudio</span>
          </h4>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            A medida que completes cada uno de los 10 pasos, los indicadores correspondientes en la Matriz de Madurez (33 ítems) subirán de nivel automáticamente hacia las metas fijadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenMetas && (
            <button
              type="button"
              onClick={onOpenMetas}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              Ver Metas
            </button>
          )}

          {onOpenMatrix && (
            <button
              type="button"
              onClick={onOpenMatrix}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Ir a la Matriz</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
