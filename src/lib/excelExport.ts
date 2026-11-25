/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import {
  DIMENSIONS,
  DEFAULT_SELECTIONS as BIM_DEFAULT_SELECTIONS,
  Dimension,
} from '../components/BimMaturityMatrixSlide';
import {
  DEFAULT_TARGET_SELECTIONS as BIM_DEFAULT_TARGET_SELECTIONS,
  LOCAL_GOALS_KEY as BIM_LOCAL_GOALS_KEY,
} from '../components/MetasConfigSlide';
import {
  ISO9001_CATEGORIES,
  ISO9001_DIMENSIONS,
  DEFAULT_ISO9001_SELECTIONS,
  DEFAULT_ISO9001_TARGET_SELECTIONS,
  computeIso9001CategoryActualScores,
  computeIso9001CategoryTargets,
  getIso9001MaturityLabel,
  Iso9001Category,
  Iso9001Dimension,
} from './iso9001Data';
import { LOCAL_ISO9001_DRAFT_KEY } from '../components/Iso9001MatrixSlide';
import { LOCAL_ISO9001_GOALS_KEY } from '../components/Iso9001MetasSlide';

const BIM_LOCAL_DRAFT_KEY = 'mesh_bim_maturity_draft_v1';

const BIM_CATEGORY_NAMES: Record<string, string> = {
  tecnologia: '01. Tecnología e Infraestructura',
  procesos: '02. Procesos y Flujos de Trabajo',
  politicas: '03. Políticas y Estándares',
  capacidad: '04. Capacidad y Personal',
  escala: '05. Escala y Gestión de Proyectos',
};

const LEVEL_LABELS: Record<number, string> = {
  0: 'Nivel 0: Inicial',
  1: 'Nivel 1: Definido',
  2: 'Nivel 2: Gestionado',
  3: 'Nivel 3: Integrado',
  4: 'Nivel 4: Optimizado',
};

/**
 * Retrieve saved BIM evaluations or fallbacks
 */
export function getStoredBimSelections(): Record<string, number> {
  try {
    const saved = localStorage.getItem(BIM_LOCAL_DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.selections && typeof parsed.selections === 'object') {
        return { ...BIM_DEFAULT_SELECTIONS, ...parsed.selections };
      }
    }
  } catch (e) {
    console.error('Error reading BIM selections', e);
  }
  return { ...BIM_DEFAULT_SELECTIONS };
}

/**
 * Retrieve saved BIM target goals or fallbacks
 */
export function getStoredBimTargets(): Record<string, number> {
  try {
    const saved = localStorage.getItem(BIM_LOCAL_GOALS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.targetSelections && typeof parsed.targetSelections === 'object') {
        return { ...BIM_DEFAULT_TARGET_SELECTIONS, ...parsed.targetSelections };
      }
    }
  } catch (e) {
    console.error('Error reading BIM targets', e);
  }
  return { ...BIM_DEFAULT_TARGET_SELECTIONS };
}

/**
 * Retrieve saved ISO 9001 evaluations or fallbacks
 */
export function getStoredIso9001Selections(): Record<string, number> {
  try {
    const saved = localStorage.getItem(LOCAL_ISO9001_DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.selections && typeof parsed.selections === 'object') {
        return { ...DEFAULT_ISO9001_SELECTIONS, ...parsed.selections };
      }
    }
  } catch (e) {
    console.error('Error reading ISO 9001 selections', e);
  }
  return { ...DEFAULT_ISO9001_SELECTIONS };
}

/**
 * Retrieve saved ISO 9001 target goals or fallbacks
 */
export function getStoredIso9001Targets(): Record<string, number> {
  try {
    const saved = localStorage.getItem(LOCAL_ISO9001_GOALS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.targetSelections && typeof parsed.targetSelections === 'object') {
        return { ...DEFAULT_ISO9001_TARGET_SELECTIONS, ...parsed.targetSelections };
      }
    }
  } catch (e) {
    console.error('Error reading ISO 9001 targets', e);
  }
  return { ...DEFAULT_ISO9001_TARGET_SELECTIONS };
}

/**
 * Export BIM (ISO 19650) Matrix to an Excel file (.xlsx)
 */
export function exportBimMatrixToExcel(
  userSelections?: Record<string, number>,
  userTargets?: Record<string, number>,
  timeframe: string = 'Q4 2026'
) {
  const selections = userSelections ?? getStoredBimSelections();
  const targets = userTargets ?? getStoredBimTargets();

  const totalPoints = Object.values(selections).reduce((a, b) => a + (b || 0), 0);
  const maxPoints = DIMENSIONS.length * 4; // 132
  const globalPct = Math.round((totalPoints / maxPoints) * 100);

  const targetTotalPoints = Object.values(targets).reduce((a, b) => a + (b || 0), 0);
  const targetPct = Math.round((targetTotalPoints / maxPoints) * 100);

  const dateStr = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: RESUMEN EJECUTIVO BIM
  // ==========================================
  const summaryRows: any[][] = [
    ['MESH ESTUDIO - MATRIZ DE MADUREZ BIM ISO 19650'],
    ['Informe Ejecutivo y Plan de Metas de Implementación'],
    [],
    ['DATOS GENERALES DE LA EVALUACIÓN'],
    ['Empresa', 'Mesh Estudio S.A.S.'],
    ['Marco Normativo', 'ISO 19650-1 / ISO 19650-2 / Guía BIM Forum'],
    ['Fecha de Emisión', dateStr],
    ['Horizonte Temporal', timeframe],
    ['Auditor / Evaluador', 'Camilo Martínez - BIM Manager & Auditor SGC'],
    [],
    ['INDICADORES CLAVE GLOBALES (KPIs)'],
    ['Métrica', 'Puntos Obtenidos', 'Puntos Máximos', 'Porcentaje (%)', 'Nivel Cualitativo'],
    [
      'Diagnóstico Actual BIM',
      totalPoints,
      maxPoints,
      `${globalPct}%`,
      getBimMaturityLabel(globalPct),
    ],
    [
      'Meta de Implementación BIM',
      targetTotalPoints,
      maxPoints,
      `${targetPct}%`,
      getBimMaturityLabel(targetPct),
    ],
    ['Brecha de Madurez (Gap)', `${targetPct - globalPct}%`, '', '', targetPct > globalPct ? 'En Proceso de Cierre' : 'Meta Cumplida'],
    [],
    ['DESGLOSE POR PILAR / CATEGORÍA BIM'],
    ['Pilar BIM', 'N° Ítems', 'Puntos Actuales', 'Pts Máximos', 'Cumplimiento Actual (%)', 'Nivel Promedio', 'Meta Planificada (%)', 'Brecha (%)', 'Estado'],
  ];

  const categories = ['tecnologia', 'procesos', 'politicas', 'capacidad', 'escala'] as const;

  categories.forEach((catKey) => {
    const catDimensions = DIMENSIONS.filter((d) => d.category === catKey);
    const count = catDimensions.length;
    const catMaxPts = count * 4;
    const catActualPts = catDimensions.reduce((sum, d) => sum + (selections[d.id] ?? 0), 0);
    const catActualPct = Math.round((catActualPts / catMaxPts) * 100);
    const catAvgLvl = (catActualPts / count).toFixed(1);

    const catTargetPts = catDimensions.reduce((sum, d) => sum + (targets[d.id] ?? 2), 0);
    const catTargetPct = Math.round((catTargetPts / catMaxPts) * 100);
    const gap = catTargetPct - catActualPct;

    let status = 'Meta Alcanzada';
    if (gap > 20) status = 'Prioridad Alta';
    else if (gap > 0) status = 'En Progreso';

    summaryRows.push([
      BIM_CATEGORY_NAMES[catKey] || catKey,
      count,
      catActualPts,
      catMaxPts,
      `${catActualPct}%`,
      `Nivel ${catAvgLvl}`,
      `${catTargetPct}%`,
      `${gap > 0 ? '+' : ''}${gap}%`,
      status,
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 32 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 24 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Ejecutivo');

  // ==========================================
  // SHEET 2: MATRIZ DETALLADA (33 ÍTEMS)
  // ==========================================
  const detailRows: any[][] = [
    ['MATRIZ DETALLADA DE IMPLEMENTACIÓN BIM ISO 19650 - MESH ESTUDIO'],
    ['Evaluación Ítem por Ítem, Metas Fijadas y Criterios de Aceptación'],
    [],
    [
      'N°',
      'Pilar / Categoría',
      'Código',
      'Dimensión BIM',
      'Nivel Actual (0-4)',
      'Estado Actual',
      'Meta Fijada (0-4)',
      'Estado Meta',
      'Brecha (Niveles)',
      'Diagnóstico y Criterio Actual',
      'Criterio de Meta a Alcanzar',
    ],
  ];

  DIMENSIONS.forEach((dim, index) => {
    const actualLvl = selections[dim.id] ?? 0;
    const targetLvl = targets[dim.id] ?? 2;
    const actualDesc = dim.levels[actualLvl]?.description || '';
    const targetDesc = dim.levels[targetLvl]?.description || '';
    const gap = targetLvl - actualLvl;

    detailRows.push([
      index + 1,
      BIM_CATEGORY_NAMES[dim.category] || dim.category,
      dim.id,
      dim.name,
      actualLvl,
      LEVEL_LABELS[actualLvl] || `Nivel ${actualLvl}`,
      targetLvl,
      LEVEL_LABELS[targetLvl] || `Nivel ${targetLvl}`,
      gap > 0 ? `+${gap}` : gap === 0 ? '0 (Cumple)' : `${gap}`,
      actualDesc,
      targetDesc,
    ]);
  });

  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
  wsDetail['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 22 },
    { wch: 36 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 65 },
    { wch: 65 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Matriz BIM Detallada');

  // ==========================================
  // SHEET 3: DICCIONARIO DE NIVELES (N0 A N4)
  // ==========================================
  const dictRows: any[][] = [
    ['DICCIONARIO DE RÚBRICA Y NIVELES DE MADUREZ BIM ISO 19650'],
    ['Descripción completa de cada nivel de madurez para auditoría interna'],
    [],
    [
      'Código',
      'Pilar',
      'Dimensión',
      'N0: Inicial',
      'N1: Definido',
      'N2: Gestionado',
      'N3: Integrado',
      'N4: Optimizado',
    ],
  ];

  DIMENSIONS.forEach((dim) => {
    dictRows.push([
      dim.id,
      BIM_CATEGORY_NAMES[dim.category] || dim.category,
      dim.name,
      dim.levels[0]?.description || '',
      dim.levels[1]?.description || '',
      dim.levels[2]?.description || '',
      dim.levels[3]?.description || '',
      dim.levels[4]?.description || '',
    ]);
  });

  const wsDict = XLSX.utils.aoa_to_sheet(dictRows);
  wsDict['!cols'] = [
    { wch: 22 },
    { wch: 28 },
    { wch: 32 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDict, 'Diccionario BIM (N0-N4)');

  // Generate and download
  const fileName = `Mesh_Estudio_Matriz_BIM_ISO19650_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export ISO 9001 (Quality Management System) Matrix to an Excel file (.xlsx)
 */
export function exportIso9001MatrixToExcel(
  userSelections?: Record<string, number>,
  userTargets?: Record<string, number>,
  timeframe: string = 'Q4 2026'
) {
  const selections = userSelections ?? getStoredIso9001Selections();
  const targets = userTargets ?? getStoredIso9001Targets();

  const totalPoints = Object.values(selections).reduce((a, b) => a + (b || 0), 0);
  const maxPoints = ISO9001_DIMENSIONS.length * 4; // 84
  const globalPct = Math.round((totalPoints / maxPoints) * 100);

  const targetTotalPoints = Object.values(targets).reduce((a, b) => a + (b || 0), 0);
  const targetPct = Math.round((targetTotalPoints / maxPoints) * 100);

  const dateStr = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const categoryScores = computeIso9001CategoryActualScores(selections);
  const categoryTargets = computeIso9001CategoryTargets(targets);

  const maturityCurrent = getIso9001MaturityLabel(globalPct);
  const maturityTarget = getIso9001MaturityLabel(targetPct);

  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: RESUMEN EJECUTIVO SGC
  // ==========================================
  const summaryRows: any[][] = [
    ['MESH ESTUDIO - MATRIZ DE GESTIÓN DE CALIDAD ISO 9001:2015'],
    ['Informe de Diagnóstico Inicial, Metas y Plan de Adecuación SGC'],
    [],
    ['DATOS GENERALES DE LA EVALUACIÓN'],
    ['Empresa', 'Mesh Estudio S.A.S.'],
    ['Norma Internacional', 'ISO 9001:2015 - Sistema de Gestión de la Calidad (SGC)'],
    ['Fecha de Evaluación', dateStr],
    ['Período Planificado', timeframe],
    ['Responsable SGC', 'Camilo Martínez - Director de Calidad & BIM'],
    [],
    ['INDICADORES CLAVE DEL SISTEMA DE CALIDAD'],
    ['Métrica', 'Puntos Obtenidos', 'Puntos Máximos', 'Porcentaje (%)', 'Madurez SGC'],
    [
      'Diagnóstico Actual SGC',
      totalPoints,
      maxPoints,
      `${globalPct}%`,
      maturityCurrent.label,
    ],
    [
      'Meta Planificada SGC',
      targetTotalPoints,
      maxPoints,
      `${targetPct}%`,
      maturityTarget.label,
    ],
    ['Brecha de Calidad (Gap)', `${targetPct - globalPct}%`, '', '', targetPct > globalPct ? 'Plan de Adecuación Requerido' : 'Meta Lograda'],
    [],
    ['DESGLOSE POR CLÁUSULA NORMATIVA (ISO 9001:2015)'],
    [
      'Cláusula',
      'Nombre de la Cláusula',
      'N° Requisitos',
      'Pts Actuales',
      'Pts Máximos',
      'Cumplimiento Actual (%)',
      'Nivel Promedio',
      'Meta (%)',
      'Brecha (%)',
      'Entregables Clave',
    ],
  ];

  ISO9001_CATEGORIES.forEach((cat) => {
    const current = categoryScores[cat.id];
    const target = categoryTargets[cat.id];
    const gap = target - current.percentage;

    summaryRows.push([
      cat.clause,
      cat.title,
      cat.dimensionsCount,
      current.points,
      current.maxPoints,
      `${current.percentage}%`,
      `Nivel ${current.avgLevel}`,
      `${target}%`,
      `${gap > 0 ? '+' : ''}${gap}%`,
      cat.deliverables,
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen SGC');

  // ==========================================
  // SHEET 2: MATRIZ DETALLADA ISO 9001 (21 ÍTEMS)
  // ==========================================
  const detailRows: any[][] = [
    ['MATRIZ DETALLADA DE REQUISITOS ISO 9001:2015 - MESH ESTUDIO'],
    ['Evaluación por Numeral Normativo, Nivel de Madurez y Planes de Acción'],
    [],
    [
      'Numeral',
      'Cláusula',
      'Código',
      'Requisito / Dimensión de Calidad',
      'Nivel Actual (0-4)',
      'Estado Actual',
      'Meta Fijada (0-4)',
      'Estado Meta',
      'Brecha (Niveles)',
      'Diagnóstico / Situación Actual',
      'Criterio de Meta (Objetivo de Calidad)',
    ],
  ];

  ISO9001_DIMENSIONS.forEach((dim) => {
    const actualLvl = selections[dim.id] ?? 0;
    const targetLvl = targets[dim.id] ?? 2;
    const actualDesc = dim.levels[actualLvl]?.description || '';
    const targetDesc = dim.levels[targetLvl]?.description || '';
    const gap = targetLvl - actualLvl;
    const cat = ISO9001_CATEGORIES.find((c) => c.id === dim.category);

    detailRows.push([
      dim.clauseNumber,
      cat ? cat.clause : dim.category,
      dim.id,
      dim.name,
      actualLvl,
      LEVEL_LABELS[actualLvl] || `Nivel ${actualLvl}`,
      targetLvl,
      LEVEL_LABELS[targetLvl] || `Nivel ${targetLvl}`,
      gap > 0 ? `+${gap}` : gap === 0 ? '0 (Cumple)' : `${gap}`,
      actualDesc,
      targetDesc,
    ]);
  });

  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
  wsDetail['!cols'] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 22 },
    { wch: 38 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 65 },
    { wch: 65 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Matriz ISO 9001 Detallada');

  // ==========================================
  // SHEET 3: DICCIONARIO DE REQUISITOS ISO 9001 (N0 A N4)
  // ==========================================
  const dictRows: any[][] = [
    ['DICCIONARIO NORMATIVO Y RÚBRICA SGC ISO 9001:2015'],
    ['Definición de Niveles de Madurez N0 a N4 para Auditoría de Certificación'],
    [],
    [
      'Numeral',
      'Cláusula',
      'Código',
      'Requisito SGC',
      'N0: Inicial',
      'N1: Definido',
      'N2: Gestionado',
      'N3: Integrado',
      'N4: Optimizado',
    ],
  ];

  ISO9001_DIMENSIONS.forEach((dim) => {
    const cat = ISO9001_CATEGORIES.find((c) => c.id === dim.category);
    dictRows.push([
      dim.clauseNumber,
      cat ? cat.clause : dim.category,
      dim.id,
      dim.name,
      dim.levels[0]?.description || '',
      dim.levels[1]?.description || '',
      dim.levels[2]?.description || '',
      dim.levels[3]?.description || '',
      dim.levels[4]?.description || '',
    ]);
  });

  const wsDict = XLSX.utils.aoa_to_sheet(dictRows);
  wsDict['!cols'] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 22 },
    { wch: 36 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDict, 'Diccionario SGC (N0-N4)');

  const fileName = `Mesh_Estudio_Matriz_Calidad_ISO9001_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export both BIM and ISO 9001 matrices in a single consolidated Excel workbook
 */
export function exportBothMatricesToExcel(
  bimSelections?: Record<string, number>,
  bimTargets?: Record<string, number>,
  isoSelections?: Record<string, number>,
  isoTargets?: Record<string, number>
) {
  const bSelections = bimSelections ?? getStoredBimSelections();
  const bTargets = bimTargets ?? getStoredBimTargets();
  const iSelections = isoSelections ?? getStoredIso9001Selections();
  const iTargets = isoTargets ?? getStoredIso9001Targets();

  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Consolidated Cover Sheet
  const bTotal = Object.values(bSelections).reduce((a, b) => a + (b || 0), 0);
  const bMax = DIMENSIONS.length * 4;
  const bPct = Math.round((bTotal / bMax) * 100);

  const iTotal = Object.values(iSelections).reduce((a, b) => a + (b || 0), 0);
  const iMax = ISO9001_DIMENSIONS.length * 4;
  const iPct = Math.round((iTotal / iMax) * 100);

  const coverRows: any[][] = [
    ['MESH ESTUDIO - SISTEMA INTEGRADO DE GESTIÓN (BIM ISO 19650 + CALIDAD ISO 9001)'],
    ['Consolidado Corporativo de Madurez, Diagnóstico y Metas Estratégicas'],
    [],
    ['DATOS GENERALES DE LA AUDITORÍA INTEGRAL'],
    ['Organización', 'Mesh Estudio S.A.S.'],
    ['Fecha de Consolidación', dateStr],
    ['Auditor Líder', 'Camilo Martínez - BIM Manager & Auditor SGC'],
    [],
    ['RESUMEN COMPARATIVO DE AMBOS MARCOS NORMATIVOS'],
    ['Marco Normativo', 'Estándar', 'Puntaje Actual', 'Porcentaje (%)', 'Madurez Actual', 'Estado Global'],
    [
      'Metodología BIM',
      'ISO 19650 / BIM Forum',
      `${bTotal} / ${bMax}`,
      `${bPct}%`,
      getBimMaturityLabel(bPct),
      bPct >= 50 ? 'Nivel Avanzado' : 'En Desarrollo',
    ],
    [
      'Gestión de Calidad',
      'ISO 9001:2015',
      `${iTotal} / ${iMax}`,
      `${iPct}%`,
      getIso9001MaturityLabel(iPct).label,
      iPct >= 50 ? 'SGC Estandarizado' : 'En Desarrollo',
    ],
    [],
    ['HOJAS DE ESTE LIBRO DE TRABAJO:'],
    ['1. Resumen Integral (esta hoja)'],
    ['2. Matriz BIM ISO 19650 (Detalle de los 33 indicadores BIM)'],
    ['3. Diccionario BIM N0-N4 (Rúbrica completa)'],
    ['4. Matriz ISO 9001 (Detalle de los 21 requisitos de Calidad)'],
    ['5. Diccionario ISO 9001 N0-N4 (Rúbrica completa)'],
  ];

  const wsCover = XLSX.utils.aoa_to_sheet(coverRows);
  wsCover['!cols'] = [{ wch: 28 }, { wch: 24 }, { wch: 18 }, { wch: 16 }, { wch: 32 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsCover, 'Consolidado Integral');

  // Add BIM Detail sheet
  const bimDetailRows: any[][] = [
    ['MATRIZ BIM ISO 19650 - EVALUACIÓN DETALLADA'],
    [],
    ['N°', 'Pilar', 'Código', 'Dimensión', 'Nivel Actual', 'Estado', 'Meta', 'Brecha', 'Diagnóstico Actual', 'Criterio Meta'],
  ];
  DIMENSIONS.forEach((dim, idx) => {
    const act = bSelections[dim.id] ?? 0;
    const tgt = bTargets[dim.id] ?? 2;
    bimDetailRows.push([
      idx + 1,
      BIM_CATEGORY_NAMES[dim.category] || dim.category,
      dim.id,
      dim.name,
      act,
      LEVEL_LABELS[act] || `Nivel ${act}`,
      tgt,
      tgt - act,
      dim.levels[act]?.description || '',
      dim.levels[tgt]?.description || '',
    ]);
  });
  const wsBim = XLSX.utils.aoa_to_sheet(bimDetailRows);
  wsBim['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 20 }, { wch: 34 }, { wch: 12 }, { wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 55 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsBim, 'Matriz BIM ISO 19650');

  // Add ISO 9001 Detail sheet
  const isoDetailRows: any[][] = [
    ['MATRIZ ISO 9001:2015 - EVALUACIÓN DETALLADA'],
    [],
    ['Numeral', 'Cláusula', 'Código', 'Requisito', 'Nivel Actual', 'Estado', 'Meta', 'Brecha', 'Diagnóstico Actual', 'Criterio Meta'],
  ];
  ISO9001_DIMENSIONS.forEach((dim) => {
    const act = iSelections[dim.id] ?? 0;
    const tgt = iTargets[dim.id] ?? 2;
    const cat = ISO9001_CATEGORIES.find((c) => c.id === dim.category);
    isoDetailRows.push([
      dim.clauseNumber,
      cat ? cat.clause : dim.category,
      dim.id,
      dim.name,
      act,
      LEVEL_LABELS[act] || `Nivel ${act}`,
      tgt,
      tgt - act,
      dim.levels[act]?.description || '',
      dim.levels[tgt]?.description || '',
    ]);
  });
  const wsIso = XLSX.utils.aoa_to_sheet(isoDetailRows);
  wsIso['!cols'] = [{ wch: 10 }, { wch: 16 }, { wch: 20 }, { wch: 34 }, { wch: 12 }, { wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 55 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsIso, 'Matriz ISO 9001');

  const fileName = `Mesh_Estudio_Matriz_Integral_BIM_e_ISO9001_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function getBimMaturityLabel(pct: number): string {
  if (pct >= 80) return 'Nivel 4: Optimizado';
  if (pct >= 60) return 'Nivel 3: Integrado';
  if (pct >= 40) return 'Nivel 2: Gestionado';
  if (pct >= 20) return 'Nivel 1: Definido';
  return 'Nivel 0: Inicial';
}

/**
 * Export Plan de Implementación Inicial (10 Pasos Prioritarios) to Excel (.xlsx)
 */
export function exportRoadmapToExcel(
  activitiesState?: Record<string, { status: string; progress: number; notes?: string }>
) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const headerRows = [
    ['MESH ESTUDIO - PLAN DE IMPLEMENTACIÓN INICIAL BIM ISO 19650'],
    ['Orden de Prioridades, Predecesoras, Entregables y Criterios de Aceptación'],
    [],
    ['DATOS GENERALES DEL PLAN'],
    ['Empresa', 'Mesh Estudio S.A.S.'],
    ['Metodología', 'BIM ISO 19650-1 & ISO 19650-2 / SGC ISO 9001:2015'],
    ['Fecha de Emisión', dateStr],
    ['Duración Total Ruta Crítica', '12.5 semanas (aprox. 3 meses)'],
    ['Responsable', 'Camilo Martínez - BIM Manager & Auditor SGC'],
    [],
    [
      'Fase / Paso',
      'Código',
      'Actividad Puntual',
      'Predecesora',
      'Duración',
      'Entregable Físico / Medible',
      'Criterio de Finalización',
      'Estado Actual',
      'Avance (%)',
      'Dimensiones BIM Impactadas',
      'Cláusula ISO 9001',
    ],
  ];

  const defaultRoadmap = [
    {
      step: 'Paso 1: Dirección',
      code: 'ACT-01',
      act: 'Redactar el Documento Maestro del Plan de Implementación BIM y su cronograma Gantt.',
      pred: 'Ninguna',
      dur: '2 semanas',
      deliverable: 'Documento maestro (PDF) + Cronograma (.xlsx / .mpp).',
      criterion: 'Aprobado formalmente por la gerencia de Mesh Estudio.',
      bim: 'lid_vision, lid_estrategia, est_politicas',
      iso: 'Cláusula 5 (Liderazgo) y 6.2 (Objetivos)',
    },
    {
      step: 'Paso 2: Capacidad Física',
      code: 'ACT-02',
      act: 'Levantar inventario de estaciones y elaborar matriz presupuestal de actualización de hardware.',
      pred: 'ACT-01',
      dur: '1 semana',
      deliverable: 'Ficha de inventario técnico + Presupuesto de compras/upgrades (.xlsx).',
      criterion: 'Presupuesto validado y especificaciones mínimas por rol asignadas.',
      bim: 'hw_equipamiento, hw_actualizacion',
      iso: 'Cláusula 7.1.3 (Infraestructura)',
    },
    {
      step: 'Paso 3: Conectividad',
      code: 'ACT-03',
      act: 'Gestionar enlace corporativo y configurar la sincronización del repositorio CDE en red local.',
      pred: 'ACT-02',
      dur: '1 semana',
      deliverable: 'Informe técnico de red/latencia + Terminales sincronizadas con CDE.',
      criterion: 'Cero fallas de sincronización local/nube en pruebas de carga.',
      bim: 'red_infraestructura, red_canales, red_conectividad',
      iso: 'Cláusula 7.1.3 (Red y CDE)',
    },
    {
      step: 'Paso 4: Contenedor de Datos',
      code: 'ACT-04',
      act: 'Elaborar el Manual de Nomenclatura ISO 19650 y la estructura de carpetas en el CDE.',
      pred: 'ACT-03',
      dur: '1.5 semanas',
      deliverable: 'Manual de Codificación (PDF) + Árbol de carpetas desplegado (WIP, Shared, Published).',
      criterion: 'Estructura montada en la nube con permisos por rol activos.',
      bim: 'rec_entorno, rec_conocimiento, est_gestion',
      iso: 'Cláusula 7.5 (Información Documentada)',
    },
    {
      step: 'Paso 5: Contenido de Modelo',
      code: 'ACT-05',
      act: 'Escribir la Guía Estándar de Modelado 3D y crear la Matriz de Desarrollo de Información (LOD/LOIN).',
      pred: 'ACT-04',
      dur: '2.5 semanas',
      deliverable: 'Manual interno de modelado 3D (PDF) + Matriz LOD/LOIN (.xlsx).',
      criterion: 'Reglas de navegación, ejes, niveles y parámetros base definidas.',
      bim: 'sw_modelos, mod_lod, act_roles',
      iso: 'Cláusula 8.3 (Diseño y Desarrollo)',
    },
    {
      step: 'Paso 6: Interoperabilidad',
      code: 'ACT-06',
      act: 'Configurar las plantillas de mapeo IFC (OpenBIM) y validar exportación de datos geométricos/alfanuméricos.',
      pred: 'ACT-05',
      dur: '1.5 semanas',
      deliverable: 'Archivos de mapeo configurados (.txt / .xml) + Guía de exportación IFC (PDF).',
      criterion: 'Archivo IFC federado y verificado en visor OpenBIM sin pérdida de Psets.',
      bim: 'sw_intercambios, cap_red_modelos',
      iso: 'Cláusula 8.5 (Control de Salidas)',
    },
    {
      step: 'Paso 7: Aseguramiento Calidad',
      code: 'ACT-07',
      act: 'Diseñar las Listas de Chequeo QA/QC y la Matriz de Colisiones/Interferencias.',
      pred: 'ACT-05, ACT-06',
      dur: '1.5 semanas',
      deliverable: 'Formato de auditoría QA/QC (.xlsx) + Matriz de detección de interferencias.',
      criterion: 'Lista de chequeo probada en un modelo testigo interno.',
      bim: 'est_calidad, cap_red_coordinacion',
      iso: 'Cláusula 8.6 y 8.7 (Liberación QA/QC y NC)',
    },
    {
      step: 'Paso 8: Gestión de Proyecto',
      code: 'ACT-08',
      act: 'Redactar la plantilla institucional del Plan de Ejecución BIM (Pre-BEP y Post-BEP).',
      pred: 'ACT-04, ACT-05, ACT-07',
      dur: '2 semanas',
      deliverable: 'Plantilla institucional editable de BEP (.docx).',
      criterion: 'Documento estandarizado que integra CDE, LOIN, roles y flujo QA/QC.',
      bim: 'ent_requisitos, ent_programas, esc_organizaciones',
      iso: 'Cláusula 8.1 (Planificación Operativa)',
    },
    {
      step: 'Paso 9: Jurídico / Clientes',
      code: 'ACT-09',
      act: 'Redactar el Anexo Contractual BIM y Matriz de Riesgos/Propiedad Intelectual.',
      pred: 'ACT-08',
      dur: '1 semana',
      deliverable: 'Modelo de Anexo Contractual Técnico (.docx) listo para firma.',
      criterion: 'Cláusulas de entregables, derechos de autor y resolución de conflictos listas.',
      bim: 'con_responsabilidades, ind_desempeño, esc_mercados',
      iso: 'Cláusula 8.2 (Requisitos Contractuales)',
    },
    {
      step: 'Paso 10: Trabajo en Red',
      code: 'ACT-10',
      act: 'Estructurar el Protocolo de Coordinación Interdisciplinar, reuniones ICE y gestión BCF.',
      pred: 'ACT-07, ACT-08',
      dur: '1.5 semanas',
      deliverable: 'Protocolo de Coordinación y BCF (PDF) + Formato de minuta técnica ICE.',
      criterion: 'Prueba piloto de asignación, resolución y cierre de incidencias BCF en la nube.',
      bim: 'act_colaboracion, act_productividad, cap_col_metodo',
      iso: 'Cláusula 7.4 y 9.1 (Comunicación e ICE)',
    },
  ];

  defaultRoadmap.forEach((item) => {
    const userState = activitiesState ? activitiesState[item.code] : null;
    const status = userState?.status || (item.code === 'ACT-01' ? 'en_progreso' : 'pendiente');
    const prog = userState?.progress !== undefined ? `${userState.progress}%` : (item.code === 'ACT-01' ? '65%' : '0%');

    headerRows.push([
      item.step,
      item.code,
      item.act,
      item.pred,
      item.dur,
      item.deliverable,
      item.criterion,
      status.toUpperCase(),
      prog,
      item.bim,
      item.iso,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(headerRows);
  ws['!cols'] = [
    { wch: 22 },
    { wch: 10 },
    { wch: 45 },
    { wch: 18 },
    { wch: 14 },
    { wch: 42 },
    { wch: 42 },
    { wch: 16 },
    { wch: 12 },
    { wch: 30 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Plan de Implementación');

  const fileName = `Mesh_Estudio_Plan_Implementacion_Prioridades_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

