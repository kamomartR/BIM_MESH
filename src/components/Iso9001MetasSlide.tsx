import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Save,
  Check,
  Calendar,
  Layers,
  FileText,
  Compass,
  AlertCircle,
  TrendingUp,
  Award,
  Search,
  ChevronDown,
  Info,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
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
  saveIso9001GoalsStateToCloud,
} from '../lib/firebase';
import { LOCAL_ISO9001_DRAFT_KEY } from './Iso9001MatrixSlide';

export const LOCAL_ISO9001_GOALS_KEY = 'mesh_iso9001_goals_v1';

interface Iso9001MetasSlideProps {
  onOpenMatrix?: () => void;
  onOpenInforme?: () => void;
}

export const Iso9001MetasSlide: React.FC<Iso9001MetasSlideProps> = ({
  onOpenMatrix,
  onOpenInforme,
}) => {
  // Current evaluation from matrix ("Dónde estoy hoy")
  const [actualSelections, setActualSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ISO9001_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections && typeof parsed.selections === 'object') {
          return { ...DEFAULT_ISO9001_SELECTIONS, ...parsed.selections };
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ISO9001_SELECTIONS;
  });

  // Target item selections
  const [targetSelections, setTargetSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ISO9001_GOALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.targetSelections && typeof parsed.targetSelections === 'object') {
          return { ...DEFAULT_ISO9001_TARGET_SELECTIONS, ...parsed.targetSelections };
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ISO9001_TARGET_SELECTIONS;
  });

  // Executive metadata
  const [targetPeriod, setTargetPeriod] = useState<string>('Q4 2026');
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');
  const [responsibleRole, setResponsibleRole] = useState<string>('Director de Calidad / Auditor Líder SGC');
  const [notes, setNotes] = useState<string>(
    'Plan estratégico de calidad ISO 9001 para Mesh Estudio: Estandarización de procesos de diseño, control de cambios y reducción de reprocesos a <3%.'
  );

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<Iso9001Category | 'todas'>('todas');
  const [searchFilter, setSearchFilter] = useState('');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('Metas guardadas');

  // AUTOMATIC Category Targets (100% computed from targetSelections)
  const autoCategoryTargets = useMemo(() => {
    return computeIso9001CategoryTargets(targetSelections);
  }, [targetSelections]);

  // Actual stats today
  const actualScores = useMemo(() => {
    return computeIso9001CategoryActualScores(actualSelections);
  }, [actualSelections]);

  const actualTotalPoints = useMemo(() => {
    return (Object.values(actualSelections) as number[]).reduce((acc: number, curr: number) => acc + (Number(curr) || 0), 0);
  }, [actualSelections]);

  const actualScorePercentage = useMemo(() => {
    return Math.round((actualTotalPoints / MAX_ISO9001_POINTS) * 100);
  }, [actualTotalPoints]);

  const actualMaturity = useMemo(() => {
    return getIso9001MaturityLabel(actualScorePercentage);
  }, [actualScorePercentage]);

  // Target stats
  const targetTotalPoints = useMemo(() => {
    return (Object.values(targetSelections) as number[]).reduce((acc: number, curr: number) => acc + (Number(curr) || 0), 0);
  }, [targetSelections]);

  const targetScorePercentage = useMemo(() => {
    return Math.round((targetTotalPoints / MAX_ISO9001_POINTS) * 100);
  }, [targetTotalPoints]);

  const targetMaturity = useMemo(() => {
    return getIso9001MaturityLabel(targetScorePercentage);
  }, [targetScorePercentage]);

  const gapPercentage = useMemo(() => {
    return Math.max(0, targetScorePercentage - actualScorePercentage);
  }, [targetScorePercentage, actualScorePercentage]);

  // Sync with Cloud
  useEffect(() => {
    const unsubMatrix = subscribeToIso9001MatrixState((cloudMatrix) => {
      if (cloudMatrix?.selections && Object.keys(cloudMatrix.selections).length > 0) {
        setActualSelections((prev) => ({ ...prev, ...cloudMatrix.selections }));
      }
    });

    const unsubGoals = subscribeToIso9001GoalsState((cloudGoals) => {
      if (cloudGoals?.targetSelections && Object.keys(cloudGoals.targetSelections).length > 0) {
        setTargetSelections((prev) => ({ ...prev, ...cloudGoals.targetSelections }));
        if (cloudGoals.targetPeriod) setTargetPeriod(cloudGoals.targetPeriod);
        if (cloudGoals.targetDate) setTargetDate(cloudGoals.targetDate);
        if (cloudGoals.responsibleRole) setResponsibleRole(cloudGoals.responsibleRole);
        if (cloudGoals.notes) setNotes(cloudGoals.notes);
      }
    });

    return () => {
      unsubMatrix();
      unsubGoals();
    };
  }, []);

  // Save changes automatically
  const persistGoals = (
    nextTargetSelections: Record<string, number>,
    periodVal = targetPeriod,
    dateVal = targetDate,
    roleVal = responsibleRole,
    notesVal = notes
  ) => {
    const computedTargets = computeIso9001CategoryTargets(nextTargetSelections);
    const totalPts = (Object.values(nextTargetSelections) as number[]).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    const scorePct = Math.round((totalPts / MAX_ISO9001_POINTS) * 100);

    const payload = {
      targetSelections: nextTargetSelections,
      categoryTargets: computedTargets,
      targetScorePercentage: scorePct,
      targetPeriod: periodVal,
      targetDate: dateVal,
      responsibleRole: roleVal,
      notes: notesVal,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(LOCAL_ISO9001_GOALS_KEY, JSON.stringify(payload));
    } catch {
      // Local storage handled
    }

    saveIso9001GoalsStateToCloud(payload).catch(() => {});

    setSaveToastMessage('Meta actualizada');
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleSetItemTarget = (dimensionId: string, level: number) => {
    const next = { ...targetSelections, [dimensionId]: level };
    setTargetSelections(next);
    persistGoals(next);
  };

  // Presets
  const handleAlignToToday = () => {
    if (window.confirm('¿Alinear todas las metas al diagnóstico actual ("Dónde estoy hoy")?')) {
      const next = { ...actualSelections };
      setTargetSelections(next);
      persistGoals(next);
    }
  };

  const handleSetPresetLevel = (level: number) => {
    if (window.confirm(`¿Establecer todos los 21 ítems al Nivel ${level} como meta?`)) {
      const next: Record<string, number> = {};
      ISO9001_DIMENSIONS.forEach((d) => {
        next[d.id] = level;
      });
      setTargetSelections(next);
      persistGoals(next);
    }
  };

  const handleBumpPlusOne = () => {
    const next: Record<string, number> = {};
    ISO9001_DIMENSIONS.forEach((d) => {
      const current = actualSelections[d.id] ?? 0;
      next[d.id] = Math.min(4, current + 1);
    });
    setTargetSelections(next);
    persistGoals(next);
  };

  // Filter dimensions
  const filteredDimensions = useMemo(() => {
    return ISO9001_DIMENSIONS.filter((dim) => {
      const matchCat = activeCategoryFilter === 'todas' || dim.category === activeCategoryFilter;
      const matchQuery =
        !searchFilter ||
        dim.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        dim.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        dim.clauseNumber.includes(searchFilter);
      return matchCat && matchQuery;
    });
  }, [activeCategoryFilter, searchFilter]);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast notification */}
      {showSaveToast && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 transition-all animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              CONFIGURACIÓN DE METAS SGC
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              Metas 100% Automáticas
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Metas de Implementación ISO 9001</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              Mesh Estudio
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Las metas de cada cláusula se calculan automáticamente como resultado de los niveles fijados en los 21 ítems.
          </p>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAlignToToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            title="Copiar el estado actual como punto de partida"
          >
            <span>Alinear a Hoy</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetPresetLevel(2)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Meta Nivel 2</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetPresetLevel(3)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Meta Nivel 3</span>
          </button>

          <button
            type="button"
            onClick={handleBumpPlusOne}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>+1 Nivel a Todo</span>
          </button>

          {onOpenInforme && (
            <button
              type="button"
              onClick={onOpenInforme}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span>Ver Informe PDF</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* TOP 3 CORE COMPARISON CARDS (Identical to user's desired "Dónde estoy hoy" vs "Meta Automática") */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Dónde Estoy Hoy */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              DÓNDE ESTOY HOY (SGC)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              Línea Base
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {actualScorePercentage}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              {actualTotalPoints} / {MAX_ISO9001_POINTS} pts
            </span>
          </div>
          <div className="text-xs font-bold text-slate-800 mt-2 truncate">
            {actualMaturity.label}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-slate-500 transition-all duration-500"
              style={{ width: `${actualScorePercentage}%` }}
            />
          </div>
        </div>

        {/* Card 2: Meta Objetivo Automática */}
        <div className="bg-white border border-slate-900 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono text-slate-900">
              META OBJETIVO AUTOMÁTICA
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold">
              100% Dinámica
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {targetScorePercentage}%
            </span>
            <span className="text-xs font-mono text-slate-600 font-bold">
              {targetTotalPoints} / {MAX_ISO9001_POINTS} pts
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-2 truncate">
            {targetMaturity.label}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-slate-900 transition-all duration-500"
              style={{ width: `${targetScorePercentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Brecha (Gap) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              BRECHA POR AVANZAR (GAP)
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${
              gapPercentage > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {gapPercentage > 0 ? `+${gapPercentage}%` : '0%'}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {targetTotalPoints - actualTotalPoints >= 0 ? `+${targetTotalPoints - actualTotalPoints}` : 0} pts
            </span>
          </div>
          <div className="text-xs font-bold text-slate-800 mt-2 truncate">
            {gapPercentage === 0 ? 'Meta alcanzada o superada' : `Incremento para alcanzar la meta en ${targetPeriod}`}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                gapPercentage > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (gapPercentage / 100) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* METADATA CONFIGURATION PANEL (Period, Date, Responsible) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span className="font-mono uppercase tracking-wider text-[11px] text-slate-400">
            PARÁMETROS EJECUTIVOS DE LA META SGC
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            Sincronización automática con el informe
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Periodo Objetivo
            </label>
            <input
              type="text"
              value={targetPeriod}
              onChange={(e) => {
                setTargetPeriod(e.target.value);
                persistGoals(targetSelections, e.target.value, targetDate, responsibleRole, notes);
              }}
              placeholder="ej. Q4 2026"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Fecha Límite
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                persistGoals(targetSelections, targetPeriod, e.target.value, responsibleRole, notes);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white font-medium font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Líder / Responsable SGC
            </label>
            <input
              type="text"
              value={responsibleRole}
              onChange={(e) => {
                setResponsibleRole(e.target.value);
                persistGoals(targetSelections, targetPeriod, targetDate, e.target.value, notes);
              }}
              placeholder="ej. Director de Calidad"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* 7 CLAUSES OVERVIEW & AUTO TARGET BREAKDOWN */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Metas Calculadas Automáticamente por Cláusula
            </h3>
            <p className="text-xs text-slate-500">
              Comparativa en tiempo real entre la evaluación de hoy y el resultado ponderado de las metas de cada ítem.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Escala 0% - 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ISO9001_CATEGORIES.map((cat) => {
            const actual = actualScores[cat.id];
            const target = autoCategoryTargets[cat.id];
            const gap = target - actual.percentage;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat.id ? 'todas' : cat.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold font-mono text-slate-700">
                    {cat.clause}
                  </span>
                  <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                    gap > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {gap > 0 ? `+${gap}%` : 'Meta OK'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate mb-2">
                  {cat.title}
                </div>

                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Hoy:</span>
                    <span className="font-bold text-slate-700">{actual.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-900">
                    <span className="font-semibold">Meta Automática:</span>
                    <span className="font-bold">{target}%</span>
                  </div>
                </div>

                {/* Comparative bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-slate-900 transition-all duration-300"
                    style={{ width: `${target}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER BAR & SEARCH */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl border border-slate-200/60 max-w-full">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === 'todas'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Todas ({TOTAL_ISO9001_DIMENSIONS})
          </button>
          {ISO9001_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {cat.clause}: {cat.shortTitle}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar ítem para fijar meta..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-medium"
          />
        </div>
      </div>

      {/* ITEM-BY-ITEM TARGET CONFIGURATION */}
      <div className="space-y-4">
        {filteredDimensions.map((dim) => {
          const actualLvl = actualSelections[dim.id] ?? 0;
          const targetLvl = targetSelections[dim.id] ?? 0;
          const categoryInfo = ISO9001_CATEGORIES.find((c) => c.id === dim.category);
          const gap = targetLvl - actualLvl;

          return (
            <div
              key={dim.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="text-2xl select-none shrink-0 mt-0.5">
                    {dim.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {categoryInfo?.clause}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        {categoryInfo?.title}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {dim.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dim.description}
                    </p>
                  </div>
                </div>

                {/* Status Badge: Hoy vs Meta */}
                <div className="shrink-0 flex items-center gap-2 sm:self-center">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400">
                      Hoy: N{actualLvl} → Meta: N{targetLvl}
                    </div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      gap > 0
                        ? 'bg-amber-100 text-amber-800'
                        : gap === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {gap > 0 ? `Brecha: +${gap} nivel(es)` : 'Meta alcanzada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Levels Selector for Target */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-100">
                {dim.levels.map((lvl, lvlIdx) => {
                  const isSelected = targetLvl === lvlIdx;
                  const isActualToday = actualLvl === lvlIdx;

                  return (
                    <button
                      key={lvlIdx}
                      type="button"
                      onClick={() => handleSetItemTarget(dim.id, lvlIdx)}
                      className={`text-left p-3 rounded-xl border transition-all relative cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-1 ring-slate-900'
                          : 'bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                    >
                      {/* Top badges */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold font-mono tracking-wider ${
                          isSelected ? 'text-white' : 'text-slate-500'
                        }`}>
                          N{lvlIdx}
                        </span>

                        <div className="flex items-center gap-1">
                          {isActualToday && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 text-slate-800 font-bold" title="Nivel evaluado hoy">
                              HOY
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <div className={`text-xs font-bold mb-1 leading-tight ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}>
                        {lvl.title.replace(`Nivel ${lvlIdx}: `, '')}
                      </div>

                      {/* Description */}
                      <div className={`text-[11px] leading-relaxed line-clamp-4 ${
                        isSelected ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        {lvl.description}
                      </div>
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
