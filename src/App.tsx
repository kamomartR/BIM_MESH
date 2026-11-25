/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ClipboardList,
  Compass,
  FileBarChart2,
  Target,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Award,
  FileSpreadsheet,
  Download,
  ListOrdered,
  BookOpenCheck,
} from 'lucide-react';
import { cn } from './lib/utils';
import { BimMaturityMatrixSlide } from './components/BimMaturityMatrixSlide';
import { PortadaSlide, MatrixCategory } from './components/PortadaSlide';
import { InformeImplementacionSlide } from './components/InformeImplementacionSlide';
import { MetasConfigSlide } from './components/MetasConfigSlide';
import { RoadmapSlide } from './components/RoadmapSlide';
import { BimImplementacionModuleSlide } from './components/BimImplementacionModuleSlide';

// ISO 9001 Components
import { Iso9001PortadaSlide } from './components/Iso9001PortadaSlide';
import { Iso9001MatrixSlide } from './components/Iso9001MatrixSlide';
import { Iso9001MetasSlide } from './components/Iso9001MetasSlide';
import { Iso9001InformeSlide } from './components/Iso9001InformeSlide';
import { Iso9001Category } from './lib/iso9001Data';
import {
  exportBimMatrixToExcel,
  exportIso9001MatrixToExcel,
  exportBothMatricesToExcel,
  exportRoadmapToExcel,
} from './lib/excelExport';

export type StandardFramework = 'bim' | 'iso9001';
export type ActiveView = 'portada' | 'matriz' | 'informe' | 'metas' | 'roadmap' | 'implementacion';

const MeshLogo = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors select-none',
      onClick && 'cursor-pointer',
      className
    )}
  >
    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 shadow-2xs">
      <img
        src="https://i.postimg.cc/K89NWRmZ/cropped-logo-mesh-estudio-2024.webp"
        alt="Mesh Estudio Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain select-none pointer-events-none"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono leading-tight">
        Estudio BIM & Calidad
      </div>
      <div className="text-sm font-bold text-slate-900 truncate tracking-tight">
        Mesh Estudio
      </div>
    </div>
    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  </div>
);

const Sidebar = ({
  width,
  onWidthChange,
  activeStandard,
  onSelectStandard,
  activeView,
  onSelectView,
}: {
  width: number;
  onWidthChange: (w: number) => void;
  activeStandard: StandardFramework;
  onSelectStandard: (std: StandardFramework) => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView, standard?: StandardFramework) => void;
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.max(250, Math.min(390, startWidth + (moveEvent.clientX - startX)));
      onWidthChange(nextWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <aside
      style={{ width: `${width}px` }}
      className="hidden lg:flex flex-col h-screen max-h-screen bg-white text-slate-900 border-r border-slate-200/90 relative shrink-0 select-none"
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 bottom-0 w-1.5 hover:w-2 bg-transparent hover:bg-slate-300 active:bg-slate-400 cursor-col-resize z-50 transition-all group"
        title="Arrastra para ajustar el ancho"
      />

      {/* Top Header Card */}
      <div className="p-4 border-b border-slate-100">
        <MeshLogo onClick={() => onSelectView('portada')} />
      </div>

      {/* Framework Switcher Pill inside Sidebar */}
      <div className="px-3.5 pt-3">
        <div className="p-1 bg-slate-100 rounded-xl border border-slate-200/60 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectStandard('bim')}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer',
              activeStandard === 'bim'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            ISO 19650 (BIM)
          </button>
          <button
            type="button"
            onClick={() => onSelectStandard('iso9001')}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer',
              activeStandard === 'iso9001'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            ISO 9001 (Calidad)
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {/* SECTION 1: BIM METHODOLOGY (ISO 19650) */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            <span>Metodología BIM · ISO 19650</span>
            {activeStandard === 'bim' && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectView('portada', 'bim')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'bim' && activeView === 'portada'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Compass
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'bim' && activeView === 'portada' ? 'text-white' : 'text-slate-400'
              )}
            />
            <span className="truncate">Plan BIM (Portada)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('matriz', 'bim')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'bim' && activeView === 'matriz'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <ClipboardList
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'bim' && activeView === 'matriz' ? 'text-white' : 'text-slate-400'
              )}
            />
            <span className="truncate">Matriz de Madurez (33 ítems)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('roadmap', 'bim')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'bim' && activeView === 'roadmap'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <ListOrdered
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'bim' && activeView === 'roadmap' ? 'text-white' : 'text-slate-400'
              )}
            />
            <span className="truncate">Plan Inicial (10 Pasos)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('metas', 'bim')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'bim' && activeView === 'metas'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Target
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'bim' && activeView === 'metas' ? 'text-white' : 'text-slate-400'
              )}
            />
            <span className="truncate">Metas de Implementación</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('informe', 'bim')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'bim' && activeView === 'informe'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <FileBarChart2
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'bim' && activeView === 'informe' ? 'text-white' : 'text-slate-400'
              )}
            />
            <span className="truncate">Informe de Estado BIM (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('implementacion', 'bim')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'bim' && activeView === 'implementacion'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <BookOpenCheck
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'bim' && activeView === 'implementacion'
                  ? 'text-white'
                  : 'text-slate-400'
              )}
            />
            <span className="truncate">Implementación BIM</span>
          </button>
        </div>

        {/* SECTION 2: QUALITY MANAGEMENT (ISO 9001) */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            <span>Gestión de Calidad · ISO 9001</span>
            {activeStandard === 'iso9001' && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectView('portada', 'iso9001')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'iso9001' && activeView === 'portada'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <ShieldCheck
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'iso9001' && activeView === 'portada'
                  ? 'text-white'
                  : 'text-slate-400'
              )}
            />
            <span className="truncate">Plan SGC (Portada)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('matriz', 'iso9001')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'iso9001' && activeView === 'matriz'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <ClipboardList
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'iso9001' && activeView === 'matriz'
                  ? 'text-white'
                  : 'text-slate-400'
              )}
            />
            <span className="truncate">Matriz de Calidad (21 ítems)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('metas', 'iso9001')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'iso9001' && activeView === 'metas'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Target
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'iso9001' && activeView === 'metas'
                  ? 'text-white'
                  : 'text-slate-400'
              )}
            />
            <span className="truncate">Metas de Calidad SGC</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('informe', 'iso9001')}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer',
              activeStandard === 'iso9001' && activeView === 'informe'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <FileBarChart2
              className={cn(
                'w-4 h-4 shrink-0',
                activeStandard === 'iso9001' && activeView === 'informe'
                  ? 'text-white'
                  : 'text-slate-400'
              )}
            />
            <span className="truncate">Informe de Calidad (PDF)</span>
          </button>
        </div>

        {/* SECTION 3: EXCEL EXPORTS (.XLSX) */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            <span>Descargas Excel (.xlsx)</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          </div>

          <button
            type="button"
            onClick={() => exportRoadmapToExcel()}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-left group"
            title="Descargar cuadro de prioridades (10 pasos) en Excel"
          >
            <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
              10
            </div>
            <span className="truncate flex-1 font-semibold">Plan Inicial (10 Pasos)</span>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => exportBimMatrixToExcel()}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer text-left group"
            title="Descargar matriz BIM completa con metas y diccionario en Excel"
          >
            <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
              BIM
            </div>
            <span className="truncate flex-1">Matriz BIM ISO 19650</span>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => exportIso9001MatrixToExcel()}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition-colors cursor-pointer text-left group"
            title="Descargar matriz ISO 9001 completa con metas y rúbrica en Excel"
          >
            <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
              ISO
            </div>
            <span className="truncate flex-1">Matriz Calidad ISO 9001</span>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => exportBothMatricesToExcel()}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-left group"
            title="Descargar ambas matrices consolidadas en un solo libro Excel"
          >
            <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
              2x
            </div>
            <span className="truncate flex-1 font-bold">Consolidado Integral</span>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 shrink-0" />
          </button>
        </div>

        {/* Framework & Norms badges */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Marcos Integrados
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-800 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                ISO 19650
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                Partes 1 & 2
              </span>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">
              Gestión CDE y ciclo de vida de la información.
            </p>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-800 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-700" />
                ISO 9001:2015
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                7 Cláusulas
              </span>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">
              Calidad, riesgos y mejora continua del estudio.
            </p>
          </div>
        </div>

        {/* Cloud Sync Status */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Sincronización
          </div>
          <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Firebase Firestore
              </span>
              <span className="text-[10px] text-emerald-800 font-mono font-bold">En Línea</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-[10px] text-slate-600">Almacenamiento Local</span>
              <CheckCircle2 className="w-3 h-3 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Card */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            CM
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">Camilo Martínez</div>
            <div className="text-[10px] text-slate-600 truncate">BIM Manager & Auditor SGC</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
};

export default function App() {
  const [sidebarWidth, setSidebarWidth] = useState(270);
  const [activeStandard, setActiveStandard] = useState<StandardFramework>('bim');
  const [activeView, setActiveView] = useState<ActiveView>('implementacion');
  const [selectedBimCategory, setSelectedBimCategory] = useState<MatrixCategory>('tecnologia');
  const [selectedIsoCategory, setSelectedIsoCategory] = useState<Iso9001Category | 'todas'>('todas');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSelectStandard = (std: StandardFramework) => {
    setActiveStandard(std);
    if (std === 'iso9001' && (activeView === 'roadmap' || activeView === 'implementacion')) {
      setActiveView('metas');
    }
  };

  const handleSelectView = (view: ActiveView, standard?: StandardFramework) => {
    if (standard) {
      setActiveStandard(standard);
    }
    setActiveView(view);
  };

  const handleOpenBimMatrix = (category?: MatrixCategory) => {
    setActiveStandard('bim');
    if (category) {
      setSelectedBimCategory(category);
    }
    setActiveView('matriz');
  };

  const handleOpenBimMetas = () => {
    setActiveStandard('bim');
    setActiveView('metas');
  };

  const handleOpenIsoMatrix = (category?: Iso9001Category) => {
    setActiveStandard('iso9001');
    if (category) {
      setSelectedIsoCategory(category);
    } else {
      setSelectedIsoCategory('todas');
    }
    setActiveView('matriz');
  };

  const handleOpenIsoMetas = () => {
    setActiveStandard('iso9001');
    setActiveView('metas');
  };

  const handleOpenRoadmap = () => {
    setActiveStandard('bim');
    setActiveView('roadmap');
  };

  const handleOpenIsoInforme = () => {
    setActiveStandard('iso9001');
    setActiveView('informe');
  };

  const getViewBreadcrumb = () => {
    const stdPrefix = activeStandard === 'bim' ? 'ISO 19650 (BIM)' : 'ISO 9001 (Calidad SGC)';
    switch (activeView) {
      case 'portada':
        return `${stdPrefix} > Plan de Implementación`;
      case 'roadmap':
        return `${stdPrefix} > Plan Inicial (10 Pasos Prioritarios)`;
      case 'matriz':
        return `${stdPrefix} > Matriz de Madurez`;
      case 'informe':
        return `${stdPrefix} > Informe Ejecutivo (PDF)`;
      case 'implementacion':
        return `${stdPrefix} > Implementación BIM`;
      case 'metas':
      default:
        return `${stdPrefix} > Metas de Implementación`;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F5F7] overflow-hidden text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <Sidebar
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
        activeStandard={activeStandard}
        onSelectStandard={handleSelectStandard}
        activeView={activeView}
        onSelectView={handleSelectView}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Minimalist Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 gap-4 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span
                className="hover:text-slate-600 transition-colors cursor-pointer"
                onClick={() => setActiveView('portada')}
              >
                Mesh Estudio
              </span>
              <span>&gt;</span>
              <span className="text-slate-900 font-semibold truncate">{getViewBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleSelectStandard('bim')}
                className={cn(
                  'px-3 py-1 rounded-md transition-all cursor-pointer',
                  activeStandard === 'bim'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                ISO 19650 (BIM)
              </button>
              <button
                type="button"
                onClick={() => handleSelectStandard('iso9001')}
                className={cn(
                  'px-3 py-1 rounded-md transition-all cursor-pointer',
                  activeStandard === 'iso9001'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                ISO 9001 (Calidad)
              </button>
            </div>

            <div className="relative hidden md:flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar cláusulas, indicadores..."
                className="w-56 pl-8 pr-10 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
              />
              <span className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 bg-white border border-slate-200 rounded">
                ⌘K
              </span>
            </div>

            <button
              type="button"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer hidden sm:flex"
              title="Notificaciones de auditoría"
            >
              <Bell className="w-3.5 h-3.5 text-slate-600" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Q4 2026</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Descargar matrices en formato Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">Descargar Excel</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Exportar a Excel (.xlsx)
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        exportRoadmapToExcel();
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left cursor-pointer transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        10
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                          Plan Inicial (10 Pasos)
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Prioridades · Predecesoras · Entregables
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        exportBimMatrixToExcel();
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left cursor-pointer transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        BIM
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          Matriz BIM (ISO 19650)
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          33 ítems · Metas · Rúbrica N0-N4
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        exportIso9001MatrixToExcel();
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left cursor-pointer transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        ISO
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                          Matriz Calidad (ISO 9001)
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          21 ítems · 7 Cláusulas · Metas SGC
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        exportBothMatricesToExcel();
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-left cursor-pointer transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        2x
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900">Consolidado Integral</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          BIM + ISO 9001 en un solo libro
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-700" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {activeView === 'metas' ? (
              <button
                type="button"
                onClick={() =>
                  activeStandard === 'bim' ? handleOpenBimMatrix() : handleOpenIsoMatrix()
                }
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Ver Matriz</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  activeStandard === 'bim' ? handleOpenBimMetas() : handleOpenIsoMetas()
                }
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Configurar Metas</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Header Nav */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-2.5 space-y-2">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => handleSelectStandard('bim')}
              className={cn(
                'flex-1 py-1 rounded-md text-center transition-all',
                activeStandard === 'bim' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
              )}
            >
              BIM (ISO 19650)
            </button>
            <button
              type="button"
              onClick={() => handleSelectStandard('iso9001')}
              className={cn(
                'flex-1 py-1 rounded-md text-center transition-all',
                activeStandard === 'iso9001'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600'
              )}
            >
              Calidad (ISO 9001)
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveView('portada')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap',
                activeView === 'portada' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
              )}
            >
              Portada
            </button>
            <button
              type="button"
              onClick={() => setActiveView('matriz')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap',
                activeView === 'matriz' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
              )}
            >
              Matriz
            </button>
            {activeStandard === 'bim' && (
              <button
                type="button"
                onClick={() => setActiveView('roadmap')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap',
                  activeView === 'roadmap'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 bg-slate-50'
                )}
              >
                Plan Inicial (10 Pasos)
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveView('metas')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap',
                activeView === 'metas' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
              )}
            >
              Metas
            </button>
            <button
              type="button"
              onClick={() => setActiveView('informe')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap',
                activeView === 'informe' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
              )}
            >
              Informe
            </button>
            {activeStandard === 'bim' && (
              <button
                type="button"
                onClick={() => setActiveView('implementacion')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap',
                  activeView === 'implementacion'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 bg-slate-50'
                )}
              >
                Implementación BIM
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                activeStandard === 'bim' ? exportBimMatrixToExcel() : exportIso9001MatrixToExcel()
              }
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 cursor-pointer"
              title="Descargar matriz en Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeStandard === 'bim' ? (
              activeView === 'portada' ? (
                <PortadaSlide
                  onOpenMatrix={handleOpenBimMatrix}
                  onOpenMetas={handleOpenBimMetas}
                  onOpenRoadmap={handleOpenRoadmap}
                />
              ) : activeView === 'roadmap' ? (
                <RoadmapSlide
                  onOpenMatrix={handleOpenBimMatrix}
                  onOpenMetas={handleOpenBimMetas}
                  onOpenInforme={() => setActiveView('informe')}
                />
              ) : activeView === 'matriz' ? (
                <BimMaturityMatrixSlide initialCategory={selectedBimCategory} />
              ) : activeView === 'informe' ? (
                <InformeImplementacionSlide
                  onOpenMatrix={handleOpenBimMatrix}
                  onOpenMetas={handleOpenBimMetas}
                />
              ) : activeView === 'implementacion' ? (
                <BimImplementacionModuleSlide
                  onOpenRoadmap={handleOpenRoadmap}
                  onOpenMatrix={() => handleOpenBimMatrix()}
                  onOpenMetas={handleOpenBimMetas}
                />
              ) : (
                <MetasConfigSlide onOpenMatrix={handleOpenBimMatrix} />
              )
            ) : activeView === 'portada' ? (
              <Iso9001PortadaSlide
                onOpenMatrix={handleOpenIsoMatrix}
                onOpenMetas={handleOpenIsoMetas}
                onOpenInforme={handleOpenIsoInforme}
              />
            ) : activeView === 'matriz' ? (
              <Iso9001MatrixSlide
                initialCategory={selectedIsoCategory}
                onOpenMetas={handleOpenIsoMetas}
                onOpenInforme={handleOpenIsoInforme}
              />
            ) : activeView === 'informe' ? (
              <Iso9001InformeSlide
                onOpenMatrix={handleOpenIsoMatrix}
                onOpenMetas={handleOpenIsoMetas}
              />
            ) : (
              <Iso9001MetasSlide
                onOpenMatrix={handleOpenIsoMatrix}
                onOpenInforme={handleOpenIsoInforme}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
