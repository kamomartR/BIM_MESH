import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Award,
  Check,
  TrendingUp,
  Compass,
  FileText,
  Lock,
  Unlock,
  Search,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  ISO9001_DIMENSIONS,
  ISO9001_CATEGORIES,
  Iso9001Category,
  Iso9001Dimension,
  DEFAULT_ISO9001_SELECTIONS,
  TOTAL_ISO9001_DIMENSIONS,
  MAX_ISO9001_POINTS,
  getIso9001MaturityLabel,
  computeIso9001CategoryActualScores,
} from '../lib/iso9001Data';
import {
  subscribeToIso9001MatrixState,
  saveIso9001MatrixStateToCloud,
} from '../lib/firebase';

export const LOCAL_ISO9001_DRAFT_KEY = 'mesh_iso9001_matrix_draft_v1';

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
  const [activeCategory, setActiveCategory] = useState<Iso9001Category | 'todas'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('Guardado');

  const [selections, setSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ISO9001_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections && typeof parsed.selections === 'object') {
          return { ...DEFAULT_ISO9001_SELECTIONS, ...parsed.selections };
        }
      }
    } catch {
      // Ignore fallback
    }
    return DEFAULT_ISO9001_SELECTIONS;
  });

  // Calculate current score
  const totalScorePoints = useMemo(() => {
    return (Object.values(selections) as number[]).reduce((acc: number, curr: number) => acc + (Number(curr) || 0), 0);
  }, [selections]);

  const scorePercentage = useMemo(() => {
    return Math.round((totalScorePoints / MAX_ISO9001_POINTS) * 100);
  }, [totalScorePoints]);

  const maturityInfo = useMemo(() => {
    return getIso9001MaturityLabel(scorePercentage);
  }, [scorePercentage]);

  const categoryScores = useMemo(() => {
    return computeIso9001CategoryActualScores(selections);
  }, [selections]);

  // Subscribe to Cloud
  useEffect(() => {
    const unsubscribe = subscribeToIso9001MatrixState((cloudData) => {
      if (cloudData?.selections && Object.keys(cloudData.selections).length > 0) {
        setSelections((prev) => ({
          ...prev,
          ...cloudData.selections,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Save changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const persistState = (newSelections: Record<string, number>) => {
    const totalPts = (Object.values(newSelections) as number[]).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    const scorePct = Math.round((totalPts / MAX_ISO9001_POINTS) * 100);
    const label = getIso9001MaturityLabel(scorePct).label;

    try {
      localStorage.setItem(
        LOCAL_ISO9001_DRAFT_KEY,
        JSON.stringify({
          selections: newSelections,
          scorePercentage: scorePct,
          maturityCategory: label,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Local storage handled
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveIso9001MatrixStateToCloud(newSelections, scorePct, label).catch(() => {});
    }, 600);

    setSaveToastMessage('Cambio sincronizado');
    setShowSaveFeedback(true);
    setTimeout(() => setShowSaveFeedback(false), 2000);
  };

  const handleSelectLevel = (dimensionId: string, levelIndex: number) => {
    if (!isEditing) return;
    const next = { ...selections, [dimensionId]: levelIndex };
    setSelections(next);
    persistState(next);
  };

  const handleResetToBaseline = () => {
    if (!isEditing) return;
    if (window.confirm('¿Restablecer la Matriz ISO 9001 al diagnóstico inicial de referencia?')) {
      setSelections(DEFAULT_ISO9001_SELECTIONS);
      persistState(DEFAULT_ISO9001_SELECTIONS);
    }
  };

  // Filter dimensions
  const filteredDimensions = useMemo(() => {
    return ISO9001_DIMENSIONS.filter((dim) => {
      const matchCat = activeCategory === 'todas' || dim.category === activeCategory;
      const matchQuery =
        !searchQuery ||
        dim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dim.clauseNumber.includes(searchQuery);
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast notification */}
      {showSaveFeedback && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 transition-all animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION (Minimalist sober aesthetic) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              SISTEMA DE GESTIÓN DE CALIDAD
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              ISO 9001:2015 · 21 Ítems
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Matriz de Calidad ISO 9001</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              Mesh Estudio
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnóstico cuantitativo por niveles de madurez (N0 a N4) en las 7 cláusulas operativas de la norma ISO 9001.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Edit Lock / Unlock Button */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
              isEditing
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={isEditing ? 'Haz clic para bloquear la edición' : 'Activar edición para modificar niveles'}
          >
            {isEditing ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-white" />
                <span>Edición Activa</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Bloqueado (Solo Lectura)</span>
              </>
            )}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleResetToBaseline}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Restablecer al diagnóstico inicial"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restablecer</span>
            </button>
          )}

          {onOpenMetas && (
            <button
              type="button"
              onClick={onOpenMetas}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Configurar Metas</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* TOP 4 KPI CARDS (Matches reference dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Score */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              PUNTAJE GLOBAL SGC
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {scorePercentage}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              {totalScorePoints} / {MAX_ISO9001_POINTS} pts
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-slate-900 transition-all duration-500"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>

        {/* Card 2: Maturity Category */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              NIVEL DE MADUREZ SGC
            </span>
            <Award className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate tracking-tight mt-1">
            {maturityInfo.badge}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-1">
            {maturityInfo.label}
          </div>
          <div className="mt-2.5">
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border ${maturityInfo.color}`}>
              Nivel {maturityInfo.level} de 4
            </span>
          </div>
        </div>

        {/* Card 3: Evaluated Items */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              ÍTEMS EVALUADOS
            </span>
            <Check className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {TOTAL_ISO9001_DIMENSIONS}
            </span>
            <span className="text-xs text-emerald-800 font-medium">100% Cobertura</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            7 Cláusulas auditadas de ISO 9001:2015
          </div>
        </div>

        {/* Card 4: Brecha a Excelencia */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              BRECHA A CLASE MUNDIAL
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {Math.max(0, 100 - scorePercentage)}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              +{MAX_ISO9001_POINTS - totalScorePoints} pts req.
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {scorePercentage >= 80 ? 'Sistema en optimización continua' : 'Oportunidades de estandarización'}
          </div>
        </div>
      </div>

      {/* FILTER BAR & SEARCH (Segmented control) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Segmented Clause Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl border border-slate-200/60 max-w-full">
          <button
            type="button"
            onClick={() => setActiveCategory('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'todas'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Todas ({TOTAL_ISO9001_DIMENSIONS})
          </button>
          {ISO9001_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const score = categoryScores[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{cat.clause}: {cat.shortTitle}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {score.percentage}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cláusula o requisito..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-medium"
          />
        </div>
      </div>

      {/* EDIT MODE BANNER */}
      {isEditing ? (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Modo Edición Activado:</strong> Haz clic sobre cualquier nivel (N0 a N4) en las tarjetas inferiores para actualizar el diagnóstico. Los cambios se sincronizan en tiempo real.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-[11px] font-bold text-amber-800 hover:underline shrink-0 ml-3 cursor-pointer"
          >
            Finalizar Edición
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              La matriz está protegida contra cambios accidentales. Presiona <strong>"Bloqueado"</strong> arriba para habilitar la edición.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[11px] font-bold text-slate-900 hover:underline shrink-0 ml-3 cursor-pointer"
          >
            Habilitar Edición
          </button>
        </div>
      )}

      {/* DIMENSIONS LIST */}
      <div className="space-y-4">
        {filteredDimensions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No se encontraron requisitos que coincidan con la búsqueda.
          </div>
        ) : (
          filteredDimensions.map((dim) => {
            const currentLevel = selections[dim.id] ?? 0;
            const categoryInfo = ISO9001_CATEGORIES.find((c) => c.id === dim.category);

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

                  {/* Level status indicator */}
                  <div className="shrink-0 flex items-center gap-2 sm:self-center">
                    <span className="text-[11px] font-mono text-slate-400">Actual:</span>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-2xs">
                      N{currentLevel} · {dim.levels[currentLevel]?.title.split(':')[1]?.trim() || ''}
                    </span>
                  </div>
                </div>

                {/* 5 Levels Selector (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-100">
                  {dim.levels.map((lvl, lvlIdx) => {
                    const isSelected = currentLevel === lvlIdx;
                    return (
                      <button
                        key={lvlIdx}
                        type="button"
                        disabled={!isEditing}
                        onClick={() => handleSelectLevel(dim.id, lvlIdx)}
                        className={`text-left p-3 rounded-xl border transition-all relative ${
                          isEditing ? 'cursor-pointer hover:border-slate-400' : 'cursor-default opacity-90'
                        } ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-1 ring-slate-900'
                            : 'bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        {/* Level badge */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-bold font-mono tracking-wider ${
                            isSelected ? 'text-white' : 'text-slate-500'
                          }`}>
                            N{lvlIdx}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
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
          })
        )}
      </div>
    </div>
  );
};
