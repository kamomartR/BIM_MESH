import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ClipboardList,
  Target,
  FileBarChart2,
  Award,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Users,
  Shield,
  Layers,
  Workflow,
  SearchCheck,
  Sparkles,
} from 'lucide-react';
import {
  ISO9001_CATEGORIES,
  Iso9001Category,
  TOTAL_ISO9001_DIMENSIONS,
  MAX_ISO9001_POINTS,
  getIso9001MaturityLabel,
} from '../lib/iso9001Data';
import { subscribeToIso9001MatrixState } from '../lib/firebase';
import { LOCAL_ISO9001_DRAFT_KEY } from './Iso9001MatrixSlide';

interface Iso9001PortadaSlideProps {
  onOpenMatrix: (category?: Iso9001Category) => void;
  onOpenMetas?: () => void;
  onOpenInforme?: () => void;
}

const CLAUSE_ICONS: Record<Iso9001Category, React.ComponentType<{ className?: string }>> = {
  contexto: Compass,
  liderazgo: Users,
  planificacion: Shield,
  apoyo: Layers,
  operacion: Workflow,
  evaluacion: SearchCheck,
  mejora: Sparkles,
};

export const Iso9001PortadaSlide: React.FC<Iso9001PortadaSlideProps> = ({
  onOpenMatrix,
  onOpenMetas,
  onOpenInforme,
}) => {
  const [scorePercentage, setScorePercentage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ISO9001_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.scorePercentage !== undefined) {
          return Number(parsed.scorePercentage) || 0;
        }
      }
    } catch {
      // Fallback
    }
    return 35; // Default initial baseline
  });

  useEffect(() => {
    const unsub = subscribeToIso9001MatrixState((cloud) => {
      if (cloud?.scorePercentage !== undefined) {
        setScorePercentage(cloud.scorePercentage);
      }
    });
    return () => unsub();
  }, []);

  const maturityInfo = getIso9001MaturityLabel(scorePercentage);

  return (
    <div className="space-y-6 pb-16">
      {/* HERO BANNER (Minimalist sober style) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              SISTEMA DE GESTIÓN DE LA CALIDAD (SGC)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              NORMA INTERNACIONAL ISO 9001:2015
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Plan de Gestión de Calidad{' '}
            <span className="text-slate-500 font-normal">Mesh Estudio</span>
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Metodología estructurada de calidad para estudios de arquitectura y modelado BIM. 
            Estandarización de procesos, gestión de riesgos en proyectos, control de salidas no conformes y ciclo de mejora continua PHVA en 21 requisitos fundamentales.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenMatrix()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4 text-slate-300" />
              <span>Evaluar Matriz de Calidad</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {onOpenMetas && (
              <button
                type="button"
                onClick={onOpenMetas}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-slate-500" />
                <span>Configurar Metas</span>
              </button>
            )}

            {onOpenInforme && (
              <button
                type="button"
                onClick={onOpenInforme}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
              >
                <FileBarChart2 className="w-4 h-4 text-slate-500" />
                <span>Informe y Auditoría PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating Maturity Stat in Header */}
        <div className="hidden lg:block absolute right-8 top-8 w-64 bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-right">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
            ESTADO SGC ACTUAL
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-0.5">
            {scorePercentage}%
          </div>
          <div className="text-xs font-bold text-slate-800 truncate mt-1">
            {maturityInfo.badge}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            21 ítems auditados en 7 cláusulas
          </div>
        </div>
      </div>

      {/* 7 CLAUSES CARDS (Pillars of ISO 9001) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400">
            LAS 7 CLÁUSULAS DEL SISTEMA DE GESTIÓN DE CALIDAD
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Haz clic en cualquier área para auditarla
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ISO9001_CATEGORIES.map((cat) => {
            const Icon = CLAUSE_ICONS[cat.id] || Compass;

            return (
              <div
                key={cat.id}
                onClick={() => onOpenMatrix(cat.id)}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {cat.clause}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">
                    {cat.dimensionsCount} Requisitos
                  </span>
                  <span className="font-bold text-slate-900 group-hover:underline flex items-center gap-1">
                    <span>Auditar</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
