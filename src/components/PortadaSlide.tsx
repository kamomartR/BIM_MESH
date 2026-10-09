import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ClipboardList,
  Cpu,
  Layers,
  FileText,
  Compass,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { subscribeToMatrixState } from '../lib/firebase';

export type MatrixCategory = 'tecnologia' | 'procesos' | 'politicas' | 'capacidad' | 'escala';

interface PortadaSlideProps {
  onOpenMatrix: (category?: MatrixCategory) => void;
}

const LOCAL_DRAFT_KEY = 'mesh_bim_maturity_draft_v1';
const TOTAL_DIMENSIONS = 33;

const PILLARS: {
  id: MatrixCategory;
  index: string;
  title: string;
  dimensionsCount: number;
  description: string;
  deliverables: string;
  icon: React.ComponentType<{ className?: string }>;
  accentText: string;
}[] = [
  {
    id: 'tecnologia',
    index: '01',
    title: 'Tecnología e Infraestructura',
    dimensionsCount: 9,
    description:
      'Estandarización de software de autoría y coordinación, estaciones de trabajo de alto desempeño y despliegue del Entorno Común de Datos (CDE).',
    deliverables: 'Software · Hardware · Redes y CDE',
    icon: Cpu,
    accentText: 'text-blue-700',
  },
  {
    id: 'procesos',
    index: '02',
    title: 'Procesos y Flujos de Trabajo',
    dimensionsCount: 9,
    description:
      'Definición de roles operativos, rutinas de coordinación multidisciplinaria, gestión del conocimiento y liderazgo para la transición digital.',
    deliverables: 'Recursos · Actividades · Modelado · Liderazgo',
    icon: Layers,
    accentText: 'text-emerald-700',
  },
  {
    id: 'politicas',
    index: '03',
    title: 'Políticas y Estándares',
    dimensionsCount: 7,
    description:
      'Consolidación de manuales BEP/EIR, programas de formación continua, control de calidad normativo (ISO 19650) y anexos contractuales.',
    deliverables: 'Entrenamiento · Estándares · Contratos · KPIs',
    icon: FileText,
    accentText: 'text-purple-700',
  },
  {
    id: 'capacidad',
    index: '04',
    title: 'Capacidad Técnica BIM',
    dimensionsCount: 5,
    description:
      'Evolución progresiva desde el modelado basado en objetos (Etapa 1) hacia la colaboración federada (Etapa 2) y la integración en red (Etapa 3).',
    deliverables: 'Modelado · Colaboración · Integración en Red',
    icon: Compass,
    accentText: 'text-amber-700',
  },
  {
    id: 'escala',
    index: '05',
    title: 'Escala Organizativa',
    dimensionsCount: 3,
    description:
      'Despliegue transversal de la metodología en todas las áreas internas del estudio, equipos de proyecto e integración con consultores externos.',
    deliverables: 'Organización · Equipos · Mercados',
    icon: TrendingUp,
    accentText: 'text-pink-700',
  },
];

export const PortadaSlide: React.FC<PortadaSlideProps> = ({ onOpenMatrix }) => {
  const [scorePercentage, setScorePercentage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections) {
          const vals = Object.values(parsed.selections) as number[];
          const sum = vals.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
          return Math.round((sum / (TOTAL_DIMENSIONS * 4)) * 100);
        }
      }
    } catch {
      // Ignore storage error
    }
    return Math.round((8 / (TOTAL_DIMENSIONS * 4)) * 100);
  });

  const [maturityCategory, setMaturityCategory] = useState<string>('BIM Inicial / Incipiente');

  useEffect(() => {
    const unsubscribe = subscribeToMatrixState((cloudData) => {
      if (typeof cloudData?.scorePercentage === 'number') {
        setScorePercentage(cloudData.scorePercentage);
      }
      if (cloudData?.maturityCategory) {
        setMaturityCategory(cloudData.maturityCategory);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto text-slate-900 font-sans space-y-8 pb-10">
      {/* Main Cover Hero Container */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Brand & Primary Proposition */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Quiet unboxed metadata line */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                <span className="font-bold text-emerald-700">DOCUMENTO ESTRATÉGICO</span>
                <span aria-hidden="true">·</span>
                <span>ISO 19650</span>
                <span aria-hidden="true">·</span>
                <span>MODELO BILAL SUCCAR</span>
              </div>

              {/* Main Cover Title requested by user */}
              <div className="space-y-4">
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]"
                  style={{ textWrap: 'balance' }}
                >
                  Plan de Implementación BIM Mesh Estudio
                </h1>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Sistema integral de diagnóstico, estandarización y seguimiento continuo para la
                  adopción corporativa de Building Information Modeling en todas las dimensiones de
                  la organización.
                </p>
              </div>
            </div>

            {/* Primary CTA & Action Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenMatrix()}
                className="inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span>Abrir Matriz de Madurez BIM</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Guardado automático habilitado en tiempo real</span>
              </div>
            </div>
          </div>

          {/* Right Column: Corporate Identity & Current Diagnostic Summary */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-center">
                <img
                  src="https://i.postimg.cc/K89NWRmZ/cropped-logo-mesh-estudio-2024.webp"
                  alt="Mesh Estudio"
                  referrerPolicy="no-referrer"
                  className="h-14 w-auto object-contain select-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  Estado Actual de Evaluación
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-3xl font-mono font-extrabold text-emerald-700 tabular-nums">
                    {scorePercentage}%
                  </span>
                  <span className="text-xs font-mono text-slate-600 tabular-nums">
                    33 dimensiones
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 pt-1">{maturityCategory}</p>
              </div>
            </div>

            <div className="border-t border-slate-200/80 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Vectores Evaluados</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">5 áreas</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Escala de Niveles</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">Nivel 0 a 4</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Puntaje Máximo</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">132 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Pillars Grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Estructura del Plan y Vectores de Medición
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Selecciona cualquier vector para evaluar directamente sus dimensiones en la Matriz de Madurez.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            5 vectores · 33 dimensiones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => onOpenMatrix(pillar.id)}
                className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-500/60 rounded-xl p-5 text-left transition-all flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-mono font-bold ${pillar.accentText} tabular-nums`}>
                      {pillar.index}. {pillar.title}
                    </span>
                    <IconComponent className={`w-4 h-4 ${pillar.accentText} shrink-0`} />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="truncate">{pillar.deliverables}</span>
                  <span className="font-mono font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform whitespace-nowrap shrink-0 tabular-nums">
                    {pillar.dimensionsCount} filas →
                  </span>
                </div>
              </button>
            );
          })}

          {/* Direct Action Card for Full Matrix */}
          <button
            type="button"
            onClick={() => onOpenMatrix('tecnologia')}
            className="group bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded-xl p-5 text-left transition-all flex flex-col justify-between space-y-4 cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-emerald-800">
                  06. Diagnóstico y Recetario BIM
                </span>
                <ClipboardList className="w-4 h-4 text-emerald-700 shrink-0" />
              </div>

              <p className="text-xs text-emerald-950/80 leading-relaxed">
                Accede a la matriz interactiva completa para calificar cada dimensión del Nivel 0 al
                Nivel 4 y obtener recomendaciones automáticas de auditoría.
              </p>
            </div>

            <div className="pt-3 border-t border-emerald-200/70 flex items-center justify-between gap-2 text-xs font-bold text-emerald-800">
              <span>Ir a la Matriz de Madurez</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
