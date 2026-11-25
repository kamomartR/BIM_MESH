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
}

export interface Iso9001Dimension {
  id: string;
  category: Iso9001Category;
  clauseNumber: string;
  name: string;
  description: string;
  levels: Iso9001Level[];
}

export interface Iso9001CategoryMeta {
  id: Iso9001Category;
  clause: string;
  title: string;
  shortTitle: string;
  description: string;
  dimensionsCount: number;
  deliverables: string;
}

export const ISO9001_CATEGORIES: Iso9001CategoryMeta[] = [
  {
    id: 'contexto',
    clause: 'Cláusula 4',
    title: 'Contexto y Partes Interesadas',
    shortTitle: 'Contexto (Cl. 4)',
    description: 'Comprensión del entorno de la empresa, necesidades del mercado y alcance del SGC.',
    dimensionsCount: 3,
    deliverables: 'Matriz DOFA/PESTEL, Matriz de Partes Interesadas, Documento de Alcance SGC',
  },
  {
    id: 'liderazgo',
    clause: 'Cláusula 5',
    title: 'Liderazgo y Compromiso',
    shortTitle: 'Liderazgo (Cl. 5)',
    description: 'Compromiso de la alta dirección, enfoque al cliente y roles del SGC.',
    dimensionsCount: 3,
    deliverables: 'Política de Calidad firmada, Manual de Funciones y Organigrama por Procesos',
  },
  {
    id: 'planificacion',
    clause: 'Cláusula 6',
    title: 'Planificación y Riesgos',
    shortTitle: 'Planificación (Cl. 6)',
    description: 'Gestión de riesgos, oportunidades, objetivos de calidad y gestión del cambio.',
    dimensionsCount: 3,
    deliverables: 'Matriz de Riesgos AMFE/ISO 31000, Objetivos SMART y Protocolo de Cambios',
  },
  {
    id: 'apoyo',
    clause: 'Cláusula 7',
    title: 'Apoyo, Recursos y Documentación',
    shortTitle: 'Apoyo (Cl. 7)',
    description: 'Infraestructura, competencia del equipo y control de información documentada.',
    dimensionsCount: 3,
    deliverables: 'Inventario de Recursos, Plan de Capacitación y Listado Maestro Documental',
  },
  {
    id: 'operacion',
    clause: 'Cláusula 8',
    title: 'Operación y Diseño de Proyectos',
    shortTitle: 'Operación (Cl. 8)',
    description: 'Requisitos del cliente, control de diseño BIM, proveedores y salidas no conformes.',
    dimensionsCount: 4,
    deliverables: 'Caracterización de Servicios, QA/QC de Diseño, Evaluación Proveedores, Control SNC',
  },
  {
    id: 'evaluacion',
    clause: 'Cláusula 9',
    title: 'Evaluación del Desempeño',
    shortTitle: 'Evaluación (Cl. 9)',
    description: 'Satisfacción del cliente, auditorías internas y revisión por la dirección.',
    dimensionsCount: 3,
    deliverables: 'Encuestas NPS/Satisfacción, Programa de Auditoría Interna y Actas de Revisión',
  },
  {
    id: 'mejora',
    clause: 'Cláusula 10',
    title: 'Mejora Continua y Acciones Correctivas',
    shortTitle: 'Mejora (Cl. 10)',
    description: 'Tratamiento de no conformidades, análisis causa raíz y mejora sistemática.',
    dimensionsCount: 2,
    deliverables: 'Registro de No Conformidades y Acciones Correctivas (ACPM), Banco de Lecciones',
  },
];

export const ISO9001_DIMENSIONS: Iso9001Dimension[] = [
  // CLÁUSULA 4: CONTEXTO
  {
    id: 'iso_4_1_contexto',
    category: 'contexto',
    clauseNumber: '4.1',
    name: 'Contexto Organizacional (Análisis DOFA / PESTEL)',
    description: 'Identificación y seguimiento de factores internos y externos estratégicos para Mesh Estudio.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No hay análisis de factores internos ni externos.' },
      { title: 'Nivel 1: Definido', description: 'Se identifican fortalezas y amenazas verbalmente en reuniones de dirección.' },
      { title: 'Nivel 2: Gestionado', description: 'Existe una matriz DOFA/PESTEL documentada y actualizada manualmente.' },
      { title: 'Nivel 3: Integrado', description: 'El análisis de contexto está en la plataforma y alineado con los objetivos del negocio.' },
      { title: 'Nivel 4: Optimizado', description: 'Se revisa trimestralmente en el tablero con alertas activas sobre cambios en el entorno.' },
    ],
  },
  {
    id: 'iso_4_2_partes',
    category: 'contexto',
    clauseNumber: '4.2',
    name: 'Necesidades de Partes Interesadas',
    description: 'Determinación y seguimiento de requisitos de clientes, equipo, proveedores y entes reguladores.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No se identifican expectativas de clientes, proveedores ni entes reguladores.' },
      { title: 'Nivel 1: Definido', description: 'Se conocen las necesidades de clientes pero no de otras partes (ej. equipo interno, proveedores).' },
      { title: 'Nivel 2: Gestionado', description: 'Matriz formal de partes interesadas con sus requisitos explícitos.' },
      { title: 'Nivel 3: Integrado', description: 'Matriz integrada al tablero con seguimiento al cumplimiento de requisitos contractuales y legales.' },
      { title: 'Nivel 4: Optimizado', description: 'Evaluación sistemática de satisfacción de todas las partes interesadas con acciones automáticas.' },
    ],
  },
  {
    id: 'iso_4_3_alcance',
    category: 'contexto',
    clauseNumber: '4.3',
    name: 'Alcance del SGC',
    description: 'Delimitación formal de servicios, líneas de negocio y aplicabilidad del Sistema de Gestión de Calidad.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No está definido qué servicios cubre el sistema de calidad.' },
      { title: 'Nivel 1: Definido', description: 'Se asume que cubre todo Mesh, pero sin documento ni límites claros.' },
      { title: 'Nivel 2: Gestionado', description: 'Documento de alcance redactado (ej. "Diseño, modelado BIM y coordinación de proyectos arquitectónicos").' },
      { title: 'Nivel 3: Integrado', description: 'Alcance publicado e integrado en la propuesta de valor y plataforma comercial.' },
      { title: 'Nivel 4: Optimizado', description: 'Alcance auditado y adaptado activamente ante nuevas líneas de servicio de Mesh.' },
    ],
  },

  // CLÁUSULA 5: LIDERAZGO
  {
    id: 'iso_5_1_compromiso',
    category: 'liderazgo',
    clauseNumber: '5.1',
    name: 'Compromiso de la Dirección y Enfoque al Cliente',
    description: 'Liderazgo ejecutivo, asignación de recursos y enfoque hacia los requisitos del cliente.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'La gerencia ve la ISO como un trámite o requisito puramente de papel.' },
      { title: 'Nivel 1: Definido', description: 'La dirección promueve la calidad verbalmente, pero no asigna presupuesto ni tiempo claro.' },
      { title: 'Nivel 2: Gestionado', description: 'La dirección asigna recursos, aprueba objetivos y revisa el SGC periódicamente.' },
      { title: 'Nivel 3: Integrado', description: 'La gerencia lidera las revisiones directamente desde los tableros interactivos de la plataforma.' },
      { title: 'Nivel 4: Optimizado', description: 'Cultura de calidad consolidada; la dirección innova a partir de los datos del SGC.' },
    ],
  },
  {
    id: 'iso_5_2_politica',
    category: 'liderazgo',
    clauseNumber: '5.2',
    name: 'Política de Calidad',
    description: 'Declaración estratégica del compromiso con la calidad y la mejora continua de Mesh Estudio.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No existe Política de Calidad.' },
      { title: 'Nivel 1: Definido', description: 'Existe un texto genérico copiado de otra empresa sin relevancia para Mesh.' },
      { title: 'Nivel 2: Gestionado', description: 'Política redactada, firmada y publicada, alineada al negocio de Mesh.' },
      { title: 'Nivel 3: Integrado', description: 'Socializada con todo el equipo y visible en el Dashboard principal.' },
      { title: 'Nivel 4: Optimizado', description: 'Cada colaborador entiende y explica cómo su trabajo diario aporta a la Política.' },
    ],
  },
  {
    id: 'iso_5_3_roles',
    category: 'liderazgo',
    clauseNumber: '5.3',
    name: 'Roles, Responsabilidades y Autoridades',
    description: 'Claridad en funciones, matriz RACI, perfiles de cargo y autoridad para la toma de decisiones.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Funciones ambiguas o superpuestas entre colaboradores.' },
      { title: 'Nivel 1: Definido', description: 'Funciones verbales sin perfiles de cargo o matriz de responsabilidades escrita.' },
      { title: 'Nivel 2: Gestionado', description: 'Manual de funciones y organigrama estructurado por procesos.' },
      { title: 'Nivel 3: Integrado', description: 'Asignación de roles y permisos integrada dentro del workflow de la plataforma.' },
      { title: 'Nivel 4: Optimizado', description: 'Evaluaciones de desempeño de roles automatizadas con feedback continuo.' },
    ],
  },

  // CLÁUSULA 6: PLANIFICACIÓN
  {
    id: 'iso_6_1_riesgos',
    category: 'planificacion',
    clauseNumber: '6.1',
    name: 'Gestión de Riesgos y Oportunidades',
    description: 'Identificación preventiva, evaluación y tratamiento de riesgos técnicos, operativos y comerciales.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Se reacciona a los problemas cuando ocurren (modo "apagafuegos").' },
      { title: 'Nivel 1: Definido', description: 'Se identifican riesgos informalmente en reuniones de proyecto.' },
      { title: 'Nivel 2: Gestionado', description: 'Matriz de Riesgos (AMFE/ISO 31000) con probabilidad, impacto y planes de mitigación.' },
      { title: 'Nivel 3: Integrado', description: 'Módulo de riesgos en la plataforma con responsables y alertas automáticas.' },
      { title: 'Nivel 4: Optimizado', description: 'Análisis predictivo de riesgos en proyectos basado en históricos de la plataforma.' },
    ],
  },
  {
    id: 'iso_6_2_objetivos',
    category: 'planificacion',
    clauseNumber: '6.2',
    name: 'Objetivos de Calidad y Planificación',
    description: 'Definición de metas cuantitativas SMART y monitoreo de indicadores clave de desempeño.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Sin objetivos de calidad definidos.' },
      { title: 'Nivel 1: Definido', description: 'Objetivos informales sin metas cuantitativas (ej. "mejorar entregas").' },
      { title: 'Nivel 2: Gestionado', description: 'Objetivos SMART redactados (ej. "Reducir reprocesos en modelado BIM al <5% en Q3").' },
      { title: 'Nivel 3: Integrado', description: 'Tablero de KPIs en tiempo real sincronizado con el avance de proyectos.' },
      { title: 'Nivel 4: Optimizado', description: 'Objetivos que se recalculan y reajustan dinámicamente con análisis de desviaciones.' },
    ],
  },
  {
    id: 'iso_6_3_cambio',
    category: 'planificacion',
    clauseNumber: '6.3',
    name: 'Gestión del Cambio',
    description: 'Planificación controlada de modificaciones al SGC, procesos, herramientas o alcances.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los cambios en la empresa o proyectos se improvisan sin medir impactos.' },
      { title: 'Nivel 1: Definido', description: 'Se comunican cambios por correo o chat sin un registro de aprobación.' },
      { title: 'Nivel 2: Gestionado', description: 'Procedimiento formal de solicitudes de cambio con análisis de impacto y aprobación.' },
      { title: 'Nivel 3: Integrado', description: 'Flujo digital de control de cambios vinculado al cronograma y presupuesto.' },
      { title: 'Nivel 4: Optimizado', description: 'Gestión del cambio ágil con medición de adopción y retorno sobre cada mejora.' },
    ],
  },

  // CLÁUSULA 7: APOYO
  {
    id: 'iso_7_1_recursos',
    category: 'apoyo',
    clauseNumber: '7.1',
    name: 'Recursos, Infraestructura y Ambiente',
    description: 'Disponibilidad y mantenimiento de hardware, licencias, red y ambiente de trabajo.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Equipos y licencias sin inventario ni plan de mantenimiento preventivo.' },
      { title: 'Nivel 1: Definido', description: 'Se atienden fallas técnicas cuando ocurren sin presupuesto planificado.' },
      { title: 'Nivel 2: Gestionado', description: 'Inventario actualizado de equipos, licencias y cronograma de mantenimiento.' },
      { title: 'Nivel 3: Integrado', description: 'Gestión de recursos sincronizada con capacidad operativa y demanda de proyectos.' },
      { title: 'Nivel 4: Optimizado', description: 'Monitoreo continuo de rendimiento de infraestructura y renovación proactiva.' },
    ],
  },
  {
    id: 'iso_7_2_competencia',
    category: 'apoyo',
    clauseNumber: '7.2',
    name: 'Competencia, Formación y Toma de Conciencia',
    description: 'Desarrollo técnico BIM/SGC del equipo, matrices de habilidades y planes de formación.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No se evalúan brechas de conocimiento ni existe inducción formal.' },
      { title: 'Nivel 1: Definido', description: 'Capacitaciones reactivas o autoaprendizaje sin registro ni evaluación.' },
      { title: 'Nivel 2: Gestionado', description: 'Matriz de competencias por cargo y plan anual de formación documentado.' },
      { title: 'Nivel 3: Integrado', description: 'Seguimiento de certificaciones, inducción estandarizada y evaluación de eficacia.' },
      { title: 'Nivel 4: Optimizado', description: 'Academia interna Mesh con rutas de carrera vinculadas a resultados de proyecto.' },
    ],
  },
  {
    id: 'iso_7_3_documentacion',
    category: 'apoyo',
    clauseNumber: '7.5',
    name: 'Información Documentada y Control de Versiones',
    description: 'Codificación, aprobación, trazabilidad y resguardo de documentos y registros (alineado a ISO 19650).',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Archivos dispersos sin nomenclatura ni control de versiones vigentes.' },
      { title: 'Nivel 1: Definido', description: 'Carpetas compartidas básicas con convenciones informales de nombres.' },
      { title: 'Nivel 2: Gestionado', description: 'Listado maestro de documentos, codificación estándar y control de obsoletos.' },
      { title: 'Nivel 3: Integrado', description: 'Repositorio único en CDE con permisos por rol, estados WIP/Shared/Published.' },
      { title: 'Nivel 4: Optimizado', description: 'Gobernanza documental automatizada con auditoría de cambios y respaldo continuo.' },
    ],
  },

  // CLÁUSULA 8: OPERACIÓN
  {
    id: 'iso_8_1_requisitos',
    category: 'operacion',
    clauseNumber: '8.2',
    name: 'Requisitos para los Productos y Servicios',
    description: 'Levantamiento estructurado de necesidades del cliente, propuestas y revisión contractual.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Acuerdos verbales o propuestas ambiguas sin validación formal de alcance.' },
      { title: 'Nivel 1: Definido', description: 'Propuestas escritas pero sin checklist técnico de entregables ni exclusiones.' },
      { title: 'Nivel 2: Gestionado', description: 'Caracterización formal de servicios, revisión de requisitos y acta de inicio.' },
      { title: 'Nivel 3: Integrado', description: 'Flujo comercial-técnico integrado con Pre-BEP / Anexo BIM y matriz de entregables.' },
      { title: 'Nivel 4: Optimizado', description: 'Trazabilidad total desde el requerimiento contractual hasta la entrega certificada.' },
    ],
  },
  {
    id: 'iso_8_2_diseno',
    category: 'operacion',
    clauseNumber: '8.3',
    name: 'Diseño, Desarrollo y Control QA/QC',
    description: 'Planificación del diseño arquitectónico/BIM, revisiones técnicas, verificación y validación.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'El diseño y modelado avanzan sin hitos de revisión ni listas de chequeo.' },
      { title: 'Nivel 1: Definido', description: 'Revisiones informales antes de entregar al cliente según criterio individual.' },
      { title: 'Nivel 2: Gestionado', description: 'Etapas de diseño definidas con listas QA en proceso y auditoría QC al entregable.' },
      { title: 'Nivel 3: Integrado', description: 'Protocolo de Coordinación de Modelos, incidencias BCF y aprobación digital por hito.' },
      { title: 'Nivel 4: Optimizado', description: 'Reglas automatizadas de validación de modelos y mejora continua basada en métricas QC.' },
    ],
  },
  {
    id: 'iso_8_3_proveedores',
    category: 'operacion',
    clauseNumber: '8.4',
    name: 'Control de Proveedores y Aliados Externos',
    description: 'Selección, evaluación y seguimiento de consultores, especialistas y proveedores clave.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Contratación de especialistas por cercanía sin criterios ni evaluación.' },
      { title: 'Nivel 1: Definido', description: 'Se comparan cotizaciones pero no se evalúa el desempeño post-entrega.' },
      { title: 'Nivel 2: Gestionado', description: 'Criterios formales de selección y evaluación periódica de proveedores clave.' },
      { title: 'Nivel 3: Integrado', description: 'Proveedores integrados al flujo CDE y estándares de intercambio IFC de Mesh.' },
      { title: 'Nivel 4: Optimizado', description: 'Alianzas estratégicas con indicadores compartidos de calidad y puntualidad.' },
    ],
  },
  {
    id: 'iso_8_4_salidas_nc',
    category: 'operacion',
    clauseNumber: '8.7',
    name: 'Control de Salidas No Conformes',
    description: 'Detección, aislamiento y corrección de entregables defectuosos antes de llegar al cliente.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los errores se detectan cuando el cliente reclama tras la entrega.' },
      { title: 'Nivel 1: Definido', description: 'Se corrigen fallas puntuales pero no se registra qué salió mal ni el reproceso.' },
      { title: 'Nivel 2: Gestionado', description: 'Procedimiento de control de salidas no conformes con registro de corrección.' },
      { title: 'Nivel 3: Integrado', description: 'Compuertas de calidad QC en CDE bloquean publicación sin aprobación formal.' },
      { title: 'Nivel 4: Optimizado', description: 'Tasa de reproceso monitoreada en tiempo real con reducción sistemática de defectos.' },
    ],
  },

  // CLÁUSULA 9: EVALUACIÓN
  {
    id: 'iso_9_1_satisfaccion',
    category: 'evaluacion',
    clauseNumber: '9.1',
    name: 'Seguimiento, Medición y Satisfacción del Cliente',
    description: 'Medición objetiva de la percepción del cliente y desempeño de los procesos clave.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No se mide la satisfacción del cliente ni existen indicadores de proceso.' },
      { title: 'Nivel 1: Definido', description: 'Retroalimentación informal al cierre de proyectos sin consolidación.' },
      { title: 'Nivel 2: Gestionado', description: 'Encuesta estructurada de satisfacción / NPS al cierre de cada hito o proyecto.' },
      { title: 'Nivel 3: Integrado', description: 'Resultados de satisfacción integrados al tablero directivo con planes de acción.' },
      { title: 'Nivel 4: Optimizado', description: 'Monitoreo continuo de experiencia del cliente con alertas tempranas de desviación.' },
    ],
  },
  {
    id: 'iso_9_2_auditorias',
    category: 'evaluacion',
    clauseNumber: '9.2',
    name: 'Auditorías Internas del SGC',
    description: 'Verificación planificada e independiente del cumplimiento del SGC e ISO 9001.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Nunca se han realizado auditorías internas de calidad.' },
      { title: 'Nivel 1: Definido', description: 'Revisiones esporádicas sin programa anual ni criterios auditables.' },
      { title: 'Nivel 2: Gestionado', description: 'Programa anual de auditoría interna con listas de verificación e informes.' },
      { title: 'Nivel 3: Integrado', description: 'Auditorías combinadas SGC + BIM ISO 19650 con seguimiento digital de hallazgos.' },
      { title: 'Nivel 4: Optimizado', description: 'Auditorías enfocadas en riesgos que generan valor estratégico continuo.' },
    ],
  },
  {
    id: 'iso_9_3_revision_dir',
    category: 'evaluacion',
    clauseNumber: '9.3',
    name: 'Revisión por la Dirección',
    description: 'Evaluación periódica de la gerencia sobre la conveniencia, adecuación y eficacia del SGC.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'La dirección no realiza revisiones formales del desempeño de calidad.' },
      { title: 'Nivel 1: Definido', description: 'Reuniones gerenciales centradas solo en finanzas sin indicadores SGC.' },
      { title: 'Nivel 2: Gestionado', description: 'Revisión semestral/anual documentada con entradas, salidas y compromisos.' },
      { title: 'Nivel 3: Integrado', description: 'Comité trimestral apoyado en tableros en vivo de BIM + ISO 9001.' },
      { title: 'Nivel 4: Optimizado', description: 'Revisión estratégica ágil que realimenta directamente el plan anual del estudio.' },
    ],
  },

  // CLÁUSULA 10: MEJORA
  {
    id: 'iso_10_1_acciones_corr',
    category: 'mejora',
    clauseNumber: '10.2',
    name: 'No Conformidades y Acciones Correctivas',
    description: 'Análisis de causa raíz y cierre eficaz de problemas recurrentes para evitar su repetición.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Se corrigen síntomas sin investigar la causa raíz de los errores.' },
      { title: 'Nivel 1: Definido', description: 'Se discuten fallas en equipo pero sin seguimiento a las acciones acordadas.' },
      { title: 'Nivel 2: Gestionado', description: 'Registro formal de no conformidades con análisis causa raíz (5 Porqués) y cierre.' },
      { title: 'Nivel 3: Integrado', description: 'Gestión digital de acciones correctivas con responsables, fechas y verificación.' },
      { title: 'Nivel 4: Optimizado', description: 'Prevención sistémica: las lecciones aprendidas actualizan estándares automáticamente.' },
    ],
  },
  {
    id: 'iso_10_2_mejora_continua',
    category: 'mejora',
    clauseNumber: '10.3',
    name: 'Mejora Continua e Innovación SGC',
    description: 'Evolución sostenida de procesos, productividad y calidad de los entregables de Mesh Estudio.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los procesos se mantienen iguales sin iniciativa estructurada de mejora.' },
      { title: 'Nivel 1: Definido', description: 'Mejoras aisladas impulsadas por personas puntuales sin estandarización.' },
      { title: 'Nivel 2: Gestionado', description: 'Ciclos PHVA documentados y banco formal de lecciones aprendidas por proyecto.' },
      { title: 'Nivel 3: Integrado', description: 'Portafolio de proyectos de mejora conectado a KPIs de BIM y Calidad.' },
      { title: 'Nivel 4: Optimizado', description: 'Cultura de mejora continua e innovación transversal medida en rentabilidad y valor.' },
    ],
  },
];

export const DEFAULT_ISO9001_SELECTIONS: Record<string, number> = {
  iso_4_1_contexto: 1,
  iso_4_2_partes: 1,
  iso_4_3_alcance: 1,
  iso_5_1_compromiso: 2,
  iso_5_2_politica: 0,
  iso_5_3_roles: 1,
  iso_6_1_riesgos: 0,
  iso_6_2_objetivos: 1,
  iso_6_3_cambio: 0,
  iso_7_1_recursos: 1,
  iso_7_2_competencia: 1,
  iso_7_3_documentacion: 1,
  iso_8_1_requisitos: 1,
  iso_8_2_diseno: 1,
  iso_8_3_proveedores: 1,
  iso_8_4_salidas_nc: 0,
  iso_9_1_satisfaccion: 1,
  iso_9_2_auditorias: 0,
  iso_9_3_revision_dir: 1,
  iso_10_1_acciones_corr: 0,
  iso_10_2_mejora_continua: 1,
};

export const DEFAULT_ISO9001_TARGET_SELECTIONS: Record<string, number> = {
  iso_4_1_contexto: 2,
  iso_4_2_partes: 2,
  iso_4_3_alcance: 2,
  iso_5_1_compromiso: 3,
  iso_5_2_politica: 2,
  iso_5_3_roles: 2,
  iso_6_1_riesgos: 2,
  iso_6_2_objetivos: 2,
  iso_6_3_cambio: 2,
  iso_7_1_recursos: 2,
  iso_7_2_competencia: 2,
  iso_7_3_documentacion: 2,
  iso_8_1_requisitos: 2,
  iso_8_2_diseno: 3,
  iso_8_3_proveedores: 2,
  iso_8_4_salidas_nc: 2,
  iso_9_1_satisfaccion: 2,
  iso_9_2_auditorias: 2,
  iso_9_3_revision_dir: 2,
  iso_10_1_acciones_corr: 2,
  iso_10_2_mejora_continua: 2,
};

export function computeIso9001CategoryActualScores(selections: Record<string, number>) {
  const result = {} as Record<
    Iso9001Category,
    { points: number; maxPoints: number; percentage: number; avgLevel: string; count: number }
  >;

  ISO9001_CATEGORIES.forEach((cat) => {
    const dims = ISO9001_DIMENSIONS.filter((d) => d.category === cat.id);
    const maxPoints = dims.length * 4;
    const points = dims.reduce((sum, d) => sum + (selections[d.id] ?? 0), 0);
    const percentage = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
    const avgLevel = dims.length > 0 ? (points / dims.length).toFixed(1) : '0.0';
    result[cat.id] = { points, maxPoints, percentage, avgLevel, count: dims.length };
  });

  return result;
}

export function computeIso9001CategoryTargets(targetSelections: Record<string, number>) {
  const result = {} as Record<Iso9001Category, number>;

  ISO9001_CATEGORIES.forEach((cat) => {
    const dims = ISO9001_DIMENSIONS.filter((d) => d.category === cat.id);
    const maxPoints = dims.length * 4;
    const points = dims.reduce((sum, d) => sum + (targetSelections[d.id] ?? 2), 0);
    result[cat.id] = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
  });

  return result;
}

export function getIso9001MaturityLabel(pct: number): {
  level: string;
  label: string;
  summary: string;
} {
  if (pct < 20) {
    return {
      level: 'Nivel 0',
      label: 'Inicial / Informal',
      summary: 'Prácticas reactivas sin formalización documental del SGC.',
    };
  }
  if (pct < 45) {
    return {
      level: 'Nivel 1',
      label: 'Definido / En Estructuración',
      summary: 'Procesos básicos identificados; requiere estandarización e indicadores.',
    };
  }
  if (pct < 70) {
    return {
      level: 'Nivel 2',
      label: 'Gestionado / Listo para Auditoría',
      summary: 'Sistema documentado, trazable y con controles operativos de calidad.',
    };
  }
  if (pct < 88) {
    return {
      level: 'Nivel 3',
      label: 'Integrado / Digitalizado',
      summary: 'SGC integrado a la plataforma operativa y a los flujos BIM ISO 19650.',
    };
  }
  return {
    level: 'Nivel 4',
    label: 'Optimizado / Excelencia',
    summary: 'Cultura de mejora continua predictiva e innovación basada en datos.',
  };
}
