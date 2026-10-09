/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { cn } from './lib/utils';
import { BimMaturityMatrixSlide } from './components/BimMaturityMatrixSlide';

const MeshLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex flex-col gap-2.5", className)}>
    <div className="py-2 px-2 inline-flex items-center justify-center w-full select-none">
      <img 
        src="https://i.postimg.cc/K89NWRmZ/cropped-logo-mesh-estudio-2024.webp" 
        alt="Mesh Estudio" 
        referrerPolicy="no-referrer"
        className="h-12 w-full object-contain select-none pointer-events-none" 
      />
    </div>
    <div className="flex items-center gap-2 px-1">
      <div className="h-[1px] flex-1 bg-slate-200"></div>
      <span className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase leading-none font-mono">
        IMPLEMENTACIÓN BIM
      </span>
      <div className="h-[1px] flex-1 bg-slate-200"></div>
    </div>
  </div>
);

const Sidebar = ({ 
  width,
  onWidthChange
}: { 
  width: number;
  onWidthChange: (w: number) => void;
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.max(230, Math.min(440, startWidth + (moveEvent.clientX - startX)));
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
      className="hidden lg:flex flex-col h-screen max-h-screen bg-white text-slate-900 p-6 pb-8 border-r border-slate-200 relative overflow-hidden shrink-0 shadow-xs"
    >
      {/* Resize handle */}
      <div 
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 bottom-0 w-2 hover:w-2.5 bg-transparent hover:bg-emerald-500/10 active:bg-emerald-500/20 cursor-col-resize z-50 transition-all flex items-center justify-center group"
        title="Arrastra para ajustar el ancho del panel"
      >
        <div className="w-[2px] h-14 rounded bg-slate-200 group-hover:bg-emerald-500 transition-all"></div>
      </div>
      
      {/* Top logo container */}
      <div className="relative z-10 shrink-0 mb-8">
        <MeshLogo />
      </div>

      {/* Navigation list */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pr-1">
        <nav className="space-y-6">
          <div>
            <div className="space-y-1">
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold tracking-wide cursor-pointer bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs whitespace-nowrap"
              >
                <ClipboardList className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Matriz de Madurez</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Institutional Info */}
      <div className="relative z-10 shrink-0 mt-6 pt-4 border-t border-slate-100">
        <div className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="text-[10px] font-semibold text-slate-500">
            Evaluación Corporativa
          </div>
          <div className="text-xs font-bold text-slate-800 mt-0.5 font-mono">
            Modelo Bilal Succar · ISO 19650
          </div>
        </div>
      </div>
    </aside>
  );
};

export default function App() {
  const [sidebarWidth, setSidebarWidth] = useState(280);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 font-sans selection:bg-emerald-500/20 selection:text-emerald-950">
      <Sidebar 
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />
      
      <main className="flex-1 relative flex flex-col p-6 lg:p-10 overflow-hidden">
        {/* Subtle Light Grid Backdrop */}
        <div className="absolute inset-0 immersive-grid pointer-events-none"></div>
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>

        {/* Mobile Header with Logo */}
        <div className="lg:hidden relative z-10 mb-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <MeshLogo />
        </div>

        {/* Content Area */}
        <div className="flex-1 relative z-10 min-h-0 overflow-y-auto pr-1">
          <BimMaturityMatrixSlide />
        </div>
      </main>
    </div>
  );
}
