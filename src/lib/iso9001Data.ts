/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Iso9001Category =
  | 'contexto'
  | 'liderazgo'
  | 'planificacion'
  | 'apoyo'
  | 'operacion'
  | 'evaluacion'
  | 'mejora';

export interface Iso9001Level {
  title: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}

export interface Iso9001Dimension {
  id: string;
  category: Iso9001Category;
  clauseNumber: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  levels: Iso9001Level[];
}

export interface Iso9001CategoryInfo {
  id: Iso9001Category;
  clause: string;
  index: string;
  title: string;
  shortTitle: string;
  description: string;
  deliverables: string;
  color: string;
  rgb: [number, number, number];
  dimensionsCount: number;
}

export const ISO9001_CATEGORIES: Iso9001CategoryInfo[] = [
  {
    id: 'contexto',
    clause: 'Cláusula 4',
    index: '01',
    title: 'Contexto y Partes Interesadas',
    shortTitle: 'Contexto',
    description: 'Comprensión del entorno de la empresa, necesidades del mercado y alcance del SGC.',
    deliverables: 'Análisis DOFA/PESTEL · Partes Interesadas · Alcance del SGC',
    color: '#0284c7', // Sky
    rgb: [2, 132, 199],
    dimensionsCount: 3,
  },
  {
    id: 'liderazgo',
    clause: 'Cláusula 5',
    index: '02',
    title: 'Liderazgo y Compromiso',
    shortTitle: 'Liderazgo',
    description: 'Compromiso de la alta dirección, enfoque al cliente y roles del SGC.',
    deliverables: 'Compromiso Gerencial · Política de Calidad · Roles y Autoridades',
    color: '#0d9488', // Teal
    rgb: [13, 148, 136],
    dimensionsCount: 3,
  },
  {
    id: 'planificacion',
    clause: 'Cláusula 6',
    index: '03',
    title: 'Planificación y Riesgos',
    shortTitle: 'Planificación',
    description: 'Gestión de riesgos, oportunidades y formulación de objetivos de calidad.',
    deliverables: 'Matriz de Riesgos · Objetivos SMART · Gestión del Cambio (RFC)',
    color: '#7c3aed', // Violet
    rgb: [124, 58, 237],
    dimensionsCount: 3,
  },
  {
    id: 'apoyo',
    clause: 'Cláusula 7',
    index: '04',
    title: 'Apoyo y Recursos',
    shortTitle: 'Recursos',
    description: 'Personal, infraestructura, conocimiento organizacional y control de información documentada.',
    deliverables: 'Infraestructura · Matriz de Competencias · Control Documental',
    color: '#d97706', // Amber
    rgb: [217, 119, 6],
    dimensionsCount: 3,
  },
  {
    id: 'operacion',
    clause: 'Cláusula 8',
    index: '05',
    title: 'Operación y Producción',
    shortTitle: 'Operación',
    description: 'Planificación operativa, relación con clientes, diseño/desarrollo y control de salidas no conformes.',
    deliverables: 'Revisión Contractual · QA/QC de Diseño · Proveedores · Control NC',
    color: '#2563eb', // Blue
    rgb: [37, 99, 235],
    dimensionsCount: 4,
  },
  {
    id: 'evaluacion',
    clause: 'Cláusula 9',
    index: '06',
    title: 'Evaluación del Desempeño',
    shortTitle: 'Evaluación',
    description: 'Medición, auditorías internas y revisión gerencial del SGC.',
    deliverables: 'Satisfacción NPS · Auditorías Internas · Revisión por Dirección',
    color: '#e11d48', // Rose
    rgb: [225, 29, 72],
    dimensionsCount: 3,
  },
  {
    id: 'mejora',
    clause: 'Cláusula 10',
    index: '07',
    title: 'Mejora Continua',
    shortTitle: 'Mejora',
    description: 'Gestión de no conformidades, acciones correctivas y mejora continua del SGC.',
    deliverables: 'Acciones Correctivas (5 Porqués) · Lecciones Aprendidas · Ciclo PHVA',
    color: '#059669', // Emerald
    rgb: [5, 150, 105],
    dimensionsCount: 2,
  },
];

export const ISO9001_DIMENSIONS: Iso9001Dimension[] = [
  // 1. Contexto y Partes Interesadas (Cláusula 4)
  {
    id: 'iso_4_1_contexto',
    category: 'contexto',
    clauseNumber: '4.1',
    name: '1.1. Contexto Organizacional (Análisis DOFA / PESTEL)',
    shortName: 'Contexto Organizacional',
    icon: '🧭',
    description: 'Comprensión del entorno de la empresa, factores internos/externos y alineación estratégica.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'No hay análisis de factores internos ni externos.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se identifican fortalezas y amenazas verbalmente en reuniones de dirección.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Existe una matriz DOFA/PESTEL documentada y actualizada manualmente.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'El análisis de contexto está en la plataforma y alineado con los objetivos del negocio.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Se revisa trimestralmente en el tablero con alertas activas sobre cambios en el entorno.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_4_2_partes',
    category: 'contexto',
    clauseNumber: '4.2',
    name: '1.2. Necesidades de Partes Interesadas',
    shortName: 'Partes Interesadas',
    icon: '👥',
    description: 'Identificación y seguimiento a expectativas de clientes, proveedores, colaboradores y reguladores.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'No se identifican expectativas de clientes, proveedores ni entes reguladores.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se conocen las necesidades de clientes pero no de otras partes (ej. equipo interno, proveedores).',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Matriz formal de partes interesadas con sus requisitos explícitos.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Matriz integrada al tablero con seguimiento al cumplimiento de requisitos contractuales y legales.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Evaluación sistemática de satisfacción de todas las partes interesadas con acciones automáticas.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_4_3_alcance',
    category: 'contexto',
    clauseNumber: '4.3',
    name: '1.3. Alcance del SGC',
    shortName: 'Alcance del SGC',
    icon: '📐',
    description: 'Definición formal de los servicios de diseño arquitectónico y modelado cubiertos por el SGC.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'No está definido qué servicios cubre el sistema de calidad.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se asume que cubre todo Mesh, pero sin documento ni límites claros.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Documento de alcance redactado (ej. "Diseño, modelado BIM y coordinación de proyectos arquitectónicos").',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Alcance publicado e integrado en la propuesta de valor y plataforma comercial.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Alcance auditado y adaptado activamente ante nuevas líneas de servicio de Mesh.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },

  // 2. Liderazgo y Compromiso (Cláusula 5)
  {
    id: 'iso_5_1_compromiso',
    category: 'liderazgo',
    clauseNumber: '5.1',
    name: '2.1. Compromiso de la Dirección y Enfoque al Cliente',
    shortName: 'Compromiso Dirección',
    icon: '👑',
    description: 'Implicación activa de la alta dirección, asignación de recursos y cultura de calidad.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'La gerencia ve la ISO como un trámite o requisito puramente de papel.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'La dirección promueve la calidad verbalmente, pero no asigna presupuesto ni tiempo claro.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'La dirección asigna recursos, aprueba objetivos y revisa el SGC periódicamente.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'La gerencia lidera las revisiones directamente desde los tableros interactivos de la plataforma.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Cultura de calidad consolidada; la dirección innova a partir de los datos del SGC.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_5_2_politica',
    category: 'liderazgo',
    clauseNumber: '5.2',
    name: '2.2. Política de Calidad',
    shortName: 'Política de Calidad',
    icon: '📜',
    description: 'Redacción, publicación, socialización y comprensión de la Política de Calidad de Mesh.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'No existe Política de Calidad.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Existe un texto genérico copiado de otra empresa sin relevancia para Mesh.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Política redactada, firmada y publicada, alineada al negocio de Mesh.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Socializada con todo el equipo y visible en el Dashboard principal.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Cada colaborador entiende y explica cómo su trabajo diario aporta a la Política.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_5_3_roles',
    category: 'liderazgo',
    clauseNumber: '5.3',
    name: '2.3. Roles, Responsabilidades y Autoridades',
    shortName: 'Roles y Autoridades',
    icon: '👔',
    description: 'Organigrama por procesos, manual de funciones y responsabilidades del personal.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Funciones ambiguas o superpuestas entre colaboradores.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Funciones verbales sin perfiles de cargo o matriz de responsabilidades escrita.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Manual de funciones y organigrama estructurado por procesos.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Asignación de roles y permisos integrada dentro del workflow de la plataforma.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Evaluaciones de desempeño de roles automatizadas con feedback continuo.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },

  // 3. Planificación y Riesgos (Cláusula 6)
  {
    id: 'iso_6_1_riesgos',
    category: 'planificacion',
    clauseNumber: '6.1',
    name: '3.1. Gestión de Riesgos y Oportunidades',
    shortName: 'Riesgos y Oportunidades',
    icon: '🛡️',
    description: 'Identificación sistemática, evaluación de probabilidad/impacto y planes de mitigación.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Se reacciona a los problemas cuando ocurren (modo "apagafuegos").',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se identifican riesgos informalmente en reuniones de proyecto.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Matriz de Riesgos (AMFE/ISO 31000) con probabilidad, impacto y planes de mitigación.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Módulo de riesgos en la plataforma con responsables y alertas automáticas.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Análisis predictivo de riesgos en proyectos basado en históricos de la plataforma.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_6_2_objetivos',
    category: 'planificacion',
    clauseNumber: '6.2',
    name: '3.2. Objetivos de Calidad y Planificación',
    shortName: 'Objetivos de Calidad',
    icon: '🎯',
    description: 'Metas SMART cuantificables alineadas a la estrategia, monitoreadas por KPIs en vivo.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Sin objetivos de calidad definidos.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Objetivos informales sin metas cuantitativas (ej. "mejorar entregas").',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Objetivos SMART redactados (ej. "Reducir reprocesos en modelado BIM al <5% en Q3").',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Tablero de KPIs en tiempo real sincronizado con el avance de proyectos.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Objetivos que se recalculan y reajustan dinámicamente con análisis de desviaciones.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_6_3_cambio',
    category: 'planificacion',
    clauseNumber: '6.3',
    name: '3.3. Gestión del Cambio',
    shortName: 'Gestión del Cambio',
    icon: '🔄',
    description: 'Procedimiento formal de Solicitud de Cambio (RFC) y evaluación de impacto técnico.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Los cambios en la empresa o proyectos se hacen de forma caótica.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se informan cambios por chat/correo sin evaluar impactos en calidad o costo.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Procedimiento formal para solicitudes de cambio (RFC).',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Módulo de control de cambios integrado en la plataforma con aprobación digital.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Histórico de cambios analizado para prevenir variaciones no planificadas en futuros proyectos.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },

  // 4. Apoyo y Recursos (Cláusula 7)
  {
    id: 'iso_7_1_recursos',
    category: 'apoyo',
    clauseNumber: '7.1',
    name: '4.1. Recursos e Infraestructura (Hardware, Software y Entorno)',
    shortName: 'Infraestructura',
    icon: '💻',
    description: 'Control de hardware, licencias, capacidad de almacenamiento y entorno laboral.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Equipos/licencias inadecuados o fallas frecuentes sin control.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Mantenimiento y compra de recursos según demanda urgente.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Inventario y plan de mantenimiento de infraestructura física y digital.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Gestión de recursos centralizada en plataforma con control de capacidades y licencias.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Renovación tecnológica planificada con base en métricas de rendimiento y productividad.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_7_2_competencia',
    category: 'apoyo',
    clauseNumber: '7.2',
    name: '4.2. Competencia y Toma de Conciencia',
    shortName: 'Competencia y Formación',
    icon: '🎓',
    description: 'Matriz de competencias del equipo, planes de inducción, capacitación y plan de carrera.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Sin perfiles de ingreso ni plan de capacitación.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Capacitación empírica "sobre la marcha" entre compañeros.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Matriz de competencias, planes de formación y registros de inducción.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Seguimiento interactivo de capacitaciones y certificación interna en el tablero.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Plan de carrera y gestión del conocimiento en red (Wiki/LMS propia de Mesh).',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_7_3_documentacion',
    category: 'apoyo',
    clauseNumber: '7.5',
    name: '4.3. Información Documentada (Control de Documentos)',
    shortName: 'Control Documental',
    icon: '📁',
    description: 'Codificación, control de versiones, permisos de acceso y gobernanza documental.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Archivos duplicados, carpetas personales desordenadas, sin control de versiones.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Estructura de carpetas básica en nube pero con nomenclaturas heterogéneas.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Procedimiento de codificación, control de versiones (v1, v2) y almacenamiento seguro.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Documentación centralizada en la plataforma con permisos por rol y control de cambios.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Cero documentos en papel o carpetas aisladas; gobernanza de datos 100% automatizada.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },

  // 5. Operación y Producción (Cláusula 8)
  {
    id: 'iso_8_1_requisitos',
    category: 'operacion',
    clauseNumber: '8.2',
    name: '5.1. Requisitos para Productos y Servicios (Ventas/Cotización)',
    shortName: 'Ventas y Cotización',
    icon: '💼',
    description: 'Estandarización de cotizaciones, revisión técnica contractual y validación de alcance.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Cotizaciones sin alcance claro ni revisión técnica previa.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Acuerdos verbales o correos sueltos sobre los entregables del cliente.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Formato estandarizado de revisión de contrato y aceptación formal de alcance.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Módulo de propuestas en la plataforma con validación automática de requisitos.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Trazabilidad total desde la propuesta comercial hasta el acta de entrega final.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_8_2_diseno',
    category: 'operacion',
    clauseNumber: '8.3',
    name: '5.2. Diseño, Desarrollo y Coordinación (Procesos Misionales/BIM)',
    shortName: 'Diseño y QA/QC',
    icon: '📐',
    description: 'Fases de diseño claras, listas de chequeo QA/QC, coordinación técnica y automatización.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Cada diseñador trabaja con sus propias reglas sin estándar de entrega.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Uso de plantillas básicas pero sin controles intermedios de calidad.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Fases de diseño claras (Conceptual, Causal, Detalle) con listas de chequeo QA/QC.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Coordinación y detección de interferencias integradas al workflow de la plataforma.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Automatización de chequeos de calidad (scripts/rutinas) con mínimos errores humanos.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_8_3_proveedores',
    category: 'operacion',
    clauseNumber: '8.4',
    name: '5.3. Control de Proveedores y Subcontratistas',
    shortName: 'Proveedores y Aliados',
    icon: '🤝',
    description: 'Criterios de selección, registro de proveedores aprobados y evaluación periódica de desempeño.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Contratación externa basada solo en precio, sin evaluación de calidad.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Criterios informales de selección de freelancers o proveedores.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Registro de proveedores aprobados con evaluación anual de desempeño.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Portal/Módulo para proveedores en la plataforma con calificaciones transparentes.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Alianzas estratégicas con proveedores integrados a los estándares de calidad de Mesh.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_8_4_salidas_nc',
    category: 'operacion',
    clauseNumber: '8.7',
    name: '5.4. Control de Salidas No Conformes (Errores y Reprocesos)',
    shortName: 'Salidas No Conformes',
    icon: '⚠️',
    description: 'Detección oportuna de fallas previas a la entrega, formato de No Conformidad y costo de reprocesos.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Se entregan errores al cliente sin filtro interno; el cliente es quien los detecta.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se corrige el error al instante, pero no se registra ni se analiza la causa.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Formato de No Conformidad para identificar fallas antes de enviar al cliente.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Registro interactivo de reprocesos en la plataforma con costos y horas perdidas asociadas.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Tendencia a "Cero Errores" mediante controles preventivos en tiempo real.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },

  // 6. Evaluación del Desempeño (Cláusula 9)
  {
    id: 'iso_9_1_satisfaccion',
    category: 'evaluacion',
    clauseNumber: '9.1.2',
    name: '6.1. Satisfacción del Cliente',
    shortName: 'Satisfacción del Cliente',
    icon: '⭐',
    description: 'Mecanismos formales de consulta al cliente, encuestas estructuradas y métricas NPS.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'No se consulta la opinión del cliente tras la entrega.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se pregunta informalmente por WhatsApp/llamada si quedaron contentos.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Encuesta formal de satisfacción al finalizar cada proyecto.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Módulo de feedback directo en la plataforma con métricas Net Promoter Score (NPS).',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Análisis predictivo de satisfacción y fidelización con alertas tempranas.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_9_2_auditorias',
    category: 'evaluacion',
    clauseNumber: '9.2',
    name: '6.2. Auditorías Internas del SGC',
    shortName: 'Auditorías Internas',
    icon: '🔍',
    description: 'Programa anual de auditorías internas planificadas, listas de verificación y seguimiento de hallazgos.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'No se realizan auditorías internas de calidad.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Revisiones esporádicas e informales cuando surge un problema grave o queja.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Programa anual de auditorías internas planificadas con informe documentado.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Auditorías internas digitales en la plataforma con registro de hallazgos y evidencias.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Auditorías continuas automatizadas con cruce de métricas y evaluación preventiva.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_9_3_revision_dir',
    category: 'evaluacion',
    clauseNumber: '9.3',
    name: '6.3. Revisión por la Dirección',
    shortName: 'Revisión por Dirección',
    icon: '📊',
    description: 'Evaluación formal del desempeño del sistema de calidad por parte de la alta gerencia.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'La alta dirección no revisa formalmente el desempeño del SGC.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Mención informal en reuniones generales sin acta ni seguimiento.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Reunión formal anual de Revisión por la Dirección con acta y compromisos definidos.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Revisión gerencial trimestral alimentada en tiempo real por el dashboard de calidad.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Dirección estratégica continua con decisiones basadas 100% en analítica del SGC.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },

  // 7. Mejora Continua (Cláusula 10)
  {
    id: 'iso_10_1_acciones_corr',
    category: 'mejora',
    clauseNumber: '10.2',
    name: '7.1. No Conformidades y Acciones Correctivas',
    shortName: 'Acciones Correctivas',
    icon: '🔧',
    description: 'Tratamiento de no conformidades, análisis de causa raíz (Ishikawa, 5 Porqués) y seguimiento de eficacia.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'Los errores se repiten sin análisis ni registro de causa raíz.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se aplican soluciones temporales inmediatas (parches) sin investigar causas de fondo.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Procedimiento formal de No Conformidad y Acción Correctiva (metodología 5 Porqués / Ishikawa).',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Módulo de Acciones Correctivas en plataforma con responsables y evaluación de eficacia.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Sistema predictivo de no conformidades con recurrencia cero y mejora preventiva.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
  {
    id: 'iso_10_2_mejora_continua',
    category: 'mejora',
    clauseNumber: '10.3',
    name: '7.2. Mejora Continua y Lecciones Aprendidas',
    shortName: 'Mejora y Lecciones',
    icon: '🚀',
    description: 'Gestión sistemática de oportunidades de mejora, banco de lecciones aprendidas y ciclo PHVA.',
    levels: [
      {
        title: 'Nivel 0: Inicial',
        description: 'No existe cultura de mejora continua ni banco de lecciones aprendidas.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-300',
      },
      {
        title: 'Nivel 1: Definido',
        description: 'Se comentan lecciones aprendidas verbalmente al concluir proyectos.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
      },
      {
        title: 'Nivel 2: Gestionado',
        description: 'Registro formal de lecciones aprendidas y buzón de oportunidades de mejora.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
      },
      {
        title: 'Nivel 3: Integrado',
        description: 'Ciclos PHVA (Planear-Hacer-Verificar-Actuar) sistemáticos integrados en los procesos del estudio.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
      },
      {
        title: 'Nivel 4: Optimizado',
        description: 'Cultura de innovación y mejora continua con iniciativas premiadas y optimización constante.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      },
    ],
  },
];

export const TOTAL_ISO9001_DIMENSIONS = ISO9001_DIMENSIONS.length; // 21 items
export const MAX_ISO9001_POINTS = TOTAL_ISO9001_DIMENSIONS * 4; // 84 points

export const DEFAULT_ISO9001_SELECTIONS: Record<string, number> = {
  iso_4_1_contexto: 2,
  iso_4_2_partes: 1,
  iso_4_3_alcance: 2,
  iso_5_1_compromiso: 2,
  iso_5_2_politica: 2,
  iso_5_3_roles: 1,
  iso_6_1_riesgos: 1,
  iso_6_2_objetivos: 1,
  iso_6_3_cambio: 1,
  iso_7_1_recursos: 2,
  iso_7_2_competencia: 1,
  iso_7_3_documentacion: 2,
  iso_8_1_requisitos: 2,
  iso_8_2_diseno: 2,
  iso_8_3_proveedores: 1,
  iso_8_4_salidas_nc: 1,
  iso_9_1_satisfaccion: 1,
  iso_9_2_auditorias: 1,
  iso_9_3_revision_dir: 1,
  iso_10_1_acciones_corr: 1,
  iso_10_2_mejora_continua: 1,
};

export const DEFAULT_ISO9001_TARGET_SELECTIONS: Record<string, number> = {
  iso_4_1_contexto: 3,
  iso_4_2_partes: 3,
  iso_4_3_alcance: 3,
  iso_5_1_compromiso: 3,
  iso_5_2_politica: 3,
  iso_5_3_roles: 3,
  iso_6_1_riesgos: 3,
  iso_6_2_objetivos: 3,
  iso_6_3_cambio: 2,
  iso_7_1_recursos: 3,
  iso_7_2_competencia: 3,
  iso_7_3_documentacion: 3,
  iso_8_1_requisitos: 3,
  iso_8_2_diseno: 3,
  iso_8_3_proveedores: 2,
  iso_8_4_salidas_nc: 3,
  iso_9_1_satisfaccion: 3,
  iso_9_2_auditorias: 2,
  iso_9_3_revision_dir: 2,
  iso_10_1_acciones_corr: 3,
  iso_10_2_mejora_continua: 3,
};

export function computeIso9001CategoryTargets(
  targetSelections: Record<string, number>
): Record<Iso9001Category, number> {
  const result: Record<Iso9001Category, number> = {
    contexto: 0,
    liderazgo: 0,
    planificacion: 0,
    apoyo: 0,
    operacion: 0,
    evaluacion: 0,
    mejora: 0,
  };

  ISO9001_CATEGORIES.forEach((cat) => {
    const catDimensions = ISO9001_DIMENSIONS.filter((d) => d.category === cat.id);
    const maxPts = catDimensions.length * 4;
    const currentPts = catDimensions.reduce((acc, d) => {
      const lvl = targetSelections[d.id] ?? 0;
      return acc + Math.max(0, Math.min(4, lvl));
    }, 0);
    result[cat.id] = maxPts > 0 ? Math.round((currentPts / maxPts) * 100) : 0;
  });

  return result;
}

export function computeIso9001CategoryActualScores(
  selections: Record<string, number>
): Record<Iso9001Category, { points: number; maxPoints: number; percentage: number; avgLevel: number }> {
  const result: Record<Iso9001Category, { points: number; maxPoints: number; percentage: number; avgLevel: number }> = {
    contexto: { points: 0, maxPoints: 12, percentage: 0, avgLevel: 0 },
    liderazgo: { points: 0, maxPoints: 12, percentage: 0, avgLevel: 0 },
    planificacion: { points: 0, maxPoints: 12, percentage: 0, avgLevel: 0 },
    apoyo: { points: 0, maxPoints: 12, percentage: 0, avgLevel: 0 },
    operacion: { points: 0, maxPoints: 16, percentage: 0, avgLevel: 0 },
    evaluacion: { points: 0, maxPoints: 12, percentage: 0, avgLevel: 0 },
    mejora: { points: 0, maxPoints: 8, percentage: 0, avgLevel: 0 },
  };

  ISO9001_CATEGORIES.forEach((cat) => {
    const catDimensions = ISO9001_DIMENSIONS.filter((d) => d.category === cat.id);
    const maxPts = catDimensions.length * 4;
    const currentPts = catDimensions.reduce((acc, d) => {
      const lvl = selections[d.id] ?? 0;
      return acc + Math.max(0, Math.min(4, lvl));
    }, 0);
    const percentage = maxPts > 0 ? Math.round((currentPts / maxPts) * 100) : 0;
    const avgLevel = catDimensions.length > 0 ? Number((currentPts / catDimensions.length).toFixed(1)) : 0;
    result[cat.id] = { points: currentPts, maxPoints: maxPts, percentage, avgLevel };
  });

  return result;
}

export function getIso9001MaturityLabel(percentage: number): {
  level: number;
  label: string;
  badge: string;
  color: string;
} {
  if (percentage >= 80) {
    return {
      level: 4,
      label: 'Nivel 4: Optimizado (Clase Mundial)',
      badge: 'Optimizado',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }
  if (percentage >= 60) {
    return {
      level: 3,
      label: 'Nivel 3: Integrado (SGC Maduro)',
      badge: 'Integrado',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    };
  }
  if (percentage >= 40) {
    return {
      level: 2,
      label: 'Nivel 2: Gestionado (Estandarizado)',
      badge: 'Gestionado',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }
  if (percentage >= 20) {
    return {
      level: 1,
      label: 'Nivel 1: Definido (En Desarrollo)',
      badge: 'Definido',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
    };
  }
  return {
    level: 0,
    label: 'Nivel 0: Inicial (Reactivo)',
    badge: 'Inicial',
    color: 'text-red-700 bg-red-50 border-red-200',
  };
}
