/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ContentBlockType =
  | 'paragraph'
  | 'subheading'
  | 'table'
  | 'list'
  | 'callout'
  | 'signatures';

export interface ParagraphBlock {
  id: string;
  type: 'paragraph';
  text: string;
}

export interface SubheadingBlock {
  id: string;
  type: 'subheading';
  text: string;
}

export interface TableBlock {
  id: string;
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ListItem {
  id: string;
  lead: string; // Bold lead text (optional)
  text: string;
}

export interface ListBlock {
  id: string;
  type: 'list';
  ordered: boolean;
  items: ListItem[];
}

export interface CalloutBlock {
  id: string;
  type: 'callout';
  title: string;
  text: string;
}

export interface SignatureEntry {
  id: string;
  name: string;
  role: string;
  organization: string;
  datePlaceholder: string;
}

export interface SignaturesBlock {
  id: string;
  type: 'signatures';
  entries: SignatureEntry[];
}

export type ContentBlock =
  | ParagraphBlock
  | SubheadingBlock
  | TableBlock
  | ListBlock
  | CalloutBlock
  | SignaturesBlock;

export interface DocumentModule {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface MasterPlanMetadata {
  title: string;
  code: string;
  version: string;
  issueDate: string;
  organization: string;
  normativeFramework: string;
  author: string;
}

export interface MasterPlanDocument {
  metadata: MasterPlanMetadata;
  modules: DocumentModule[];
}

export interface ImplementationTabDef {
  id: string;
  code: string;
  stepNumber: number;
  shortTitle: string;
  fullTitle: string;
  deliverableCode: string;
  deliverableName: string;
  weeks: string;
  predecessors: string;
  completionCriteria: string;
  activityDescription: string;
  status: 'active' | 'planned';
  plannedSubmodules: string[];
}

export const IMPLEMENTATION_TABS: ImplementationTabDef[] = [
  {
    id: 'act-01',
    code: 'ACT-01',
    stepNumber: 1,
    shortTitle: 'Plan Maestro BIM',
    fullTitle: 'Documento Maestro del Plan de Implementación BIM',
    deliverableCode: 'ME-BIM-PLA-001',
    deliverableName: 'Documento Maestro (PDF) + Cronograma Gantt',
    weeks: 'Sem 1 – 2',
    predecessors: 'Ninguna',
    completionCriteria: 'Aprobado formalmente por la gerencia de Mesh Estudio.',
    activityDescription:
      'Redactar el Documento Maestro del Plan de Implementación BIM y cronograma Gantt.',
    status: 'active',
    plannedSubmodules: [
      'Control de versiones y metadatos ISO 19650',
      'Línea base diagnóstica y objetivos',
      'Gobernanza, hoja de ruta, KPIs, riesgos y firmas',
    ],
  },
  {
    id: 'act-02',
    code: 'ACT-02',
    stepNumber: 2,
    shortTitle: 'Capacidad Física',
    fullTitle: 'Inventario de Estaciones y Presupuesto Hardware',
    deliverableCode: 'ME-BIM-TEC-001',
    deliverableName: 'Ficha de Inventario Técnico + Presupuesto de Upgrades (.xlsx)',
    weeks: 'Sem 3 – 4',
    predecessors: 'ACT-01',
    completionCriteria: 'Presupuesto validado y especificaciones mínimas por rol asignadas.',
    activityDescription:
      'Levantar inventario de estaciones y elaborar presupuesto de actualización hardware.',
    status: 'planned',
    plannedSubmodules: [
      'Catálogo de especificaciones mínimas por rol (Modelador, Coordinador, Render)',
      'Inventario actual de estaciones de trabajo en Mesh Estudio',
      'Matriz presupuestal de actualización y prioridades de compra',
    ],
  },
  {
    id: 'act-03',
    code: 'ACT-03',
    stepNumber: 3,
    shortTitle: 'Conectividad & CDE',
    fullTitle: 'Enlace Corporativo y Sincronización CDE en Red Local',
    deliverableCode: 'ME-BIM-TEC-002',
    deliverableName: 'Informe Técnico de Red/Latencia + Terminales Sincronizadas',
    weeks: 'Sem 5 – 6',
    predecessors: 'ACT-02',
    completionCriteria: 'Cero fallas de sincronización local/nube en pruebas de carga.',
    activityDescription:
      'Gestionar enlace corporativo y configurar sincronización CDE en red local.',
    status: 'planned',
    plannedSubmodules: [
      'Diagnóstico de enlace corporativo y latencia de red',
      'Arquitectura de sincronización local / nube del CDE',
      'Protocolo de pruebas de carga y respaldo automático',
    ],
  },
  {
    id: 'act-04',
    code: 'ACT-04',
    stepNumber: 4,
    shortTitle: 'Contenedor de Datos',
    fullTitle: 'Manual de Nomenclatura ISO 19650 y Árbol de Carpetas CDE',
    deliverableCode: 'ME-BIM-MAN-001',
    deliverableName: 'Manual de Codificación (PDF) + Árbol CDE (WIP, Shared, Published)',
    weeks: 'Sem 7 – 9',
    predecessors: 'ACT-03',
    completionCriteria: 'Estructura montada en la nube con permisos por rol activos.',
    activityDescription:
      'Elaborar Manual de Nomenclatura ISO 19650 y estructura de carpetas en el CDE.',
    status: 'planned',
    plannedSubmodules: [
      'Generador interactivo de nomenclatura de contenedores ISO 19650',
      'Árbol estándar de carpetas WIP / Shared / Published / Archived',
      'Matriz de permisos de acceso y estados de revisión (S0–S4, A1–A4)',
    ],
  },
  {
    id: 'act-05',
    code: 'ACT-05',
    stepNumber: 5,
    shortTitle: 'Modelado & LOIN',
    fullTitle: 'Guía Estándar de Modelado 3D y Matriz LOD/LOIN',
    deliverableCode: 'ME-BIM-GUI-001',
    deliverableName: 'Manual de Modelado 3D (PDF) + Matriz LOD/LOIN (ME-BIM-MAT-001)',
    weeks: 'Sem 10 – 13',
    predecessors: 'ACT-04',
    completionCriteria: 'Reglas de navegación, ejes, niveles y parámetros base definidas.',
    activityDescription:
      'Escribir Guía Estándar de Modelado 3D y crear Matriz de Información LOD/LOIN.',
    status: 'planned',
    plannedSubmodules: [
      'Guía de coordenadas, niveles, ejes y criterios geométricos',
      'Matriz de Nivel de Necesidad de Información (LOIN / LOD)',
      'Estándar de parámetros compartidos y familias base',
    ],
  },
  {
    id: 'act-06',
    code: 'ACT-06',
    stepNumber: 6,
    shortTitle: 'Interoperabilidad IFC',
    fullTitle: 'Plantillas de Mapeo IFC (OpenBIM) y Exportación',
    deliverableCode: 'ME-BIM-GUI-002',
    deliverableName: 'Plantillas Mapeo (.txt/.xml) + Guía de Exportación IFC (PDF)',
    weeks: 'Sem 14 – 15',
    predecessors: 'ACT-05',
    completionCriteria: 'Archivo IFC federado y verificado en visor OpenBIM sin pérdida de Psets.',
    activityDescription:
      'Configurar plantillas de mapeo IFC (OpenBIM) y validar exportación de datos.',
    status: 'planned',
    plannedSubmodules: [
      'Tabla de mapeo de categorías a clases IFC2x3 / IFC4',
      'Definición de Property Sets (Psets) obligatorios',
      'Checklist de validación en visor OpenBIM federado',
    ],
  },
  {
    id: 'act-07',
    code: 'ACT-07',
    stepNumber: 7,
    shortTitle: 'Caracterización & QA/QC',
    fullTitle: 'Caracterización de Procesos, Kit QA/QC y Protocolo de Coordinación',
    deliverableCode: 'ME-BIM-CAR-001',
    deliverableName: 'Ficha Caracterización + Kit QA/QC (ME-BIM-FOR-001) + Protocolo Coordinación (ME-BIM-PRO-001)',
    weeks: 'Sem 16 – 18',
    predecessors: 'ACT-05, ACT-06',
    completionCriteria: 'Fichas de caracterización, listas QA/QC y protocolo probados en modelo testigo.',
    activityDescription:
      'Caracterizar los procesos/productos BIM según tipología de cliente y diseñar herramientas QA, QC y Protocolo de Coordinación de Modelos.',
    status: 'planned',
    plannedSubmodules: [
      'Caracterización de procesos y productos por tipología de cliente',
      'Herramientas de aseguramiento preventivo (QA) durante la producción',
      'Listas de control de conformidad (QC) sobre entregable final',
      'Protocolo integral de Coordinación de Modelos interdisciplinares',
    ],
  },
  {
    id: 'act-08',
    code: 'ACT-08',
    stepNumber: 8,
    shortTitle: 'Plantilla BEP',
    fullTitle: 'Plantilla Institucional Modular Pre-BEP y Post-BEP',
    deliverableCode: 'ME-BIM-PLA-002',
    deliverableName: 'Plantilla Institucional Editable de BEP (.docx / PDF)',
    weeks: 'Sem 19 – 21',
    predecessors: 'ACT-04, ACT-05, ACT-07',
    completionCriteria: 'Documento estandarizado que integra CDE, LOIN, roles y flujo QA/QC.',
    activityDescription:
      'Redactar plantilla institucional modular del Plan de Ejecución BIM (Pre-BEP y Post-BEP) adaptable por perfil de cliente.',
    status: 'planned',
    plannedSubmodules: [
      'Constructor modular de Pre-BEP para propuestas comerciales',
      'Constructor de Post-BEP para proyectos adjudicados',
      'Integración de anexos CDE, LOIN, roles RACI y QA/QC',
    ],
  },
  {
    id: 'act-09',
    code: 'ACT-09',
    stepNumber: 9,
    shortTitle: 'Anexo Contractual',
    fullTitle: 'Anexo Contractual Técnico BIM y Propiedad Intelectual',
    deliverableCode: 'ME-BIM-LEG-001',
    deliverableName: 'Modelo de Anexo Contractual Técnico (.docx / PDF)',
    weeks: 'Sem 22',
    predecessors: 'ACT-08',
    completionCriteria: 'Cláusulas de entregables, derechos de autor y resolución de conflictos listas.',
    activityDescription:
      'Redactar Anexo Contractual Técnico BIM y Matriz de Riesgos/Propiedad Intelectual.',
    status: 'planned',
    plannedSubmodules: [
      'Clausulado estándar de entregables digitales y usos autorizados',
      'Propiedad intelectual, licenciamiento y límites de responsabilidad',
      'Matriz de riesgos jurídicos para clientes y subconsultores',
    ],
  },
  {
    id: 'act-10',
    code: 'ACT-10',
    stepNumber: 10,
    shortTitle: 'Coordinación ICE & BCF',
    fullTitle: 'Protocolo de Comunicación Interdisciplinar, ICE y BCF',
    deliverableCode: 'ME-BIM-PRO-002',
    deliverableName: 'Protocolo de Coordinación BCF (PDF) + Acta de Simulación ICE',
    weeks: 'Sem 22 – 24',
    predecessors: 'ACT-07, ACT-08',
    completionCriteria: 'Prueba piloto de asignación, resolución y cierre de incidencias BCF en la nube.',
    activityDescription:
      'Estructurar el flujo de comunicación interdisciplinar, reuniones ICE y trazabilidad de incidencias BCF en la nube.',
    status: 'planned',
    plannedSubmodules: [
      'Flujo de creación, asignación y cierre de incidencias BCF',
      'Formato de minuta técnica para sesiones ICE',
      'Registro de prueba piloto y métricas de resolución',
    ],
  },
];

export const INITIAL_MASTER_PLAN: MasterPlanDocument = {
  metadata: {
    title: 'PLAN MAESTRO DE IMPLEMENTACIÓN BIM (ISO 19650)',
    code: 'ME-BIM-PLA-001',
    version: '1.0 (Borrador para Aprobación Gerencial)',
    issueDate: '25 de noviembre de 2026',
    organization: 'Mesh Estudio',
    normativeFramework:
      'NTC-ISO 19650-1, NTC-ISO 19650-2, Guía BIM Forum, Modelo de Madurez Bilal Succar',
    author: 'Camilo Martínez – Líder de Implementación BIM & Auditor SGC',
  },
  modules: [
    {
      id: 'mod-1',
      title: 'Control de Versiones y Aprobación',
      blocks: [
        {
          id: 'blk-1-1',
          type: 'table',
          headers: ['Versión', 'Fecha', 'Descripción del Cambio', 'Elaboró', 'Revisó', 'Aprobó'],
          rows: [
            [
              '0.1',
              '08/10/2026',
              'Diagnóstico base Matriz de Madurez ISO 19650',
              'C. Martínez',
              'Comité BIM',
              'Dirección General',
            ],
            [
              '1.0',
              '25/11/2026',
              'Emisión oficial del Plan Maestro de Implementación',
              'C. Martínez',
              'Dirección Técnica',
              'Dirección General',
            ],
          ],
        },
      ],
    },
    {
      id: 'mod-2',
      title: 'Introducción y Propósito del Documento',
      blocks: [
        {
          id: 'blk-2-1',
          type: 'paragraph',
          text: 'El presente Documento Maestro establece la hoja de ruta estratégica, técnica y operativa para la transformación digital y estandarización de procesos bajo metodología **Building Information Modeling (BIM)** en **Mesh Estudio**. Dado que el estudio desarrolla soluciones a la medida según los requerimientos particulares de cada cliente, su propósito es articular la **caracterización de procesos y productos** con los estándares internacionales **ISO 19650**, garantizando la trazabilidad de la información, la interoperabilidad entre disciplinas y la integración con el Sistema de Gestión de Calidad (ISO 9001).',
        },
      ],
    },
    {
      id: 'mod-3',
      title: 'Línea Base: Diagnóstico de Madurez Organizacional',
      blocks: [
        {
          id: 'blk-3-1',
          type: 'paragraph',
          text: 'El **8 de octubre de 2026** se realizó la auditoría diagnóstica de madurez BIM bajo el modelo de 33 dimensiones de Bilal Succar (escala Nivel 0 a Nivel 4), arrojando una calificación global de **Nivel 1: Definido ("Corporación Modelado en Silo")**, con un puntaje de **30 / 132 puntos (23%)** y un promedio ponderado de **0.91 / 4.0**.',
        },
        {
          id: 'blk-3-2',
          type: 'subheading',
          text: '3.1. Desempeño Actual por Vector Corporativo',
        },
        {
          id: 'blk-3-3',
          type: 'table',
          headers: [
            'Vector / Pilar Evaluado',
            'Puntaje Obtenido',
            'Puntaje Máximo',
            'Cumplimiento Actual',
            'Umbral Meta (Nivel 2)',
            'Brecha a Cerrar',
            'Diagnóstico Síntesis',
          ],
          rows: [
            [
              '01. Tecnología',
              '9',
              '36',
              '25%',
              '58%',
              '+33%',
              'Buen dominio de software de autoría (N2), pero fallas críticas en interoperabilidad IFC, red y renovación de hardware.',
            ],
            [
              '02. Procesos',
              '11',
              '36',
              '31%',
              '56%',
              '+25%',
              'Alta visión e innovación directiva (N3), pero ausencia de estrategia formal y resistencia al trabajo colaborativo (N0).',
            ],
            [
              '03. Políticas',
              '2',
              '28',
              '7%',
              '50%',
              '+43%',
              'Vector más crítico: inexistencia de manuales de modelado, protocolos ISO 19650, esquemas QA/QC y anexos contractuales.',
            ],
            [
              '04. Capacidad BIM',
              '6',
              '20',
              '30%',
              '55%',
              '+25%',
              'Excelente capacidad de modelado individual basado en objetos (N3), pero coordinación en red sin protocolos (N0).',
            ],
            [
              '05. Escala',
              '2',
              '12',
              '17%',
              '42%',
              '+25%',
              'Liderazgo BIM identificado (N1), con oportunidad de mejora en estandarización multiproyecto y bibliotecas de mercado.',
            ],
          ],
        },
        {
          id: 'blk-3-4',
          type: 'subheading',
          text: '3.2. Distribución de Dimensiones Auditadas',
        },
        {
          id: 'blk-3-5',
          type: 'list',
          ordered: false,
          items: [
            {
              id: 'li-3-1',
              lead: 'Nivel 0 (Inicial):',
              text: '12 dimensiones (36%) – Brechas críticas que requieren intervención inmediata.',
            },
            {
              id: 'li-3-2',
              lead: 'Nivel 1 (Definido):',
              text: '15 dimensiones (45%) – Capacidades operativas básicas sin formalización documental.',
            },
            {
              id: 'li-3-3',
              lead: 'Nivel 2 (Gestionado):',
              text: '3 dimensiones (9%) – Selección de Software, Modelos 3D y Gestión de Información.',
            },
            {
              id: 'li-3-4',
              lead: 'Nivel 3 (Integrado):',
              text: '3 dimensiones (9%) – Visión Corporativa, Innovación Corporativa y Modelado Basado en Objetos.',
            },
            {
              id: 'li-3-5',
              lead: 'Nivel 4 (Optimizado):',
              text: '0 dimensiones (0%).',
            },
          ],
        },
        {
          id: 'blk-3-6',
          type: 'callout',
          title: 'Dictamen Técnico de Línea Base',
          text: 'Mesh Estudio cuenta con herramientas de modelado y talento técnico operando a alto nivel individual, pero en silos aislados. La prioridad institucional es transitar de un modelo dependiente del esfuerzo individual hacia un sistema estandarizado soportado en la caracterización de sus flujos, un Entorno Común de Datos (CDE), manuales de modelado y herramientas formales de aseguramiento y control de calidad.',
        },
      ],
    },
    {
      id: 'mod-4',
      title: 'Objetivos y Alcance de la Implementación',
      blocks: [
        {
          id: 'blk-4-1',
          type: 'subheading',
          text: '4.1. Objetivo General',
        },
        {
          id: 'blk-4-2',
          type: 'paragraph',
          text: 'Elevar el índice de madurez BIM de Mesh Estudio desde el **23% actual (Nivel 1: Definido)** hasta un mínimo del **54% (Nivel 2: Gestionado – 71/132 puntos)** en un horizonte de **24 semanas**, eliminando el 100% de las brechas críticas ubicadas en Nivel 0.',
        },
        {
          id: 'blk-4-3',
          type: 'subheading',
          text: '4.2. Objetivos Específicos',
        },
        {
          id: 'blk-4-4',
          type: 'list',
          ordered: true,
          items: [
            {
              id: 'li-4-1',
              lead: 'Gobernanza y Estándares:',
              text: 'Formalizar la documentación normativa interna bajo ISO 19650 (Manual de Nomenclatura, Guía de Modelado 3D, Matriz LOD/LOIN y Plantilla BEP institucional).',
            },
            {
              id: 'li-4-2',
              lead: 'Infraestructura y CDE:',
              text: 'Establecer la estructura organizativa del Entorno Común de Datos con conectividad garantizada y plan de actualización de estaciones de trabajo por rol.',
            },
            {
              id: 'li-4-3',
              lead: 'Caracterización, Interoperabilidad y Calidad (QA/QC):',
              text: 'Caracterizar los procesos y tipologías de servicio de la firma, estandarizar los flujos de exportación OpenBIM (IFC/BCF) e instaurar herramientas de QA (aseguramiento durante la ejecución) y QC (verificación de conformidad sobre el producto final).',
            },
            {
              id: 'li-4-4',
              lead: 'Respaldo Contractual y Colaboración:',
              text: 'Blindar jurídicamente los entregables digitales y migrar la coordinación interdisciplinar hacia protocolos estructurados con trazabilidad en la nube.',
            },
          ],
        },
        {
          id: 'blk-4-5',
          type: 'subheading',
          text: '4.3. Alcance',
        },
        {
          id: 'blk-4-6',
          type: 'list',
          ordered: false,
          items: [
            {
              id: 'li-4-5',
              lead: 'Aplica a:',
              text: 'Todos los proyectos de diseño arquitectónico, coordinación técnica y consultoría desarrollados por Mesh Estudio (nuevos proyectos desde su fase de inicio y proyectos en curso definidos por el Comité BIM).',
            },
            {
              id: 'li-4-6',
              lead: 'Involucra a:',
              text: 'Dirección General, Dirección Técnica, Líder de Implementación BIM & Auditor SGC, Coordinadores BIM, Arquitectos Proyectistas, Modeladores y Subconsultores externos.',
            },
          ],
        },
      ],
    },
    {
      id: 'mod-5',
      title: 'Estructura de Gobernanza y Roles BIM',
      blocks: [
        {
          id: 'blk-5-1',
          type: 'paragraph',
          text: 'Para garantizar la ejecución sin fricciones operativas, se formalizan los siguientes roles dentro de la estructura del estudio:',
        },
        {
          id: 'blk-5-2',
          type: 'table',
          headers: [
            'Rol Organizacional',
            'Responsable Asignado',
            'Responsabilidades Clave en la Implementación',
          ],
          rows: [
            [
              'Sponsor Ejecutivo',
              'Dirección General',
              'Aprobar el Plan Maestro, autorizar presupuestos de hardware/software y exigir el cumplimiento contractual del BEP.',
            ],
            [
              'Líder de Implementación BIM & Auditor SGC',
              'Camilo Martínez',
              'Liderar la caracterización de procesos, diseñar estándares, estructurar el CDE, capacitar al equipo, auditar madurez y reportar KPIs.',
            ],
            [
              'Coordinadores BIM / Líderes de Proyecto',
              'Líderes de Arquitectura',
              'Aplicar el BEP según la caracterización de cada cliente, ejecutar herramientas QA/QC y liderar la coordinación de modelos.',
            ],
            [
              'Equipo de Producción / Modeladores',
              'Arquitectos y Modeladores',
              'Modelar estrictamente bajo la Guía Estándar y Matriz LOD/LOIN, aplicando controles preventivos QA y nomenclaturas del CDE.',
            ],
          ],
        },
      ],
    },
    {
      id: 'mod-6',
      title: 'Hoja de Ruta Secuencial (Plan de 10 Actividades – 24 Semanas)',
      blocks: [
        {
          id: 'blk-6-1',
          type: 'paragraph',
          text: 'El despliegue se ejecutará en **24 semanas** bajo una secuencia lógica estricta de dependencias (predecesoras obligatorias) para evitar reprocesos o pausas operativas:',
        },
        {
          id: 'blk-6-2',
          type: 'table',
          headers: ['Cód.', 'Actividad Puntual', 'Predecesora', 'Semanas', 'Entregable Tangible'],
          rows: [
            [
              'ACT-01',
              'Redactar el Documento Maestro del Plan de Implementación BIM y cronograma Gantt.',
              'Ninguna',
              'Sem 1 – 2',
              'ME-BIM-PLA-001 (PDF) + Gantt',
            ],
            [
              'ACT-02',
              'Levantar inventario de estaciones y elaborar presupuesto de actualización hardware.',
              'ACT-01',
              'Sem 3 – 4',
              'ME-BIM-TEC-001 (Inventario/Presupuesto)',
            ],
            [
              'ACT-03',
              'Gestionar enlace corporativo y configurar sincronización CDE en red local.',
              'ACT-02',
              'Sem 5 – 6',
              'Informe técnico red + Terminales conectadas',
            ],
            [
              'ACT-04',
              'Elaborar Manual de Nomenclatura ISO 19650 y estructura de carpetas en el CDE.',
              'ACT-03',
              'Sem 7 – 9',
              'ME-BIM-MAN-001 + Árbol CDE activo',
            ],
            [
              'ACT-05',
              'Escribir Guía Estándar de Modelado 3D y crear Matriz de Información LOD/LOIN.',
              'ACT-04',
              'Sem 10 – 13',
              'ME-BIM-GUI-001 + ME-BIM-MAT-001',
            ],
            [
              'ACT-06',
              'Configurar plantillas de mapeo IFC (OpenBIM) y validar exportación de datos.',
              'ACT-05',
              'Sem 14 – 15',
              'Plantillas mapeo (.txt/.xml) + ME-BIM-GUI-002',
            ],
            [
              'ACT-07',
              'Caracterizar los procesos/productos BIM según tipología de cliente y diseñar las herramientas de QA (aseguramiento durante la producción), QC (control de conformidad del entregable) y el Protocolo de Coordinación de Modelos.',
              'ACT-05, 06',
              'Sem 16 – 18',
              'ME-BIM-CAR-001 (Ficha Caracterización) + ME-BIM-FOR-001 (Kit QA/QC) + ME-BIM-PRO-001 (Protocolo Coordinación)',
            ],
            [
              'ACT-08',
              'Redactar plantilla institucional modular del Plan de Ejecución BIM (Pre-BEP y Post-BEP) adaptable por perfil de cliente.',
              'ACT-04, 05, 07',
              'Sem 19 – 21',
              'ME-BIM-PLA-002 (Plantilla BEP editable)',
            ],
            [
              'ACT-09',
              'Redactar Anexo Contractual Técnico BIM y Matriz de Riesgos/Propiedad Intelectual.',
              'ACT-08',
              'Sem 22',
              'ME-BIM-LEG-001 (Anexo Contractual)',
            ],
            [
              'ACT-10',
              'Estructurar el flujo de comunicación interdisciplinar, reuniones ICE y trazabilidad de incidencias BCF en la nube.',
              'ACT-07, 08',
              'Sem 22 – 24',
              'ME-BIM-PRO-002 + Acta simulación BCF',
            ],
          ],
        },
      ],
    },
    {
      id: 'mod-7',
      title: 'Indicadores Clave de Desempeño (KPIs) y Seguimiento',
      blocks: [
        {
          id: 'blk-7-1',
          type: 'paragraph',
          text: 'El Comité BIM evaluará el avance mediante los siguientes indicadores verificables:',
        },
        {
          id: 'blk-7-2',
          type: 'table',
          headers: [
            'Indicador (KPI)',
            'Fórmula / Criterio de Medición',
            'Línea Base (Oct 2026)',
            'Meta Cierre (Sem 24)',
            'Frecuencia',
          ],
          rows: [
            [
              'Índice Global de Madurez BIM',
              'Puntaje obtenido en Matriz Succar / 132 pts',
              '23% (30 pts)',
              '≥ 54% (71 pts)',
              'Bimestral',
            ],
            [
              'Cierre de Brechas Críticas (N0)',
              'N° dimensiones en Nivel 0 migradas a Nivel 2',
              '12 dims en N0',
              '0 dims críticas en N0',
              'Mensual',
            ],
            [
              'Caracterización y Esquema QA/QC',
              'Avance en formalización de fichas de caracterización, herramientas preventivas QA, verificación QC y Protocolo de Coordinación',
              '0%',
              '100% (Aprobado)',
              'Mensual',
            ],
            [
              'Elaboración de BEP Estándar para Proyectos',
              'Avance de construcción y validación de la plantilla institucional modular Pre-BEP / Post-BEP',
              '0%',
              '100% (Plantilla aprobada)',
              'Mensual',
            ],
            [
              'Aplicación de Organización del CDE',
              '% de cumplimiento en aplicación de estructura de carpetas y nomenclaturas ISO 19650',
              '0%',
              '100%',
              'Quincenal',
            ],
          ],
        },
      ],
    },
    {
      id: 'mod-8',
      title: 'Gestión de Riesgos de la Implementación',
      blocks: [
        {
          id: 'blk-8-1',
          type: 'table',
          headers: ['Riesgo Identificado', 'Probabilidad', 'Impacto', 'Estrategia de Mitigación'],
          rows: [
            [
              'Resistencia al cambio del equipo técnico',
              'Alta',
              'Alto',
              'Involucrar a los líderes de proyecto en la validación de guías (ACT-05) y realizar sesiones prácticas de simulación (ACT-10).',
            ],
            [
              'Variabilidad de alcance por requerimientos particulares de cada cliente',
              'Alta',
              'Alto',
              'Ejecutar la caracterización de procesos y productos (ACT-07) para contar con flujos y plantillas modulares adaptables sin improvisación.',
            ],
            [
              'Sobrecarga operativa en proyectos activos',
              'Media',
              'Alto',
              'Asignar espacios protegidos de dedicación al Comité BIM para redacción y pruebas sin afectar entregas críticas de proyectos.',
            ],
            [
              'Cuellos de botella por hardware o red',
              'Media',
              'Medio',
              'Ejecutar el diagnóstico de equipos y conectividad en las primeras etapas (ACT-02 y ACT-03) antes del despliegue masivo.',
            ],
            [
              'Incumplimiento de subconsultores externos',
              'Media',
              'Alto',
              'Incorporar obligatoriamente el Anexo Contractual BIM (ACT-09) y el Pre-BEP en toda nueva contratación externa.',
            ],
          ],
        },
      ],
    },
    {
      id: 'mod-9',
      title: 'Firmas de Aprobación y Compromiso Institucional',
      blocks: [
        {
          id: 'blk-9-1',
          type: 'paragraph',
          text: 'Con la suscripción del presente documento, la Dirección de Mesh Estudio aprueba el inicio oficial del Plan de Implementación BIM ISO 19650 y autoriza la ejecución de las actividades establecidas en la hoja de ruta.',
        },
        {
          id: 'blk-9-2',
          type: 'signatures',
          entries: [
            {
              id: 'sig-1',
              name: 'Dirección General',
              role: 'Aprobación Ejecutiva',
              organization: 'Mesh Estudio',
              datePlaceholder: 'Fecha: ____ / ____ / 2026',
            },
            {
              id: 'sig-2',
              name: 'Camilo Martínez',
              role: 'Líder de Implementación BIM & Auditor SGC',
              organization: 'Mesh Estudio',
              datePlaceholder: 'Fecha: ____ / ____ / 2026',
            },
          ],
        },
      ],
    },
  ],
};

export function createNewBlock(type: ContentBlockType): ContentBlock {
  const uid = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  switch (type) {
    case 'paragraph':
      return {
        id: uid,
        type: 'paragraph',
        text: 'Escriba aquí el contenido del párrafo. Puede resaltar conceptos clave usando **doble asterisco**.',
      };
    case 'subheading':
      return {
        id: uid,
        type: 'subheading',
        text: 'Subsección técnica',
      };
    case 'table':
      return {
        id: uid,
        type: 'table',
        headers: ['Columna 1', 'Columna 2', 'Columna 3'],
        rows: [
          ['Elemento 1', 'Descripción', 'Responsable'],
          ['Elemento 2', 'Descripción', 'Responsable'],
        ],
      };
    case 'list':
      return {
        id: uid,
        type: 'list',
        ordered: false,
        items: [
          {
            id: `li-${Date.now()}-1`,
            lead: 'Punto clave:',
            text: 'Descripción detallada del criterio o requerimiento.',
          },
        ],
      };
    case 'callout':
      return {
        id: uid,
        type: 'callout',
        title: 'Nota Técnica / Dictamen',
        text: 'Resumen ejecutivo o directriz obligatoria aplicable a este módulo.',
      };
    case 'signatures':
      return {
        id: uid,
        type: 'signatures',
        entries: [
          {
            id: `sig-${Date.now()}-1`,
            name: 'Nombre del Firmante',
            role: 'Cargo / Rol BIM',
            organization: 'Mesh Estudio',
            datePlaceholder: 'Fecha: ____ / ____ / 2026',
          },
        ],
      };
  }
}

export function createNewModule(
  title: string,
  template: 'text' | 'table' | 'list' | 'mixed' | 'signatures'
): DocumentModule {
  const modId = `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  switch (template) {
    case 'table':
      return {
        id: modId,
        title,
        blocks: [createNewBlock('paragraph'), createNewBlock('table')],
      };
    case 'list':
      return {
        id: modId,
        title,
        blocks: [createNewBlock('paragraph'), createNewBlock('list')],
      };
    case 'mixed':
      return {
        id: modId,
        title,
        blocks: [
          createNewBlock('paragraph'),
          createNewBlock('table'),
          createNewBlock('callout'),
        ],
      };
    case 'signatures':
      return {
        id: modId,
        title,
        blocks: [createNewBlock('paragraph'), createNewBlock('signatures')],
      };
    case 'text':
    default:
      return {
        id: modId,
        title,
        blocks: [createNewBlock('paragraph')],
      };
  }
}
