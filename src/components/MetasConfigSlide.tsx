import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Save,
  Check,
  Calendar,
  Layers,
  Cpu,
  FileText,
  Compass,
  AlertCircle,
  TrendingUp,
  Award,
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  Zap,
  MapPin,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  subscribeToMatrixState,
  subscribeToGoalsState,
  saveGoalsStateToCloud,
} from '../lib/firebase';
import {
  DIMENSIONS,
  DEFAULT_SELECTIONS,
  LOCAL_DRAFT_KEY,
  Dimension,
} from './BimMaturityMatrixSlide';
import { MatrixCategory } from './PortadaSlide';

export const LOCAL_GOALS_KEY = 'mesh_bim_goals_draft_v1';

export const DEFAULT_CATEGORY_TARGETS: Record<MatrixCategory, number> = {
  tecnologia: 50,
  procesos: 50,
  politicas: 50,
  capacidad: 50,
  escala: 50,
};

export const DEFAULT_TARGET_SELECTIONS: Record<string, number> = {
  sw_seleccion: 2,
  sw_modelos: 2,
  sw_gestion: 2,
  sw_intercambios: 2,
  hw_equipamiento: 2,
  hw_actualizacion: 2,
  red_infraestructura: 2,
  red_canales: 2,
  red_conectividad: 2,
  rec_entorno: 2,
  rec_conocimiento: 2,
  act_roles: 2,
  act_colaboracion: 2,
  act_productividad: 2,
  mod_lod: 2,
  lid_vision: 2,
  lid_estrategia: 2,
  lid_innovacion: 2,
  ent_requisitos: 2,
  ent_programas: 2,
  est_politicas: 2,
  est_gestion: 2,
  est_calidad: 2,
  con_responsabilidades: 2,
  ind_desempeño: 2,
  cap_modelado: 2,
  cap_col_metodo: 2,
  cap_col_confianza: 2,
  cap_red_modelos: 2,
  cap_red_coordinacion: 2,
  esc_organizaciones: 2,
  esc_equipos: 2,
  esc_mercados: 2,
};

export interface MetasConfigSlideProps {
  onOpenMatrix?: (category?: MatrixCategory) => void;
}

// Cálculo 100% automático de metas de área
export const computeCategoryTargetsFromSelections = (
  targets: Record<string, number>
): Record<MatrixCategory, number> => {
  const result: Record<MatrixCategory, number> = {
    tecnologia: 0,
    procesos: 0,
    politicas: 0,
    capacidad: 0,
    escala: 0,
  };
  const categories: MatrixCategory[] = ['tecnologia', 'procesos', 'politicas', 'capacidad', 'escala'];
  categories.forEach((cat) => {
    const dims = DIMENSIONS.filter((d) => d.category === cat);
    const maxPoints = dims.length * 4;
    const pts = dims.reduce((acc, d) => acc + (targets[d.id] ?? 0), 0);
    result[cat] = maxPoints > 0 ? Math.round((pts / maxPoints) * 100) : 0;
  });
  return result;
};

const CATEGORIES_LIST: {
  id: MatrixCategory;
  name: string;
  shortName: string;
  code: string;
}[] = [
  { id: 'tecnologia', name: 'Tecnología', shortName: 'Tecnología', code: 'TEC' },
  { id: 'procesos', name: 'Procesos', shortName: 'Procesos', code: 'PRO' },
  { id: 'politicas', name: 'Políticas', shortName: 'Políticas', code: 'POL' },
  { id: 'capacidad', name: 'Capacidad BIM', shortName: 'Capacidad', code: 'CAP' },
  { id: 'escala', name: 'Escala de Adopción', shortName: 'Escala', code: 'ESC' },
];

const LEVEL_LABELS = [
  { level: 0, name: 'N0: Inicial', pct: 0 },
  { level: 1, name: 'N1: Definido', pct: 25 },
  { level: 2, name: 'N2: Gestionado', pct: 50 },
  { level: 3, name: 'N3: Integrado', pct: 75 },
  { level: 4, name: 'N4: Optimizado', pct: 100 },
];

export const MetasConfigSlide: React.FC<MetasConfigSlideProps> = ({ onOpenMatrix }) => {
  // Estado actual evaluado en la matriz ("Dónde estoy hoy")
  const [currentSelections, setCurrentSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections) return { ...DEFAULT_SELECTIONS, ...parsed.selections };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_SELECTIONS;
  });

  // Metas por ítem individual
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
    return DEFAULT_TARGET_SELECTIONS;
  });

  // Parámetros de planificación
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
    return 'Q4 2026';
  });

  const [targetDate, setTargetDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GOALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.targetDate) return parsed.targetDate;
      }
    } catch {
      // Ignore
    }
    return '2026-12-31';
  });

  const [responsibleRole, setResponsibleRole] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GOALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.responsibleRole) return parsed.responsibleRole;
      }
    } catch {
      // Ignore
    }
    return 'BIM Manager / Dirección Técnica Mesh Estudio';
  });

  const [notes, setNotes] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GOALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.notes) return parsed.notes;
      }
    } catch {
      // Ignore
    }
    return 'Consolidación del Nivel 2 (Gestionado) en toda la firma e integración colaborativa de modelos conforme a ISO 19650.';
  });

  // Filtros de UI
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | MatrixCategory>('all');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Estados de guardado
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Cargar estado de la matriz en tiempo real
  useEffect(() => {
    const unsub = subscribeToMatrixState((data) => {
      if (data?.selections) {
        setCurrentSelections({ ...DEFAULT_SELECTIONS, ...data.selections });
      }
    });
    return () => unsub();
  }, []);

  // Cargar metas desde Firestore
  useEffect(() => {
    const unsub = subscribeToGoalsState((cloudGoals) => {
      if (cloudGoals) {
        if (cloudGoals.targetSelections) {
          setTargetSelections({ ...DEFAULT_TARGET_SELECTIONS, ...cloudGoals.targetSelections });
        }
        if (cloudGoals.targetPeriod) setTargetPeriod(cloudGoals.targetPeriod);
        if (cloudGoals.targetDate) setTargetDate(cloudGoals.targetDate);
        if (cloudGoals.responsibleRole) setResponsibleRole(cloudGoals.responsibleRole);
        if (cloudGoals.notes) setNotes(cloudGoals.notes);
      }
    });
    return () => unsub();
  }, []);

  // Metas por categoría calculadas de manera 100% automática
  const categoryTargets = useMemo(() => {
    return computeCategoryTargetsFromSelections(targetSelections);
  }, [targetSelections]);

  const totalDimensions = DIMENSIONS.length; // 33
  const maxPossiblePoints = totalDimensions * 4; // 132

  // Puntaje actual evaluado (Dónde estoy hoy)
  const currentTotalPoints = useMemo(() => {
    return DIMENSIONS.reduce((acc, dim) => acc + (currentSelections[dim.id] ?? 0), 0);
  }, [currentSelections]);

  const currentScorePct = Math.round((currentTotalPoints / maxPossiblePoints) * 100);

  // Puntaje objetivo automático
  const targetTotalPoints = useMemo(() => {
    return DIMENSIONS.reduce((acc, dim) => acc + (targetSelections[dim.id] ?? 0), 0);
  }, [targetSelections]);

  const targetCategoryAvgPct = useMemo(() => {
    const sum =
      (categoryTargets.tecnologia || 0) +
      (categoryTargets.procesos || 0) +
      (categoryTargets.politicas || 0) +
      (categoryTargets.capacidad || 0) +
      (categoryTargets.escala || 0);
    return Math.round(sum / 5);
  }, [categoryTargets]);

  const achievedItemsCount = useMemo(() => {
    return DIMENSIONS.filter((dim) => {
      const current = currentSelections[dim.id] ?? 0;
      const target = targetSelections[dim.id] ?? 0;
      return current >= target;
    }).length;
  }, [currentSelections, targetSelections]);

  const pointsGap = Math.max(0, targetTotalPoints - currentTotalPoints);
  const percentageGap = Math.max(0, targetCategoryAvgPct - currentScorePct);

  // Estadísticas detalladas por categoría
  const categoryStats = useMemo(() => {
    const stats: Record<
      MatrixCategory,
      {
        dims: Dimension[];
        currentPoints: number;
        maxPoints: number;
        currentPct: number;
        targetItemPoints: number;
        targetItemPct: number;
        gapPct: number;
        achievedCount: number;
      }
    > = {
      tecnologia: { dims: [], currentPoints: 0, maxPoints: 0, currentPct: 0, targetItemPoints: 0, targetItemPct: 0, gapPct: 0, achievedCount: 0 },
      procesos: { dims: [], currentPoints: 0, maxPoints: 0, currentPct: 0, targetItemPoints: 0, targetItemPct: 0, gapPct: 0, achievedCount: 0 },
      politicas: { dims: [], currentPoints: 0, maxPoints: 0, currentPct: 0, targetItemPoints: 0, targetItemPct: 0, gapPct: 0, achievedCount: 0 },
      capacidad: { dims: [], currentPoints: 0, maxPoints: 0, currentPct: 0, targetItemPoints: 0, targetItemPct: 0, gapPct: 0, achievedCount: 0 },
      escala: { dims: [], currentPoints: 0, maxPoints: 0, currentPct: 0, targetItemPoints: 0, targetItemPct: 0, gapPct: 0, achievedCount: 0 },
    };

    DIMENSIONS.forEach((dim) => {
      const cat = dim.category as MatrixCategory;
      if (stats[cat]) {
        stats[cat].dims.push(dim);
        const curr = currentSelections[dim.id] ?? 0;
        const tgt = targetSelections[dim.id] ?? 0;
        stats[cat].currentPoints += curr;
        stats[cat].targetItemPoints += tgt;
        stats[cat].maxPoints += 4;
        if (curr >= tgt) stats[cat].achievedCount += 1;
      }
    });

    Object.keys(stats).forEach((k) => {
      const key = k as MatrixCategory;
      const s = stats[key];
      s.currentPct = s.maxPoints > 0 ? Math.round((s.currentPoints / s.maxPoints) * 100) : 0;
      s.targetItemPct = s.maxPoints > 0 ? Math.round((s.targetItemPoints / s.maxPoints) * 100) : 0;
      s.gapPct = Math.max(0, s.targetItemPct - s.currentPct);
    });

    return stats;
  }, [currentSelections, targetSelections]);

  // Distribución de niveles meta (N0 a N4)
  const targetLevelsDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    DIMENSIONS.forEach((d) => {
      const lvl = targetSelections[d.id] ?? 0;
      if (lvl >= 0 && lvl <= 4) counts[lvl]++;
    });
    return counts;
  }, [targetSelections]);

  // Filtrado de ítems para la tabla
  const filteredDimensions = useMemo(() => {
    return DIMENSIONS.filter((dim) => {
      const matchesCategory = selectedCategoryTab === 'all' || dim.category === selectedCategoryTab;
      const matchesSearch =
        tableSearch.trim() === '' ||
        dim.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        dim.description.toLowerCase().includes(tableSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryTab, tableSearch]);

  const persistDraft = (
    targets: Record<string, number>,
    cats: Record<MatrixCategory, number>,
    period: string,
    date: string,
    role: string,
    noteText: string
  ) => {
    try {
      localStorage.setItem(
        LOCAL_GOALS_KEY,
        JSON.stringify({
          targetSelections: targets,
          categoryTargets: cats,
          targetPeriod: period,
          targetDate: date,
          responsibleRole: role,
          notes: noteText,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore
    }
  };

  const handleSetItemTarget = (dimensionId: string, level: number) => {
    const nextTargets = { ...targetSelections, [dimensionId]: level };
    setTargetSelections(nextTargets);
    const autoCats = computeCategoryTargetsFromSelections(nextTargets);
    persistDraft(nextTargets, autoCats, targetPeriod, targetDate, responsibleRole, notes);
  };

  const handleApplyPreset = (level: number) => {
    const newTargetSelections: Record<string, number> = {};
    DIMENSIONS.forEach((dim) => {
      newTargetSelections[dim.id] = level;
    });
    const autoCats = computeCategoryTargetsFromSelections(newTargetSelections);
    setTargetSelections(newTargetSelections);
    persistDraft(newTargetSelections, autoCats, targetPeriod, targetDate, responsibleRole, notes);
  };

  const handleAlignWithCurrentState = () => {
    const newTargetSelections: Record<string, number> = {};
    DIMENSIONS.forEach((dim) => {
      newTargetSelections[dim.id] = currentSelections[dim.id] ?? 0;
    });
    const autoCats = computeCategoryTargetsFromSelections(newTargetSelections);
    setTargetSelections(newTargetSelections);
    persistDraft(newTargetSelections, autoCats, targetPeriod, targetDate, responsibleRole, notes);
  };

  const handleAdvanceOneLevelFromToday = () => {
    const newTargetSelections: Record<string, number> = {};
    DIMENSIONS.forEach((dim) => {
      const current = currentSelections[dim.id] ?? 0;
      newTargetSelections[dim.id] = Math.min(4, current + 1);
    });
    const autoCats = computeCategoryTargetsFromSelections(newTargetSelections);
    setTargetSelections(newTargetSelections);
    persistDraft(newTargetSelections, autoCats, targetPeriod, targetDate, responsibleRole, notes);
  };

  const handleSaveToGoalsCloud = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    persistDraft(targetSelections, categoryTargets, targetPeriod, targetDate, responsibleRole, notes);

    try {
      await saveGoalsStateToCloud({
        targetSelections,
        categoryTargets,
        targetScorePercentage: targetCategoryAvgPct,
        targetPeriod,
        targetDate,
        responsibleRole,
        notes,
      });

      setSaveStatus('saved');
      setLastSavedTime(
        new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setTimeout(() => setSaveStatus('idle'), 3500);
    } catch (error) {
      console.error('Error saving goals to cloud:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 text-slate-900 font-sans">
      {/* Top Welcome & Actions Header (like screenshot: "Welcome back, Salung") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Metas de Implementación BIM
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Configuración cuantitativa por área e ítem individual para Mesh Estudio.
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700">
            <span>Período:</span>
            <strong className="text-slate-900 font-mono">{targetPeriod}</strong>
          </div>

          <button
            type="button"
            onClick={handleSaveToGoalsCloud}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs",
              saveStatus === 'saved'
                ? "bg-emerald-600 text-white"
                : saveStatus === 'error'
                ? "bg-red-600 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
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
                <span>Guardar Metas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 1: 4 Minimalist KPI Cards (Exact replica of TOTAL REVENUE, TOTAL ORDERS, NEW CUSTOMERS, CONVERSION RATE in reference image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ESTADO ACTUAL (HOY) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
            <span>Estado Actual (Hoy)</span>
            <Info className="w-3.5 h-3.5 text-slate-300" />
          </div>

          <div className="flex items-end justify-between gap-3 mt-1">
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {currentScorePct}%
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {currentTotalPoints} de {maxPossiblePoints} pts
              </div>
            </div>

            {/* Micro vertical bar chart (charcoal bars) */}
            <div className="flex items-end gap-1 h-8 shrink-0 pb-0.5">
              {CATEGORIES_LIST.map((cat) => {
                const pct = categoryStats[cat.id]?.currentPct || 0;
                const h = Math.max(4, Math.round((pct / 100) * 28));
                return (
                  <div
                    key={cat.id}
                    style={{ height: `${h}px` }}
                    className="w-1.5 bg-slate-900 rounded-2xs"
                    title={`${cat.name}: ${pct}%`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Evaluado en matriz
            </span>
            <span className="font-mono text-slate-600 font-semibold">Base hoy</span>
          </div>
        </div>

        {/* Card 2: META OBJETIVO (AUTOMÁTICA) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
            <span>Meta Objetivo Total</span>
            <Info className="w-3.5 h-3.5 text-slate-300" />
          </div>

          <div className="flex items-end justify-between gap-3 mt-1">
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {targetCategoryAvgPct}%
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {targetTotalPoints} de {maxPossiblePoints} pts
              </div>
            </div>

            {/* Micro vertical bar chart (charcoal target bars) */}
            <div className="flex items-end gap-1 h-8 shrink-0 pb-0.5">
              {CATEGORIES_LIST.map((cat) => {
                const pct = categoryStats[cat.id]?.targetItemPct || 0;
                const h = Math.max(4, Math.round((pct / 100) * 28));
                return (
                  <div
                    key={cat.id}
                    style={{ height: `${h}px` }}
                    className="w-1.5 bg-slate-900 rounded-2xs"
                    title={`${cat.name}: ${pct}%`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Cálculo 100% automático
            </span>
            <span className="font-mono text-emerald-800 font-bold">33 ítems</span>
          </div>
        </div>

        {/* Card 3: BRECHA POR CERRAR */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
            <span>Brecha por Cerrar</span>
            <Info className="w-3.5 h-3.5 text-slate-300" />
          </div>

          <div className="flex items-end justify-between gap-3 mt-1">
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {percentageGap > 0 ? `+${percentageGap}%` : '0%'}
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                +{pointsGap} pts requeridos
              </div>
            </div>

            {/* Micro vertical bar chart (gap bars) */}
            <div className="flex items-end gap-1 h-8 shrink-0 pb-0.5">
              {CATEGORIES_LIST.map((cat) => {
                const gap = categoryStats[cat.id]?.gapPct || 0;
                const h = Math.max(4, Math.round((gap / 100) * 28));
                return (
                  <div
                    key={cat.id}
                    style={{ height: `${h}px` }}
                    className={cn(
                      "w-1.5 rounded-2xs",
                      gap > 0 ? "bg-slate-700" : "bg-slate-200"
                    )}
                    title={`${cat.name} Gap: +${gap}%`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <span className={cn("w-1.5 h-1.5 rounded-full", percentageGap > 0 ? "bg-amber-500" : "bg-emerald-500")} />
              {percentageGap > 0 ? 'Avance pendiente' : 'Meta cumplida'}
            </span>
            <span className="font-mono text-slate-600 font-semibold">{targetPeriod}</span>
          </div>
        </div>

        {/* Card 4: ÍTEMS EN META */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
            <span>Ítems en Meta</span>
            <Info className="w-3.5 h-3.5 text-slate-300" />
          </div>

          <div className="flex items-end justify-between gap-3 mt-1">
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {achievedItemsCount}
                <span className="text-sm font-normal text-slate-600 font-sans ml-1">/ {totalDimensions}</span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {totalDimensions - achievedItemsCount} por completar
              </div>
            </div>

            {/* Mini progress ring or metric */}
            <div className="text-right">
              <span className="text-xs font-bold font-mono text-slate-800">
                {Math.round((achievedItemsCount / totalDimensions) * 100)}%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all"
                style={{ width: `${Math.round((achievedItemsCount / totalDimensions) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Middle Section (like SALES TREND and REVENUE BREAKDOWN in reference image) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): BALANCE Y PROYECCIÓN POR ÁREA (SALES TREND style with minimalist bar chart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                <span>Balance de Madurez por Área</span>
                <Info className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-slate-900 font-mono">
                  Hoy {currentScorePct}%
                </span>
                <span className="text-slate-400 font-medium text-xs font-mono">→</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  Meta {targetCategoryAvgPct}%
                </span>
                <span className="text-xs font-semibold text-emerald-800 font-mono ml-2">
                  (+{percentageGap}%)
                </span>
              </div>
            </div>

            {/* Segmented Category Buttons (like Weekly / Monthly / Yearly in reference image) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('all')}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                  selectedCategoryTab === 'all'
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Todas (360°)
              </button>
              {CATEGORIES_LIST.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryTab(c.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                    selectedCategoryTab === c.id
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {c.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Minimalist Bar Chart: Monochromatic Charcoal & Slate bars like the reference image */}
          <div className="space-y-4 pt-1">
            {CATEGORIES_LIST.filter(c => selectedCategoryTab === 'all' || selectedCategoryTab === c.id).map((c) => {
              const s = categoryStats[c.id];
              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-xs bg-slate-900" />
                      {c.name}
                      <span className="text-[11px] font-mono text-slate-600">({s.dims.length} ítems)</span>
                    </span>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-600">
                        Hoy: <strong className="text-slate-900">{s.currentPct}%</strong>
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-900 font-bold">
                        Meta: <strong className="text-slate-900">{s.targetItemPct}%</strong>
                      </span>
                      <span className="text-emerald-800 font-semibold text-[11px]">
                        +{s.gapPct}%
                      </span>
                    </div>
                  </div>

                  {/* Dual comparison bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-md overflow-hidden relative">
                    {/* Meta Bar */}
                    <div
                      className="bg-slate-300 h-full rounded-md absolute top-0 left-0 transition-all duration-300"
                      style={{ width: `${Math.min(100, s.targetItemPct)}%` }}
                    />
                    {/* Hoy Bar */}
                    <div
                      className="bg-slate-900 h-full rounded-md absolute top-0 left-0 transition-all duration-300"
                      style={{ width: `${Math.min(100, s.currentPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-900 rounded-xs inline-block" /> Estado Hoy
              <span className="w-2.5 h-2.5 bg-slate-300 rounded-xs inline-block ml-3" /> Meta Automática
            </span>
            <span className="text-[11px] font-mono text-slate-600">
              Recalculado en tiempo real según selección
            </span>
          </div>
        </div>

        {/* Right (1 col): RESUMEN Y ACCIONES RÁPIDAS (REVENUE BREAKDOWN style in reference image) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                <span>Distribución por Niveles</span>
                <Info className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <span className="text-xs font-semibold text-slate-600 font-mono">
                {targetPeriod}
              </span>
            </div>

            {/* Level Bars N0 to N4 */}
            <div className="space-y-3 pt-4">
              {LEVEL_LABELS.map((lvl) => {
                const count = targetLevelsDistribution[lvl.level] || 0;
                const pct = Math.round((count / totalDimensions) * 100);
                return (
                  <div key={lvl.level} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 font-mono">
                        {lvl.name}
                      </span>
                      <span className="text-slate-600 font-mono text-[11px]">
                        <strong>{count}</strong> de 33 ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Presets Section */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Acciones Rápidas
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAlignWithCurrentState}
                className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
              >
                Alinear a Hoy ({currentScorePct}%)
              </button>
              <button
                type="button"
                onClick={handleAdvanceOneLevelFromToday}
                className="px-2.5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer text-center"
              >
                Subir +1 Nivel
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(2)}
                className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
              >
                Todo Nivel 2 (50%)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(3)}
                className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
              >
                Todo Nivel 3 (75%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Bottom Table of Items (Exact replica of RECENT TRANSACTIONS table in reference image) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Ítems y Metas Individuales</span>
              <Info className="w-3.5 h-3.5 text-slate-300" />
            </h3>
            <span className="text-xs font-mono text-slate-600">
              ({filteredDimensions.length} de {totalDimensions} indicadores)
            </span>
          </div>

          {/* Search box inside table header */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Buscar ítem o descripción..."
                className="w-64 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Minimalist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 font-mono">
                <th className="py-3 px-4 w-14">ID :</th>
                <th className="py-3 px-4 min-w-[240px]">Indicador BIM :</th>
                <th className="py-3 px-4 w-32">Área :</th>
                <th className="py-3 px-4 w-36">Estado Hoy :</th>
                <th className="py-3 px-4 w-36">Meta Objetivo :</th>
                <th className="py-3 px-4 w-36">Estado :</th>
                <th className="py-3 px-4 min-w-[280px] text-right">Fijar Meta (N0 - N4) :</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDimensions.map((dim, idx) => {
                const currentLevel = currentSelections[dim.id] ?? 0;
                const targetLevel = targetSelections[dim.id] ?? 0;
                const isAchieved = currentLevel >= targetLevel;
                const gapLevels = Math.max(0, targetLevel - currentLevel);
                const isExpanded = expandedItemId === dim.id;

                const currentObj = dim.levels[currentLevel] || dim.levels[0];
                const targetObj = dim.levels[targetLevel] || dim.levels[0];

                const catObj = CATEGORIES_LIST.find((c) => c.id === dim.category);

                return (
                  <React.Fragment key={dim.id}>
                    <tr className="hover:bg-slate-50/80 transition-colors group">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        #{String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Name & details toggle */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : dim.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Ver detalles ISO 19650"
                          >
                            <ChevronRight
                              className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-90")}
                            />
                          </button>
                          <span className="font-semibold text-slate-900">
                            {dim.name}
                          </span>
                        </div>
                      </td>

                      {/* Área */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {catObj?.shortName || dim.category}
                      </td>

                      {/* Estado Hoy (con punto discreto como la captura) */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                          <span className="font-semibold">N{currentLevel}</span>
                          <span className="text-[11px] text-slate-600">({currentLevel * 25}%)</span>
                        </div>
                      </td>

                      {/* Meta Objetivo */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 text-slate-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                          <span className="font-bold">N{targetLevel}</span>
                          <span className="text-[11px] text-slate-600">({targetLevel * 25}%)</span>
                        </div>
                      </td>

                      {/* Estado / Brecha (como Success / Pending de la captura) */}
                      <td className="py-3.5 px-4">
                        {isAchieved ? (
                          <div className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>Meta Cumplida</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>Brecha: +{gapLevels} {gapLevels === 1 ? 'nivel' : 'niveles'}</span>
                          </div>
                        )}
                      </td>

                      {/* Selector Minimalista de Niveles N0 a N4 */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                          {LEVEL_LABELS.map((lvl) => {
                            const isSelected = targetLevel === lvl.level;
                            const isToday = currentLevel === lvl.level;

                            return (
                              <button
                                key={lvl.level}
                                type="button"
                                onClick={() => handleSetItemTarget(dim.id, lvl.level)}
                                className={cn(
                                  "px-2.5 py-1 text-xs font-bold font-mono rounded-md transition-all cursor-pointer relative",
                                  isSelected
                                    ? "bg-slate-900 text-white shadow-2xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                                )}
                                title={`Fijar meta en ${lvl.name}${isToday ? ' (Nivel actual hoy)' : ''}`}
                              >
                                <span>N{lvl.level}</span>
                                {isToday && !isSelected && (
                                  <span
                                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-slate-500"
                                    title="Nivel actual hoy"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>

                    {/* Fila desplegable con detalle de la descripción */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={7} className="py-3 px-6 text-xs text-slate-600">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-[10px] uppercase text-slate-400">
                                Situación Actual Hoy (N{currentLevel} · {currentObj.title}):
                              </span>
                              <p className="text-slate-700 leading-relaxed">
                                {currentObj.description}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-[10px] uppercase text-slate-400">
                                Objetivo Meta Planificado (N{targetLevel} · {targetObj.title}):
                              </span>
                              <p className="text-slate-700 leading-relaxed">
                                {targetObj.description}
                              </p>
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
    </div>
  );
};
