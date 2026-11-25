/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpenCheck,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  GitBranch,
  Layers,
  ListOrdered,
  Target,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { IMPLEMENTATION_TABS, ImplementationTabDef } from '../lib/masterPlanData';
import { MasterPlanEditor } from './MasterPlanEditor';

interface BimImplementacionModuleSlideProps {
  initialTabId?: string;
  onOpenRoadmap?: () => void;
  onOpenMatrix?: () => void;
  onOpenMetas?: () => void;
}

export const BimImplementacionModuleSlide: React.FC<BimImplementacionModuleSlideProps> = ({
  initialTabId = 'act-01',
  onOpenRoadmap,
  onOpenMatrix,
  onOpenMetas,
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(initialTabId);

  const activeTab: ImplementationTabDef =
    IMPLEMENTATION_TABS.find((t) => t.id === activeTabId) || IMPLEMENTATION_TABS[0];

  return (
    <div className="space-y-6 pb-16 text-slate-900 font-sans">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-800">MÓDULO OPERATIVO BIM</span>
            <span aria-hidden="true">·</span>
            <span>ISO 19650</span>
            <span aria-hidden="true">·</span>
            <span>10 ENTREGABLES SECUENCIALES</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpenCheck className="w-6 h-6 text-slate-900 shrink-0" />
            <span>Implementación BIM</span>
          </h1>
          <p className="text-xs text-slate-600 max-w-3xl">
            Espacio de trabajo por pestañas para construir, editar y emitir uno por uno los entregables oficiales del plan de implementación de Mesh Estudio.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenRoadmap && (
            <button
              type="button"
              onClick={onOpenRoadmap}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver Cronograma (10 Pasos)</span>
            </button>
          )}
          {onOpenMetas && (
            <button
              type="button"
              onClick={onOpenMetas}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-slate-500" />
              <span>Metas BIM</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Tabs for ACT-01 .. ACT-10 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {IMPLEMENTATION_TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            const isReady = tab.status === 'active';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 border',
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                    : isReady
                    ? 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 font-semibold'
                    : 'bg-white text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800 font-medium'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    isReady
                      ? isActive
                        ? 'bg-emerald-400'
                        : 'bg-emerald-500'
                      : isActive
                      ? 'bg-slate-400'
                      : 'bg-slate-300'
                  )}
                />
                <span className="font-mono text-[11px] opacity-80">{tab.code}</span>
                <span>{tab.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Context Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-slate-900">{activeTab.code}</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-slate-800">{activeTab.fullTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{activeTab.deliverableCode}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Horizonte: {activeTab.weeks}</span>
          <span aria-hidden="true">·</span>
          <span>Predecesora: {activeTab.predecessors}</span>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab.id === 'act-01' ? (
        <MasterPlanEditor />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Paso {activeTab.stepNumber} de 10
                </span>
                <span aria-hidden="true">·</span>
                <span>Código Entregable: {activeTab.deliverableCode}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {activeTab.fullTitle}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {activeTab.activityDescription}
              </p>
            </div>

            <div className="text-xs font-mono text-slate-500 md:text-right space-y-1 shrink-0">
              <div className="text-slate-900 font-semibold">Siguiente fase en cola</div>
              <div>Ventana planificada: {activeTab.weeks}</div>
            </div>
          </div>

          {/* 3 Detail Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Entregable Oficial</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeTab.deliverableName}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <GitBranch className="w-4 h-4 text-slate-500" />
                <span>Dependencia Predecesora</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requiere aprobación previa de{' '}
                <strong className="font-mono text-slate-900">{activeTab.predecessors}</strong> antes de su despliegue definitivo.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Criterio de Finalización</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeTab.completionCriteria}
              </p>
            </div>
          </div>

          {/* Scope of Sub-tools planned for this tab */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              <Layers className="w-3.5 h-3.5" />
              <span>Componentes planificados para esta pestaña</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {activeTab.plannedSubmodules.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <span className="font-mono font-bold text-slate-400">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Esta pestaña se habilitará con su herramienta interactiva a medida que avancemos en la secuencia del plan.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTabId('act-01')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Volver a ACT-01 (Plan Maestro)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {onOpenMatrix && (
                <button
                  type="button"
                  onClick={onOpenMatrix}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Ver Matriz BIM
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
