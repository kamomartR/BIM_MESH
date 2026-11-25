/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RoadmapActivity {
  stepNumber: number;
  stepName: string;
  code: string;
  activityName: string;
  actionVerb: string;
  predecessors: string[]; // e.g. ['Ninguna'] or ['ACT-01']
  predecessorText: string;
  durationWeeks: number;
  durationText: string;
  deliverables: string;
  deliverableType: string;
  completionCriteria: string;
  category: 'direccion' | 'tecnologia' | 'procesos' | 'politicas' | 'personas';
  relatedBimDimensions: string[]; // keys in BIM_DIMENSIONS
  relatedIsoClause: string;
  phaseGroup: string;
  estimatedCostRange?: string;
  status?: 'completada' | 'en_progreso' | 'pendiente' | 'bloqueada';
  progress?: number; // 0 to 100
  notes?: string;
}

export const INITIAL_ROADMAP_ACTIVITIES: RoadmapActivity[] = [
  {
    stepNumber: 1,
    stepName: 'Paso 1: Dirección',
    code: 'ACT-01',
    activityName: 'Redactar el Documento Maestro del Plan de Implementación BIM y su cronograma Gantt.',
    actionVerb: 'Redactar',
    predecessors: [],
    predecessorText: 'Ninguna',
    durationWeeks: 2,
    durationText: '2 semanas',
    deliverables: 'Documento maestro (PDF) + Cronograma (.xlsx / .mpp).',
    deliverableType: 'Documento + Cronograma',
    completionCriteria: 'Aprobado formalmente por la gerencia de Mesh Estudio.',
    category: 'direccion',
    relatedBimDimensions: ['lid_vision', 'lid_estrategia', 'est_politicas'],
    relatedIsoClause: 'Cláusula 5 (Liderazgo) y 6.2 (Objetivos de Calidad)',
    phaseGroup: 'Fase I: Gobernanza & Diagnóstico',
    status: 'en_progreso',
    progress: 65,
    notes: 'Documento base articulado con la norma ISO 19650-1 y plan de calidad ISO 9001.',
  },
  {
    stepNumber: 2,
    stepName: 'Paso 2: Capacidad Física',
    code: 'ACT-02',
    activityName: 'Levantar inventario de estaciones y elaborar matriz presupuestal de actualización de hardware.',
    actionVerb: 'Levantar / Elaborar',
    predecessors: ['ACT-01'],
    predecessorText: 'ACT-01',
    durationWeeks: 1,
    durationText: '1 semana',
    deliverables: 'Ficha de inventario técnico + Presupuesto de compras/upgrades (.xlsx).',
    deliverableType: 'Inventario + Presupuesto',
    completionCriteria: 'Presupuesto validado y especificaciones mínimas por rol asignadas.',
    category: 'tecnologia',
    relatedBimDimensions: ['hw_equipamiento', 'hw_actualizacion'],
    relatedIsoClause: 'Cláusula 7.1.3 (Infraestructura)',
    phaseGroup: 'Fase I: Gobernanza & Diagnóstico',
    status: 'pendiente',
    progress: 25,
    notes: 'Priorizar memorias RAM de 64GB y tarjetas RTX para estaciones de modelado y coordinación.',
  },
  {
    stepNumber: 3,
    stepName: 'Paso 3: Conectividad',
    code: 'ACT-03',
    activityName: 'Gestionar enlace corporativo y configurar la sincronización del repositorio CDE en red local.',
    actionVerb: 'Gestionar / Configurar',
    predecessors: ['ACT-02'],
    predecessorText: 'ACT-02',
    durationWeeks: 1,
    durationText: '1 semana',
    deliverables: 'Informe técnico de red/latencia + Terminales sincronizadas con CDE.',
    deliverableType: 'Infraestructura de red',
    completionCriteria: 'Cero fallas de sincronización local/nube en pruebas de carga.',
    category: 'tecnologia',
    relatedBimDimensions: ['red_infraestructura', 'red_canales', 'red_conectividad'],
    relatedIsoClause: 'Cláusula 7.1.3 (Infraestructura de comunicación)',
    phaseGroup: 'Fase II: Infraestructura & Entorno Común (CDE)',
    status: 'pendiente',
    progress: 0,
    notes: 'Garantizar ancho de banda simétrico y cachés locales para modelos pesados federados.',
  },
  {
    stepNumber: 4,
    stepName: 'Paso 4: Contenedor de Datos',
    code: 'ACT-04',
    activityName: 'Elaborar el Manual de Nomenclatura ISO 19650 y la estructura de carpetas en el CDE.',
    actionVerb: 'Elaborar',
    predecessors: ['ACT-03'],
    predecessorText: 'ACT-03',
    durationWeeks: 1.5,
    durationText: '1.5 semanas',
    deliverables: 'Manual de Codificación (PDF) + Árbol de carpetas desplegado (WIP, Shared, Published).',
    deliverableType: 'Manual + Estructura CDE',
    completionCriteria: 'Estructura montada en la nube con permisos por rol activos.',
    category: 'procesos',
    relatedBimDimensions: ['rec_entorno', 'rec_conocimiento', 'est_gestion'],
    relatedIsoClause: 'Cláusula 7.5 (Información Documentada)',
    phaseGroup: 'Fase II: Infraestructura & Entorno Común (CDE)',
    status: 'pendiente',
    progress: 0,
    notes: 'Configurar estados ISO 19650 (S0, S1, S2, A1, etc.) y metadatos de revisión.',
  },
  {
    stepNumber: 5,
    stepName: 'Paso 5: Contenido de Modelo',
    code: 'ACT-05',
    activityName: 'Escribir la Guía Estándar de Modelado 3D y crear la Matriz de Desarrollo de Información (LOD/LOIN).',
    actionVerb: 'Escribir / Crear',
    predecessors: ['ACT-04'],
    predecessorText: 'ACT-04',
    durationWeeks: 2.5,
    durationText: '2.5 semanas',
    deliverables: 'Manual interno de modelado 3D (PDF) + Matriz LOD/LOIN (.xlsx).',
    deliverableType: 'Estándar Técnico',
    completionCriteria: 'Reglas de navegación, ejes, niveles y parámetros base definidas.',
    category: 'procesos',
    relatedBimDimensions: ['sw_modelos', 'mod_lod', 'act_roles'],
    relatedIsoClause: 'Cláusula 8.3 (Diseño y Desarrollo)',
    phaseGroup: 'Fase III: Estandarización de Producción 3D',
    status: 'pendiente',
    progress: 0,
    notes: 'Alinear con las especificaciones BIM Forum 2023 / ISO 19650-2 para entregables de arquitectura y estructuras.',
  },
  {
    stepNumber: 6,
    stepName: 'Paso 6: Interoperabilidad',
    code: 'ACT-06',
    activityName: 'Configurar las plantillas de mapeo IFC (OpenBIM) y validar exportación de datos geométricos/alfanuméricos.',
    actionVerb: 'Configurar / Validar',
    predecessors: ['ACT-05'],
    predecessorText: 'ACT-05',
    durationWeeks: 1.5,
    durationText: '1.5 semanas',
    deliverables: 'Archivos de mapeo configurados (.txt / .xml) + Guía de exportación IFC (PDF).',
    deliverableType: 'Configuración Técnica',
    completionCriteria: 'Archivo IFC federado y verificado en visor OpenBIM sin pérdida de Psets.',
    category: 'tecnologia',
    relatedBimDimensions: ['sw_intercambios', 'cap_red_modelos'],
    relatedIsoClause: 'Cláusula 8.5 (Control de Salidas y Trazabilidad)',
    phaseGroup: 'Fase III: Estandarización de Producción 3D',
    status: 'pendiente',
    progress: 0,
    notes: 'Configurar esquema IFC 2x3 Coordination View 2.0 e IFC 4 Reference View.',
  },
  {
    stepNumber: 7,
    stepName: 'Paso 7: Aseguramiento Calidad',
    code: 'ACT-07',
    activityName: 'Diseñar las Listas de Chequeo QA/QC y la Matriz de Colisiones/Interferencias.',
    actionVerb: 'Diseñar',
    predecessors: ['ACT-05', 'ACT-06'],
    predecessorText: 'ACT-05, ACT-06',
    durationWeeks: 1.5,
    durationText: '1.5 semanas',
    deliverables: 'Formato de auditoría QA/QC (.xlsx) + Matriz de detección de interferencias.',
    deliverableType: 'Control de Calidad',
    completionCriteria: 'Lista de chequeo probada en un modelo testigo interno.',
    category: 'procesos',
    relatedBimDimensions: ['est_calidad', 'cap_red_coordinacion'],
    relatedIsoClause: 'Cláusula 8.6 (Liberación de Productos) y 8.7 (Salidas No Conformes)',
    phaseGroup: 'Fase IV: Aseguramiento de Calidad & Coordinación',
    status: 'pendiente',
    progress: 0,
    notes: 'Chequeos automáticos de colisiones duras y tolerancias espaciales.',
  },
  {
    stepNumber: 8,
    stepName: 'Paso 8: Gestión de Proyecto',
    code: 'ACT-08',
    activityName: 'Redactar la plantilla institucional del Plan de Ejecución BIM (Pre-BEP y Post-BEP).',
    actionVerb: 'Redactar',
    predecessors: ['ACT-04', 'ACT-05', 'ACT-07'],
    predecessorText: 'ACT-04, ACT-05, ACT-07',
    durationWeeks: 2,
    durationText: '2 semanas',
    deliverables: 'Plantilla institucional editable de BEP (.docx).',
    deliverableType: 'Plantilla Institucional',
    completionCriteria: 'Documento estandarizado que integra CDE, LOIN, roles y flujo QA/QC.',
    category: 'politicas',
    relatedBimDimensions: ['ent_requisitos', 'ent_programas', 'esc_organizaciones'],
    relatedIsoClause: 'Cláusula 8.1 (Planificación Operativa)',
    phaseGroup: 'Fase IV: Aseguramiento de Calidad & Coordinación',
    status: 'pendiente',
    progress: 0,
    notes: 'Incluir matriz RACI de roles BIM y matriz de hitos de entrega.',
  },
  {
    stepNumber: 9,
    stepName: 'Paso 9: Jurídico / Clientes',
    code: 'ACT-09',
    activityName: 'Redactar el Anexo Contractual BIM y Matriz de Riesgos/Propiedad Intelectual.',
    actionVerb: 'Redactar',
    predecessors: ['ACT-08'],
    predecessorText: 'ACT-08',
    durationWeeks: 1,
    durationText: '1 semana',
    deliverables: 'Modelo de Anexo Contractual Técnico (.docx) listo para firma.',
    deliverableType: 'Documento Jurídico/Contractual',
    completionCriteria: 'Cláusulas de entregables, derechos de autor y resolución de conflictos listas.',
    category: 'politicas',
    relatedBimDimensions: ['con_responsabilidades', 'ind_desempeño', 'esc_mercados'],
    relatedIsoClause: 'Cláusula 8.2 (Requisitos para Productos y Servicios)',
    phaseGroup: 'Fase V: Institucionalización, Legal & Ecosistema',
    status: 'pendiente',
    progress: 0,
    notes: 'Blindar la responsabilidad sobre el modelo versus los planos 2D contractuales.',
  },
  {
    stepNumber: 10,
    stepName: 'Paso 10: Trabajo en Red',
    code: 'ACT-10',
    activityName: 'Estructurar el Protocolo de Coordinación Interdisciplinar, reuniones ICE y gestión BCF.',
    actionVerb: 'Estructurar',
    predecessors: ['ACT-07', 'ACT-08'],
    predecessorText: 'ACT-07, ACT-08',
    durationWeeks: 1.5,
    durationText: '1.5 semanas',
    deliverables: 'Protocolo de Coordinación y BCF (PDF) + Formato de minuta técnica ICE.',
    deliverableType: 'Protocolo de Colaboración',
    completionCriteria: 'Prueba piloto de asignación, resolución y cierre de incidencias BCF en la nube.',
    category: 'personas',
    relatedBimDimensions: ['act_colaboracion', 'act_productividad', 'cap_col_metodo', 'cap_col_confianza'],
    relatedIsoClause: 'Cláusula 7.4 (Comunicación) y 9.1 (Seguimiento)',
    phaseGroup: 'Fase V: Institucionalización, Legal & Ecosistema',
    status: 'pendiente',
    progress: 0,
    notes: 'Uso de formato BCF (BIM Collaboration Format) para trazabilidad total de incidencias sin intercambios informales.',
  },
];

export const ROADMAP_CATEGORIES = [
  { id: 'all', label: 'Todos los Pasos (10)' },
  { id: 'direccion', label: 'Dirección & Gobernanza' },
  { id: 'tecnologia', label: 'Infraestructura & TI' },
  { id: 'procesos', label: 'Procesos & Calidad' },
  { id: 'politicas', label: 'Políticas & Contratos' },
  { id: 'personas', label: 'Coordinación & Equipo' },
];

export function computeRoadmapTimeline(activities: RoadmapActivity[]): {
  totalWeeksSequential: number;
  criticalPathWeeks: number;
  activitySchedule: Record<string, { startWeek: number; endWeek: number }>;
} {
  const schedule: Record<string, { startWeek: number; endWeek: number }> = {};
  let totalWeeks = 0;

  activities.forEach((act) => {
    let startWeek = 0;
    if (act.predecessors && act.predecessors.length > 0) {
      act.predecessors.forEach((predCode) => {
        if (schedule[predCode]) {
          startWeek = Math.max(startWeek, schedule[predCode].endWeek);
        }
      });
    }
    const endWeek = startWeek + act.durationWeeks;
    schedule[act.code] = { startWeek, endWeek };
    totalWeeks = Math.max(totalWeeks, endWeek);
  });

  const sumSequential = activities.reduce((acc, a) => acc + a.durationWeeks, 0);

  return {
    totalWeeksSequential: sumSequential,
    criticalPathWeeks: totalWeeks,
    activitySchedule: schedule,
  };
}
