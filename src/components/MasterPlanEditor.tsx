/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Save,
  Check,
  Plus,
  Pencil,
  Eye,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  RotateCcw,
  Table2,
  List,
  MessageSquareQuote,
  Heading2,
  AlignLeft,
  PenTool,
  X,
  Columns3,
  Rows3,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  MasterPlanDocument,
  DocumentModule,
  ContentBlock,
  ContentBlockType,
  TableBlock,
  ListBlock,
  SignaturesBlock,
  INITIAL_MASTER_PLAN,
  createNewBlock,
  createNewModule,
} from '../lib/masterPlanData';
import { generateMasterPlanPdf } from '../lib/masterPlanPdf';
import {
  subscribeToMasterPlanState,
  saveMasterPlanToCloud,
} from '../lib/firebase';

export const LOCAL_MASTER_PLAN_KEY = 'mesh_bim_master_plan_v1';

/**
 * Safely renders inline **bold** and `code` segments without dangerouslySetInnerHTML
 */
function RichInlineText({ text }: { text: string }) {
  const parts = (text || '').split(/(\*\*.*?\*\*|`.*?`)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={idx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={idx}
              className="px-1 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
}

export const MasterPlanEditor: React.FC = () => {
  const [plan, setPlan] = useState<MasterPlanDocument>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MASTER_PLAN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.metadata && Array.isArray(parsed?.modules) && parsed.modules.length > 0) {
          return parsed as MasterPlanDocument;
        }
      }
    } catch {
      // Fallback to initial draft
    }
    return INITIAL_MASTER_PLAN;
  });

  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [editingMetadata, setEditingMetadata] = useState<boolean>(false);
  const [editingModuleIds, setEditingModuleIds] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // New module modal / inline creator
  const [showAddModule, setShowAddModule] = useState<boolean>(false);
  const [newModuleTitle, setNewModuleTitle] = useState<string>('');
  const [newModuleTemplate, setNewModuleTemplate] = useState<
    'text' | 'table' | 'list' | 'mixed' | 'signatures'
  >('text');

  // Save & PDF status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const isLocalMutationRef = useRef<boolean>(false);

  // Subscribe to Firestore for cross-session sync
  useEffect(() => {
    const unsub = subscribeToMasterPlanState((cloudData) => {
      if (cloudData?.documentJson && !isLocalMutationRef.current) {
        try {
          const parsed = JSON.parse(cloudData.documentJson);
          if (parsed?.metadata && Array.isArray(parsed?.modules) && parsed.modules.length > 0) {
            setPlan(parsed as MasterPlanDocument);
            if (cloudData.updatedAt && typeof cloudData.updatedAt.toDate === 'function') {
              setLastSavedAt(
                cloudData.updatedAt.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              );
            }
          }
        } catch {
          // Ignore malformed cloud JSON
        }
      }
    });
    return () => unsub();
  }, []);

  // Persist to localStorage whenever plan changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_MASTER_PLAN_KEY, JSON.stringify(plan));
    } catch {
      // Ignore storage quota error
    }
  }, [plan]);

  const mutatePlan = (updater: (prev: MasterPlanDocument) => MasterPlanDocument) => {
    isLocalMutationRef.current = true;
    setPlan(updater);
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const json = JSON.stringify(plan);
      localStorage.setItem(LOCAL_MASTER_PLAN_KEY, json);
      await saveMasterPlanToCloud({
        code: plan.metadata.code,
        version: plan.metadata.version,
        title: plan.metadata.title,
        modulesCount: plan.modules.length,
        documentJson: json,
      });
      setSaveStatus('saved');
      setLastSavedAt(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      isLocalMutationRef.current = false;
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateMasterPlanPdf(plan);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleResetDraft = () => {
    mutatePlan(() => INITIAL_MASTER_PLAN);
    setEditingModuleIds({});
    setEditingMetadata(false);
    setConfirmReset(false);
  };

  // --- Metadata updater ---
  const updateMetadata = (field: keyof MasterPlanDocument['metadata'], value: string) => {
    mutatePlan((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  // --- Module CRUD ---
  const toggleEditModule = (modId: string) => {
    setEditingModuleIds((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const updateModuleTitle = (modId: string, title: string) => {
    mutatePlan((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === modId ? { ...m, title } : m)),
    }));
  };

  const moveModule = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= plan.modules.length) return;
    mutatePlan((prev) => {
      const next = [...prev.modules];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return { ...prev, modules: next };
    });
  };

  const duplicateModule = (index: number) => {
    const source = plan.modules[index];
    if (!source) return;
    const copyId = `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const clonedBlocks: ContentBlock[] = JSON.parse(JSON.stringify(source.blocks)).map(
      (b: ContentBlock, idx: number) => ({
        ...b,
        id: `blk-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
      })
    );
    const duplicated: DocumentModule = {
      id: copyId,
      title: `${source.title} (Copia)`,
      blocks: clonedBlocks,
    };
    mutatePlan((prev) => {
      const next = [...prev.modules];
      next.splice(index + 1, 0, duplicated);
      return { ...prev, modules: next };
    });
    setEditingModuleIds((prev) => ({ ...prev, [copyId]: true }));
  };

  const deleteModule = (modId: string) => {
    mutatePlan((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== modId),
    }));
    setConfirmDeleteId(null);
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newModuleTitle.trim() || 'Nuevo Módulo del Plan BIM';
    const created = createNewModule(trimmed, newModuleTemplate);
    mutatePlan((prev) => ({
      ...prev,
      modules: [...prev.modules, created],
    }));
    setViewMode('editor');
    setEditingModuleIds((prev) => ({ ...prev, [created.id]: true }));
    setNewModuleTitle('');
    setNewModuleTemplate('text');
    setShowAddModule(false);
    setTimeout(() => {
      document.getElementById(`master-mod-${created.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 80);
  };

  // --- Block CRUD inside a Module ---
  const addBlockToModule = (modId: string, blockType: ContentBlockType) => {
    const newBlock = createNewBlock(blockType);
    mutatePlan((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === modId ? { ...m, blocks: [...m.blocks, newBlock] } : m
      ),
    }));
  };

  const updateBlock = (modId: string, blockId: string, updated: ContentBlock) => {
    mutatePlan((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === modId
          ? { ...m, blocks: m.blocks.map((b) => (b.id === blockId ? updated : b)) }
          : m
      ),
    }));
  };

  const deleteBlock = (modId: string, blockId: string) => {
    mutatePlan((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === modId
          ? { ...m, blocks: m.blocks.filter((b) => b.id !== blockId) }
          : m
      ),
    }));
  };

  const moveBlock = (modId: string, blockIdx: number, direction: -1 | 1) => {
    mutatePlan((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.id !== modId) return m;
        const target = blockIdx + direction;
        if (target < 0 || target >= m.blocks.length) return m;
        const nextBlocks = [...m.blocks];
        const [moved] = nextBlocks.splice(blockIdx, 1);
        nextBlocks.splice(target, 0, moved);
        return { ...m, blocks: nextBlocks };
      }),
    }));
  };

  // --- Render Read-Only Block ---
  const renderBlockView = (block: ContentBlock) => {
    switch (block.type) {
      case 'subheading':
        return (
          <h4 className="text-sm font-bold text-slate-900 pt-2 tracking-tight">
            {block.text}
          </h4>
        );
      case 'paragraph':
        return (
          <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
            <RichInlineText text={block.text} />
          </p>
        );
      case 'list':
        return block.ordered ? (
          <ol className="list-decimal list-outside pl-5 space-y-2 text-[13px] text-slate-700 leading-relaxed">
            {block.items.map((item) => (
              <li key={item.id} className="pl-1">
                {item.lead && (
                  <strong className="font-semibold text-slate-900">{item.lead} </strong>
                )}
                <RichInlineText text={item.text} />
              </li>
            ))}
          </ol>
        ) : (
          <ul className="list-disc list-outside pl-5 space-y-2 text-[13px] text-slate-700 leading-relaxed">
            {block.items.map((item) => (
              <li key={item.id} className="pl-1">
                {item.lead && (
                  <strong className="font-semibold text-slate-900">{item.lead} </strong>
                )}
                <RichInlineText text={item.text} />
              </li>
            ))}
          </ul>
        );
      case 'callout':
        return (
          <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-emerald-600 rounded-r-xl p-4 space-y-1">
            {block.title && (
              <div className="text-xs font-bold text-slate-900 tracking-tight">
                {block.title}
              </div>
            )}
            <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
              <RichInlineText text={block.text} />
            </p>
          </div>
        );
      case 'table':
        return (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  {block.headers.map((h, ci) => (
                    <th
                      key={ci}
                      className="py-2.5 px-3 font-semibold border-r border-slate-800 last:border-r-0 align-top"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {block.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={ri % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                  >
                    {block.headers.map((_, ci) => (
                      <td
                        key={ci}
                        className={cn(
                          'py-2.5 px-3 border-r border-slate-200 last:border-r-0 align-top leading-relaxed',
                          ci === 0 ? 'font-semibold text-slate-900' : 'text-slate-700'
                        )}
                      >
                        <RichInlineText text={row[ci] || ''} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'signatures':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 pb-2">
            {block.entries.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="h-12 border-b border-slate-400 mb-2" />
                <div className="text-sm font-bold text-slate-900">{entry.name}</div>
                {entry.role && <div className="text-xs text-slate-700">{entry.role}</div>}
                {entry.organization && (
                  <div className="text-xs text-slate-500">{entry.organization}</div>
                )}
                <div className="text-xs font-mono text-slate-500 pt-1">
                  {entry.datePlaceholder}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  // --- Render Editable Block ---
  const renderBlockEditor = (modId: string, block: ContentBlock, blockIdx: number, totalBlocks: number) => {
    const blockLabelMap: Record<ContentBlockType, string> = {
      paragraph: 'Párrafo',
      subheading: 'Subtítulo',
      table: 'Tabla Estructurada',
      list: 'Lista',
      callout: 'Dictamen / Nota Destacada',
      signatures: 'Bloque de Firmas',
    };

    return (
      <div
        key={block.id}
        className="border border-slate-200 rounded-xl bg-slate-50/60 p-3.5 space-y-3"
      >
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/80">
          <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
            {blockLabelMap[block.type]}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => moveBlock(modId, blockIdx, -1)}
              disabled={blockIdx === 0}
              className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              title="Subir bloque"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => moveBlock(modId, blockIdx, 1)}
              disabled={blockIdx === totalBlocks - 1}
              className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              title="Bajar bloque"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => deleteBlock(modId, block.id)}
              className="p-1 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              title="Eliminar bloque"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Paragraph Editor */}
        {block.type === 'paragraph' && (
          <div className="space-y-1">
            <textarea
              rows={4}
              value={block.text}
              onChange={(e) => updateBlock(modId, block.id, { ...block, text: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 leading-relaxed focus:outline-none focus:border-slate-500"
            />
            <div className="text-[11px] text-slate-400">
              Sugerencia: envuelve palabras entre **doble asterisco** para resaltarlas en negrita.
            </div>
          </div>
        )}

        {/* Subheading Editor */}
        {block.type === 'subheading' && (
          <input
            type="text"
            value={block.text}
            onChange={(e) => updateBlock(modId, block.id, { ...block, text: e.target.value })}
            className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-500"
            placeholder="Ej: 3.1. Desempeño Actual por Vector Corporativo"
          />
        )}

        {/* Callout Editor */}
        {block.type === 'callout' && (
          <div className="space-y-2">
            <input
              type="text"
              value={block.title}
              onChange={(e) => updateBlock(modId, block.id, { ...block, title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-500"
              placeholder="Título del dictamen o nota"
            />
            <textarea
              rows={3}
              value={block.text}
              onChange={(e) => updateBlock(modId, block.id, { ...block, text: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 leading-relaxed focus:outline-none focus:border-slate-500"
            />
          </div>
        )}

        {/* List Editor */}
        {block.type === 'list' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => updateBlock(modId, block.id, { ...block, ordered: false })}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-semibold cursor-pointer',
                    !block.ordered ? 'bg-slate-900 text-white' : 'text-slate-600'
                  )}
                >
                  Viñetas
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(modId, block.id, { ...block, ordered: true })}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-semibold cursor-pointer',
                    block.ordered ? 'bg-slate-900 text-white' : 'text-slate-600'
                  )}
                >
                  Numerada
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextList: ListBlock = {
                    ...block,
                    items: [
                      ...block.items,
                      {
                        id: `li-${Date.now()}`,
                        lead: 'Nuevo punto:',
                        text: 'Descripción del punto.',
                      },
                    ],
                  };
                  updateBlock(modId, block.id, nextList);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar ítem</span>
              </button>
            </div>

            <div className="space-y-2">
              {block.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-white p-2 rounded-lg border border-slate-200"
                >
                  <input
                    type="text"
                    value={item.lead}
                    onChange={(e) => {
                      const nextItems = block.items.map((it) =>
                        it.id === item.id ? { ...it, lead: e.target.value } : it
                      );
                      updateBlock(modId, block.id, { ...block, items: nextItems });
                    }}
                    placeholder="Encabezado (negrita)"
                    className="md:col-span-4 px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                  <textarea
                    rows={2}
                    value={item.text}
                    onChange={(e) => {
                      const nextItems = block.items.map((it) =>
                        it.id === item.id ? { ...it, text: e.target.value } : it
                      );
                      updateBlock(modId, block.id, { ...block, items: nextItems });
                    }}
                    placeholder="Detalle del ítem"
                    className="md:col-span-7 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-slate-400"
                  />
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = block.items.filter((_, i) => i !== idx);
                        updateBlock(modId, block.id, { ...block, items: nextItems });
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Eliminar ítem"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Editor */}
        {block.type === 'table' && (
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-slate-500">
                {block.rows.length} filas · {block.headers.length} columnas
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextTable: TableBlock = {
                      ...block,
                      headers: [...block.headers, `Columna ${block.headers.length + 1}`],
                      rows: block.rows.map((r) => [...r, '']),
                    };
                    updateBlock(modId, block.id, nextTable);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                >
                  <Columns3 className="w-3 h-3" />
                  <span>+ Columna</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const emptyRow = block.headers.map(() => '');
                    const nextTable: TableBlock = {
                      ...block,
                      rows: [...block.rows, emptyRow],
                    };
                    updateBlock(modId, block.id, nextTable);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-white cursor-pointer"
                >
                  <Rows3 className="w-3 h-3" />
                  <span>+ Fila</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    {block.headers.map((header, ci) => (
                      <th key={ci} className="p-1.5 border-r border-slate-200 min-w-[115px]">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={header}
                            onChange={(e) => {
                              const nextHeaders = [...block.headers];
                              nextHeaders[ci] = e.target.value;
                              updateBlock(modId, block.id, { ...block, headers: nextHeaders });
                            }}
                            className="w-full px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500"
                          />
                          {block.headers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextHeaders = block.headers.filter((_, idx) => idx !== ci);
                                const nextRows = block.rows.map((r) =>
                                  r.filter((_, idx) => idx !== ci)
                                );
                                updateBlock(modId, block.id, {
                                  ...block,
                                  headers: nextHeaders,
                                  rows: nextRows,
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 cursor-pointer shrink-0"
                              title="Eliminar columna"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="w-9 p-1.5 text-center text-[10px] text-slate-400">Acc.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {block.rows.map((row, ri) => (
                    <tr key={ri}>
                      {block.headers.map((_, ci) => (
                        <td key={ci} className="p-1.5 border-r border-slate-200 align-top">
                          <textarea
                            rows={2}
                            value={row[ci] || ''}
                            onChange={(e) => {
                              const nextRows = block.rows.map((r, rIdx) => {
                                if (rIdx !== ri) return r;
                                const copy = [...r];
                                copy[ci] = e.target.value;
                                return copy;
                              });
                              updateBlock(modId, block.id, { ...block, rows: nextRows });
                            }}
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-slate-500 leading-snug"
                          />
                        </td>
                      ))}
                      <td className="p-1.5 text-center align-top">
                        <button
                          type="button"
                          onClick={() => {
                            const nextRows = block.rows.filter((_, idx) => idx !== ri);
                            updateBlock(modId, block.id, { ...block, rows: nextRows });
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signatures Editor */}
        {block.type === 'signatures' && (
          <div className="space-y-2.5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const nextSig: SignaturesBlock = {
                    ...block,
                    entries: [
                      ...block.entries,
                      {
                        id: `sig-${Date.now()}`,
                        name: 'Nuevo Firmante',
                        role: 'Rol / Cargo',
                        organization: plan.metadata.organization || 'Mesh Estudio',
                        datePlaceholder: 'Fecha: ____ / ____ / 2026',
                      },
                    ],
                  };
                  updateBlock(modId, block.id, nextSig);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar firmante</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {block.entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const nextEntries = block.entries.filter((_, i) => i !== idx);
                      updateBlock(modId, block.id, { ...block, entries: nextEntries });
                    }}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Eliminar firmante"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    value={entry.name}
                    onChange={(e) => {
                      const nextEntries = block.entries.map((en) =>
                        en.id === entry.id ? { ...en, name: e.target.value } : en
                      );
                      updateBlock(modId, block.id, { ...block, entries: nextEntries });
                    }}
                    placeholder="Nombre o Cargo Principal"
                    className="w-full pr-7 px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-md"
                  />
                  <input
                    type="text"
                    value={entry.role}
                    onChange={(e) => {
                      const nextEntries = block.entries.map((en) =>
                        en.id === entry.id ? { ...en, role: e.target.value } : en
                      );
                      updateBlock(modId, block.id, { ...block, entries: nextEntries });
                    }}
                    placeholder="Rol en la Implementación"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={entry.organization}
                      onChange={(e) => {
                        const nextEntries = block.entries.map((en) =>
                          en.id === entry.id ? { ...en, organization: e.target.value } : en
                        );
                        updateBlock(modId, block.id, { ...block, entries: nextEntries });
                      }}
                      placeholder="Organización"
                      className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                    />
                    <input
                      type="text"
                      value={entry.datePlaceholder}
                      onChange={(e) => {
                        const nextEntries = block.entries.map((en) =>
                          en.id === entry.id ? { ...en, datePlaceholder: e.target.value } : en
                        );
                        updateBlock(modId, block.id, { ...block, entries: nextEntries });
                      }}
                      placeholder="Fecha"
                      className="px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Authoring Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented View Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'editor'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editor Modular</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'preview'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Documento</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2 font-mono">
            <span>{plan.metadata.code}</span>
            <span aria-hidden="true">·</span>
            <span>{plan.modules.length} módulos</span>
            {lastSavedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>Guardado {lastSavedAt}</span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModule(!showAddModule)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Agregar Módulo</span>
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Restablecer al borrador inicial ME-BIM-PLA-001"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restablecer</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <span className="text-amber-900 font-semibold">¿Restablecer borrador?</span>
              <button
                type="button"
                onClick={handleResetDraft}
                className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold cursor-pointer"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-0.5 rounded bg-white border border-amber-200 text-slate-700 font-semibold cursor-pointer"
              >
                No
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveToCloud}
            disabled={isSaving}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border',
              saveStatus === 'saved'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
            )}
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-60"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Imprimir / Descargar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline Add New Module Creator */}
      {showAddModule && (
        <form
          onSubmit={handleCreateModule}
          className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Agregar Nuevo Módulo al Documento Maestro
              </h3>
              <p className="text-xs text-slate-500">
                Se numerará automáticamente como Módulo {plan.modules.length + 1} y podrá reordenarlo en cualquier momento.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModule(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Título del Nuevo Módulo
              </label>
              <input
                type="text"
                required
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Ej: Plan de Capacitación y Gestión del Cambio"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Estructura Inicial
              </label>
              <select
                value={newModuleTemplate}
                onChange={(e) => setNewModuleTemplate(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-slate-500 cursor-pointer"
              >
                <option value="text">Sección de Texto / Párrafos</option>
                <option value="table">Texto + Tabla Estructurada</option>
                <option value="list">Texto + Lista de Puntos / Requisitos</option>
                <option value="mixed">Sección Mixta (Texto + Tabla + Nota)</option>
                <option value="signatures">Bloque de Firmas y Aprobación</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Layout: Sticky Outline (Left) + Document Canvas (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Sticky Document Outline (Desktop) */}
        <aside className="hidden xl:block xl:col-span-3 sticky top-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Índice del Documento
            </span>
            <span className="text-[11px] font-mono text-slate-400">{plan.modules.length}</span>
          </div>

          <nav className="space-y-1 max-h-[65vh] overflow-y-auto pr-1">
            {plan.modules.map((mod, idx) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  document.getElementById(`master-mod-${mod.id}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className="w-full flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer group"
              >
                <span className="font-mono text-[11px] font-bold text-slate-400 group-hover:text-slate-900 shrink-0 mt-0.5">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span className="leading-snug line-clamp-2 flex-1">{mod.title}</span>
                {editingModuleIds[mod.id] && viewMode === 'editor' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                )}
              </button>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModule(true)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nuevo Módulo</span>
            </button>
          </div>
        </aside>

        {/* Document Canvas */}
        <div className="xl:col-span-9 space-y-5">
          {/* Corporate Metadata Header Sheet */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            {/* Top Dark Accent Strip */}
            <div className="h-1.5 bg-slate-900 w-full" />

            <div className="p-6 space-y-5">
              {/* ISO 19650 Formal Title Block */}
              <div className="grid grid-cols-1 md:grid-cols-12 border border-slate-200 rounded-xl overflow-hidden">
                <div className="md:col-span-3 p-4 flex items-center justify-center bg-white border-b md:border-b-0 md:border-r border-slate-200">
                  <img
                    src="https://i.postimg.cc/K89NWRmZ/cropped-logo-mesh-estudio-2024.webp"
                    alt="Mesh Estudio"
                    referrerPolicy="no-referrer"
                    className="h-12 w-auto object-contain select-none"
                  />
                </div>
                <div className="md:col-span-6 p-4 flex flex-col justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 bg-white">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                    Documento Maestro Controlado · ISO 19650
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mt-1 leading-snug">
                    {plan.metadata.title}
                  </h2>
                </div>
                <div className="md:col-span-3 p-3.5 bg-slate-50 text-xs space-y-1.5 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Código</span>
                    <span className="font-mono font-bold text-slate-900">{plan.metadata.code}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Emisión</span>
                    <span className="text-[11px] font-medium text-slate-800 text-right">
                      {plan.metadata.issueDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Org.</span>
                    <span className="text-[11px] font-semibold text-slate-900">
                      {plan.metadata.organization}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Metadata Rows or Editor */}
              {!editingMetadata || viewMode === 'preview' ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
                    <div>
                      <dt className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                        Versión
                      </dt>
                      <dd className="text-slate-900 font-semibold mt-0.5">{plan.metadata.version}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                        Elaborado por
                      </dt>
                      <dd className="text-slate-900 font-medium mt-0.5">{plan.metadata.author}</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                        Marco Normativo
                      </dt>
                      <dd className="text-slate-700 mt-0.5">{plan.metadata.normativeFramework}</dd>
                    </div>
                  </dl>

                  {viewMode === 'editor' && (
                    <button
                      type="button"
                      onClick={() => setEditingMetadata(true)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0 self-start"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar Encabezado</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900">
                      Editar Encabezado y Metadatos del Documento
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingMetadata(false)}
                      className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Listo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">
                        Título del Documento
                      </label>
                      <input
                        type="text"
                        value={plan.metadata.title}
                        onChange={(e) => updateMetadata('title', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">
                        Código Controlado
                      </label>
                      <input
                        type="text"
                        value={plan.metadata.code}
                        onChange={(e) => updateMetadata('code', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">
                        Versión
                      </label>
                      <input
                        type="text"
                        value={plan.metadata.version}
                        onChange={(e) => updateMetadata('version', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">
                        Fecha de Emisión
                      </label>
                      <input
                        type="text"
                        value={plan.metadata.issueDate}
                        onChange={(e) => updateMetadata('issueDate', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">
                        Organización
                      </label>
                      <input
                        type="text"
                        value={plan.metadata.organization}
                        onChange={(e) => updateMetadata('organization', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">
                        Marco Normativo
                      </label>
                      <input
                        type="text"
                        value={plan.metadata.normativeFramework}
                        onChange={(e) => updateMetadata('normativeFramework', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">
                        Elaborado por
                      </label>
                      <input
                        type="text"
                        value={plan.metadata.author}
                        onChange={(e) => updateMetadata('author', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* All Document Modules */}
          <div className="space-y-4">
            {plan.modules.map((mod, idx) => {
              const isEditingThis = viewMode === 'editor' && Boolean(editingModuleIds[mod.id]);

              return (
                <article
                  key={mod.id}
                  id={`master-mod-${mod.id}`}
                  className={cn(
                    'bg-white border rounded-2xl shadow-2xs transition-all overflow-hidden scroll-mt-4',
                    isEditingThis ? 'border-slate-900 ring-1 ring-slate-900/10' : 'border-slate-200'
                  )}
                >
                  {/* Module Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {isEditingThis ? (
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
                        />
                      ) : (
                        <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                          {idx + 1}. {mod.title}
                        </h3>
                      )}
                    </div>

                    {viewMode === 'editor' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveModule(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Subir módulo"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveModule(idx, 1)}
                          disabled={idx === plan.modules.length - 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Bajar módulo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateModule(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                          title="Duplicar módulo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteId === mod.id ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-[11px]">
                            <span className="text-red-800 font-semibold">¿Eliminar?</span>
                            <button
                              type="button"
                              onClick={() => deleteModule(mod.id)}
                              className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold cursor-pointer"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-red-200 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(mod.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Eliminar módulo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleEditModule(mod.id)}
                          className={cn(
                            'ml-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5',
                            isEditingThis
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          )}
                        >
                          {isEditingThis ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Finalizar</span>
                            </>
                          ) : (
                            <>
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Module Body */}
                  <div className="px-6 py-5 space-y-4">
                    {isEditingThis ? (
                      <>
                        {mod.blocks.map((block, bIdx) =>
                          renderBlockEditor(mod.id, block, bIdx, mod.blocks.length)
                        )}

                        {/* Add Block Bar inside Module */}
                        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold text-slate-500 mr-1">
                            + Insertar bloque:
                          </span>
                          <button
                            type="button"
                            onClick={() => addBlockToModule(mod.id, 'paragraph')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
                            <span>Párrafo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlockToModule(mod.id, 'subheading')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            <Heading2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Subtítulo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlockToModule(mod.id, 'table')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            <Table2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Tabla</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlockToModule(mod.id, 'list')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            <List className="w-3.5 h-3.5 text-slate-500" />
                            <span>Lista</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlockToModule(mod.id, 'callout')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dictamen / Nota</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlockToModule(mod.id, 'signatures')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            <PenTool className="w-3.5 h-3.5 text-slate-500" />
                            <span>Firmas</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      mod.blocks.map((block) => (
                        <div key={block.id}>{renderBlockView(block)}</div>
                      ))
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom Quick Add & Export Strip */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900">
                Documento Maestro listo para revisión y firma gerencial
              </div>
              <div className="text-xs text-slate-500">
                Puedes añadir más secciones personalizadas o generar la versión oficial en PDF con el membrete de Mesh Estudio.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModule(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Agregar Módulo</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF Final'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
