import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Award,
  Check,
  TrendingUp,
  Compass,
  Cpu,
  Layers,
  FileText,
  CloudUpload,
  FolderOpen,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertTriangle,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  listDriveAssessments,
  createDriveAssessment,
  updateDriveAssessment,
  loadDriveAssessment,
  deleteDriveAssessment,
  TARGET_DRIVE_FOLDER_ID,
  TARGET_DRIVE_FOLDER_URL,
  type DriveAssessmentFile,
  type SavedBimAssessmentPayload,
} from '../lib/googleDrive';

interface Dimension {
  id: string;
  category: 'tecnologia' | 'procesos' | 'politicas' | 'capacidad' | 'escala';
  name: string;
  icon: string;
  description: string;
  levels: {
    title: string;
    description: string;
    color: string;
    bg: string;
    border: string;
  }[];
}

const DIMENSIONS: Dimension[] = [
  // --- TECNOLOGÍA (9 filas) ---
  {
    id: 'sw_seleccion',
    category: 'tecnologia',
    name: 'Software: Selección y Uso',
    icon: '💻',
    description: 'Gestión del software, herramientas de modelado y selección funcional.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No existen criterios funcionales para el uso y selección del software.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'El equipo está de acuerdo en utilizar las mismas herramientas para todo el proceso.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'La selección de software y su uso se controla y gestiona de acuerdo con los entregables definidos.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'La selección e implementación de software sigue objetivos estratégicos, no sólo necesidades operacionales.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'La selección / uso de herramientas de software se revisa continuamente para mejorar la productividad y se alinea con los objetivos estratégicos.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'sw_modelos',
    category: 'tecnologia',
    name: 'Software: Modelos 3D',
    icon: '📐',
    description: 'Uso de modelos 3D y su propósito principal de generación de entregables.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los Modelos 3D se usan como base para generar principalmente representaciones 2D / entregables precisos.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Los Modelos 3D se utilizan como base para generar tanto entregables 2D como 3D (por ejemplo para visualización).', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los modelos son la base para las vistas 3D, representaciones 2D, cuantificación, especificación y estudios analíticos.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los entregables del modelado están bien sincronizados a través de proyectos y estrechamente integrados con los procesos de negocio.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los entregables del modelado se revisan / optimizan cíclicamente para beneficiarse de las nuevas funcionalidades y extensiones disponibles de software.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'sw_gestion',
    category: 'tecnologia',
    name: 'Software: Gestión de Información',
    icon: '📁',
    description: 'Definición, control y monitoreo del uso y almacenamiento de información.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'El uso, almacenamiento e intercambio de información no se definen dentro de las organizaciones o equipos de proyectos.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'El uso, almacenamiento e intercambio de información están bien definidos dentro de las organizaciones y equipos de proyecto.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'El uso, almacenamiento e intercambio de información son monitoreados y controlados.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'El uso, almacenamiento e intercambio de información: son interoperables, sigue un estándar y se llevan a cabo como parte de una estrategia global de la organización o equipo de proyecto.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Todos los asuntos relacionados con el almacenamiento y uso de información interoperables están documentados, controlados, evaluados y mejorados de forma proactiva.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'sw_intercambios',
    category: 'tecnologia',
    name: 'Software: Intercambios e Interoperabilidad',
    icon: '🔄',
    description: 'Nivel de compatibilidad, flujo de datos y control de interoperabilidad.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los intercambios de información sufren de una falta grave de interoperabilidad.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Los intercambios de información interoperables están definidos y priorizados.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'El flujo de datos está documentado y bien gestionado. Los intercambios de información interoperables son obligatorios y se controlan con rigor.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los flujos de información se llevan a cabo como parte de una estrategia global de la organización o equipo de proyecto.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Todos los asuntos relacionados con intercambio de información interoperables están documentados, controlados, evaluados y mejorados de forma proactiva.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'hw_equipamiento',
    category: 'tecnologia',
    name: 'Hardware: Equipamiento',
    icon: '🖥️',
    description: 'Estaciones de trabajo, servidores e inventariado tecnológico.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los equipos son inadecuados; las especificaciones son demasiado bajas, inconsistentes en toda la organización y se desconoce de los requerimientos de hardware.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Las especificaciones de los equipos -Son adecuados de acuerdo al alcance BIM de la organización - se definen, presupuestan y estandarizan.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Se dispone de una estrategia para documentar, gestionar y mantener el inventario de los equipos con transparencia.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'La selección adecuada del hardware se considera indispensable para el cumplimiento de tareas según el rol orientado a la optimización del desempeño BIM.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los equipos existentes y las soluciones innovadoras se prueban, actualizan y despliegan continuamente.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'hw_actualizacion',
    category: 'tecnologia',
    name: 'Hardware: Inversión y Actualización',
    icon: '⚡',
    description: 'Sustitución, presupuestación y alineación financiera del hardware.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'La sustitución o mejora de equipos se considera un costo y sólo se realiza cuando es inevitable.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Las sustituciones y actualizaciones de hardware están integradas y bien definidas en el presupuesto de la organización.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'La inversión en hardware está bien orientada y definida a los roles del equipo de trabajo para mejorar y ampliar la productividad.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'La inversión en equipos se integra perfectamente con los planes financieros, estrategias de negocio y los objetivos de desempeño.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'El hardware se convierte en parte de la ventaja competitiva de la organización o del equipo de proyecto.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'red_infraestructura',
    category: 'tecnologia',
    name: 'Red: Soluciones de Red y CDE',
    icon: '🌐',
    description: 'Gestión centralizada del Entorno Común de Datos (CDE) e intercambio de datos.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Las soluciones de red no existen o carecen de una gestión centralizada.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se identifican soluciones de red para compartir información y controlar su acceso tanto interno como entre organizaciones.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Las soluciones de red para recopilar, almacenar y compartir el conocimiento interno y entre organizaciones se gestionan bien a través de plataformas comunes (por ejemplo: intranets o extranets).', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Las soluciones de red permiten la integración de múltiples facetas del proceso BIM a través del intercambio en tiempo real continuo de datos, información y conocimientos.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Las soluciones de red se evalúan continuamente y se sustituyen por las últimas innovaciones probadas.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'red_canales',
    category: 'tecnologia',
    name: 'Red: Canales de Comunicación',
    icon: '💬',
    description: 'Herramientas de comunicación, intercambio y soporte por protocolo.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Profesionales, organizaciones (en la misma ubicación o dispersos) y equipos de proyecto usan cualquier herramienta para comunicarse o compartir datos y el proceso no está soportado por un protocolo.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'A nivel de proyecto, los integrantes identifican sus requerimientos para compartir datos/información.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Se despliegan herramientas de gestión de contenidos y activos para regular los datos estructurados y no estructurados compartidos a través de conexiones de banda ancha.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Las soluciones incluyen redes / portales específicos del proyecto que permiten el intercambio de datos intensivos (intercambio) interoperable entre las partes interesadas.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Las redes facilitan adquirir, almacenar y compartir conocimientos entre todas las partes interesadas.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'red_conectividad',
    category: 'tecnologia',
    name: 'Red: Ancho de Banda y Conectividad',
    icon: '📡',
    description: 'Velocidad de conexión y monitoreo de la infraestructura de comunicación.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Las partes interesadas carecen de la infraestructura de red necesaria para recopilar, almacenar y compartir conocimientos.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Las organizaciones y equipos de proyecto dispersos están conectados a través de conexiones de ancho de banda relativamente bajo.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Las organizaciones y equipos de proyecto dispersos están conectados a través de conexiones de banda ancha.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Las organizaciones y equipos de proyecto dispersos están conectados a través de conexiones dedicadas.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'La optimización de datos integrados, los procesos y los canales de comunicación son monitoreados y mejorados de acuerdo a la disponibilidad de nuevas tecnologías de red.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },

  // --- PROCESOS (9 filas) ---
  {
    id: 'rec_entorno',
    category: 'procesos',
    name: 'Recursos: Entorno de Trabajo',
    icon: '🏢',
    description: 'Lugar de trabajo, motivación, productividad e infraestructura física.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'El entorno de trabajo, o bien no se reconoce como un factor de la satisfacción del personal o puede no ser propicio para la productividad.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'El entorno de trabajo y las herramientas en el lugar de trabajo se identifican como factores que influyen en la motivación y la productividad.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'El entorno de trabajo es controlado, modificado y sus criterios gestionados para aumentar la motivación del personal, la satisfacción y la productividad.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los factores ambientales se integran en las estrategias de desempeño.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los factores físicos del lugar de trabajo se revisan constantemente para asegurar la satisfacción del personal y un entorno propicio para la productividad.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'rec_conocimiento',
    category: 'procesos',
    name: 'Recursos: Gestión de Conocimiento',
    icon: '📚',
    description: 'Activo intelectual, transferencia de tácito a explícito y bases de conocimiento.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'El conocimiento no es reconocido como un activo; el conocimiento BIM suele compartirse de forma informal entre el personal (a través de consejos, técnicas y lecciones aprendidas).', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Del mismo modo, el conocimiento es reconocido como un activo; el conocimiento compartido es recopilado, documentado y después transferido de tácito a explícito.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'El conocimiento documentado se almacena adecuadamente.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'El conocimiento se integra en los sistemas de organización; el conocimiento almacenado se hace accesible y fácilmente recuperable.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Del mismo modo, las estructuras de conocimiento responsables de la adquisición, representación y difusión se revisan y modifican sistémicamente.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'act_roles',
    category: 'procesos',
    name: 'Actividades: Roles y Estructura de Equipos',
    icon: '⚙️',
    description: 'Estructuración de roles BIM, flujos organizacionales y contratación de personal.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No hay procesos definidos; los roles son ambiguos y estructuras de equipo / dinámicas son inconsistentes.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Los roles BIM se definen informalmente y los equipos se forman en consecuencia.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los roles BIM se definen formalmente y los equipos se forman en consecuencia. El conocimiento específico en roles BIM es un criterio de selección al contratar nuevos colaboradores.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los roles BIM y los objetivos de competencia se arraigan en la organización. No hay un "equipo BIM" aislado, sino una organización BIM.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los objetivos de competencia BIM mejoran de manera continua para que coincidan con los avances tecnológicos y se alineen con los objetivos organizacionales.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'act_colaboracion',
    category: 'procesos',
    name: 'Actividades: Flujos y Colaboración',
    icon: '🤝',
    description: 'Planificación de procesos, comunicación de disciplinas e integración cultural.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los miembros del equipo de proyecto se resisten a usar nuevas metodologías de trabajo.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Cada proceso se planifica de forma independiente sin un alcance definido. Hay iniciativas aisladas para lograr los objetivos de cada disciplina sin comunicación efectiva entre sí.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'La cooperación en las áreas de la organización aumenta a medida que se ponen a disposición las herramientas para la comunicación entre los equipos de proyecto. Existe un flujo de información constante.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los equipos tradicionales son orientados a BIM a medida que los nuevos procesos se convierten en parte de la cultura de la organización / del equipo del proyecto.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los Equipos BIM están integrados al core de la organización.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'act_productividad',
    category: 'procesos',
    name: 'Actividades: Rendimiento y Productividad',
    icon: '📈',
    description: 'Predictibilidad, esfuerzo colectivo y prácticas de capital intelectual.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'El rendimiento es impredecible y la productividad depende de esfuerzos individuales aislados.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se identifican las competencias BIM y se definen objetivos en torno a estas; los resultados se basan en esfuerzos colectivos y no en esfuerzo individual, se aumentan las capacidades del equipo, pero la productividad sigue siendo impredecible.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los roles BIM son visibles y los objetivos se consiguen de forma más consistente o mantienen una correlación con el esfuerzo aplicado.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Con roles BIM plenamente integrados dentro de la organización, la productividad es ahora predecible y hay poca dispersión entre lo proyectado y lo ejecutado.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Las prácticas de recursos humanos se revisan de forma proactiva para asegurar que el capital intelectual coincida con las necesidades del proceso.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'mod_lod',
    category: 'procesos',
    name: 'Modelos y Usos BIM: Estructuración y LOD',
    icon: '📐',
    description: 'Nivel de desarrollo, consistencia espacial y estructuración de entregables.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los entregables de modelos 3D sufren de niveles de detalle demasiado altos, demasiado bajos o inconsistentes.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se dispone de un documento que defina la estructuración de los objetos del modelo 3D.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los modelos y usos se empiezan a especificar definiendo el nivel de desarrollo LOD.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'El modelo y los usos están plenamente implementados, especificados y diferenciados definiendo las especificaciones de progreso del modelo o similar (LOD).', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los modelos y los usos BIM son evaluados constantemente; los bucles de retroalimentación promueven la mejora continua.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'lid_vision',
    category: 'procesos',
    name: 'Liderazgo & Gestión: Visión Corporativa',
    icon: '👑',
    description: 'Visión de los líderes, alineación estratégica y socialización.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los líderes tienen varias visiones sobre BIM.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Los líderes adoptan una visión común sobre BIM.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Se comunica la visión de implementar BIM y es entendida por la mayoría del personal.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'La visión es compartida por el personal de toda la organización y / o los socios del proyecto.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Las partes interesadas han interiorizado la visión BIM y se logra activamente.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'lid_estrategia',
    category: 'procesos',
    name: 'Liderazgo & Gestión: Planes y Estrategias',
    icon: '🗺️',
    description: 'Planes de acción, políticas de control y gestión del cambio tecnológico.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'La implementación de BIM (según los requisitos BIM de la etapa) se lleva a cabo sin una estrategia.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'La aproximación a la implementación BIM carece de datos procesables. BIM se trata únicamente como un proceso de cambio tecnológico.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'La estrategia de implementación BIM va de la mano con planes de acción detallados y una política de seguimiento y control.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'La implementación de BIM, sus requisitos y la innovación de procesos / productos están integrados a la estructura organizacional, estratégica, de gestión y de comunicación.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'La estrategia de implementación de BIM y sus efectos en los modelos de organización se revisa de forma continua y alineada con otras estrategias. Si son necesarias modificaciones, se implementan de forma proactiva.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'lid_innovacion',
    category: 'procesos',
    name: 'Liderazgo & Gestión: Innovación Corporativa',
    icon: '💡',
    description: 'Oportunidades de negocio, marketing estratégico y soluciones innovadoras.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'La innovación no se reconoce como un valor independiente y no se reconocen las oportunidades de negocios que surgen de BIM.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se reconocen las innovaciones de producto y proceso; Se identifican las oportunidades de negocio derivadas de BIM, pero no se explotan.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'BIM es reconocido como una serie de tecnologías, procesos y cambios en las políticas que deben ser gestionados sin poner trabas a la innovación. Se reconocen las oportunidades de negocio derivadas de BIM y se utilizan en las estrategias de marketing.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Las oportunidades de negocio derivadas de BIM son parte de la ventaja competitiva del equipo, organización o del equipo de proyectos y se utilizan para atraer y mantener a los clientes.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'La organización está en búsqueda permanente de soluciones innovadoras en sus productos y procesos.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },

  // --- POLÍTICAS (7 filas) ---
  {
    id: 'ent_requisitos',
    category: 'politicas',
    name: 'Entrenamiento: Requisitos y Perfiles',
    icon: '🎓',
    description: 'Requisitos de entrenamiento, competencias pre-establecidas y perfiles.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Bajo o nulo nivel de entrenamiento BIM a disposición del personal.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se definen los requisitos de entrenamiento y por lo general se proporcionan sólo cuando es necesario.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los requisitos de entrenamiento se gestionan para cumplir con las competencias pre-establecidas y los objetivos de desempeño.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'El entrenamiento se integra en las estrategias de organización y objetivos de desempeño. Los contenidos de entrenamiento se basan en las funciones.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'El entrenamiento se evalúa y mejora de forma continua.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'ent_programas',
    category: 'politicas',
    name: 'Entrenamiento: Programas y Canales Multimodales',
    icon: '🏫',
    description: 'Metodologías de entrenamiento, flexibilidad y aprendizaje continuo.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los programas de entrenamiento seleccionados no son adecuados para alcanzar los resultados buscados.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Las metodologías de entrenamiento son diversas, permitiendo flexibilidad en la distribución de contenidos.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Las metodologías de entrenamiento se adaptan a los perfiles para alcanzar los objetivos de aprendizaje de una manera efectiva.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Las metodologías de entrenamiento se incorporan en los canales de conocimiento y comunicación.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'La disponibilidad de entrenamientos multimodales se diseñan para permitir el aprendizaje continuo.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'est_politicas',
    category: 'politicas',
    name: 'Estándares: Políticas y Protocolos de Información',
    icon: '📋',
    description: 'Políticas generales de gestión de información, plan de ejecución BIM (BEP) e integración de negocio.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No hay políticas, protocolos de gestión de la información.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Existen algunas políticas generales disponibles (ej: plan de ejecución BIM).', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Hay políticas detalladas disponibles (estándares, flujos, etc ).', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Las políticas BIM están integradas en las políticas organizacionales y las estrategias de negocio.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Las políticas BIM se revisan continua y proactivamente para incorporar las lecciones aprendidas y las mejores prácticas de la industria.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'est_gestion',
    category: 'politicas',
    name: 'Estándares: Gestión de Información y Modelado',
    icon: '📊',
    description: 'Manuales de modelado, especificación analítica e incorporación a sistemas de calidad.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No hay estándares de gestión de información y modelado.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Los estándares de Modelado y documentación están definidos y alineados con la industria pero no se aplican activamente.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los estándares de modelado detallado incluyen la representación, la cuantificación, las especificaciones y las propiedades analíticas de los modelos 3D.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los estándares BIM se incorporan en los sistemas de gestión de calidad y de mejoramiento continuo.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los estándares se adaptan continuamente al cumplimiento de normativa y regulaciones.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'est_calidad',
    category: 'politicas',
    name: 'Estándares: Control y Aseguramiento de Calidad',
    icon: '🛡️',
    description: 'Objetivos de calidad, sistemas de control periódico y auditoría continua.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los planes de control de calidad son informales o no existen.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se fijan los objetivos de calidad.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Se fijan planes de calidad.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Se fijan sistemas de gestión y aseguramiento de calidad.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Se alinean continuamente la mejora de calidad.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'con_responsabilidades',
    category: 'politicas',
    name: 'Contractual: Responsabilidades, Riesgos y Beneficios',
    icon: '⚖️',
    description: 'Apéndice contractual EIR/BEP, propiedad intelectual y alineación contractual IPD.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Es dependiente de los acuerdos contractuales pre-BIM. No se reconocen los riesgos relacionados con la colaboración basada en el modelo o se ignoran.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se reconocen los requerimientos contractuales BIM respecto a la responsabilidad en la gestión de información.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Existe un mecanismo para la gestión compartida de la propiedad intelectual BIM, la confidencialidad, la responsabilidad y un sistema para la resolución de conflictos BIM.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Las organizaciones están alineadas a través de la confianza y la dependencia mutua más allá de las barreras contractuales.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Las responsabilidades, riesgos y beneficios se analizan de forma continua y adaptan al alcance. Se modifican los modelos contractuales para lograr mejores prácticas y mayor valor para todas las partes interesadas.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'ind_desempeño',
    category: 'politicas',
    name: 'Políticas: Indicadores de Calidad y Desempeño',
    icon: '📊',
    description: 'Establecimiento, monitoreo e integración de indicadores clave de desempeño corporativo.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No hay referencia de indicadores para procesos, productos o servicios.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se fijan Objetivos de indicadores de desempeño.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Se monitorea y controla estrechamente el desempeño frente a referencias del mercado.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los indicadores de desempeño se incorporan en los sistemas de mejoramiento continuo.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los indicadores se revisan de forma reiterada para asegurar la mayor calidad en procesos, productos y servicios.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },

  // --- CAPACIDAD BIM (5 filas) ---
  {
    id: 'cap_modelado',
    category: 'capacidad',
    name: 'Capacidad: Modelado Basado en Objetos',
    icon: '📦',
    description: 'Pilotos, definición formal e integración de flujos tecnológicos en una fase o disciplina.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Implementación de una herramienta basada en objetos. No se identifican cambios de proceso o en las políticas para acompañar esta implementación.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se han acabado los proyectos piloto. Se identifican los requisitos del proceso y de la política BIM. Se prepara la estrategia de implementación y los planes de detalle.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Se instigan, estandarizan y controlan los procesos y la política BIM.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Las tecnologías, procesos y política BIM están integradas en las estrategias de organización y alineadas con los objetivos de negocio.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Las tecnologías, procesos y política BIM se revisan continuamente para beneficiarse de la innovación y alcanzar los objetivos de desempeño más altos.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'cap_col_metodo',
    category: 'capacidad',
    name: 'Capacidad: Colaboración Basada en Modelo (Método)',
    icon: '🤝',
    description: 'Compatibilidad de procesos, intercambio proactivo y coordinación interdisciplinaria.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Esfuerzos aislados de colaboración; las capacidades internas de colaboración son incompatibles con los demás actores involucrados del proyecto.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Colaboración BIM uno a uno, envío y recepción de información a solicitud no programada de los actores del proyecto.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Colaboración proactiva entre las múltiples partes; los protocolos están bien documentados y gestionados.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Se caracteriza por la participación de los actores clave (por ej. Diseñadores, Constructor, Cliente) durante las fases iniciales del ciclo de vida del proyecto.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Equipo integrado por múltiples partes que incluye a todos los actores clave de la cadena de valor.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'cap_col_confianza',
    category: 'capacidad',
    name: 'Capacidad: Colaboración Basada en Modelo (Confianza)',
    icon: '🤝',
    description: 'Directrices de trabajo colaborativo, confianza mutua y riesgos compartidos.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No hay confianza entre los participantes y no existen directrices de trabajo colaborativo.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Puede faltar confianza entre los participantes y no se respetan las directrices de trabajo colaborativo.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Hay señales identificables de la confianza mutua y se respetan las directrices de trabajo colaborativo entre los participantes del proyecto.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Existe confianza mutua, respeto, riesgos y beneficios compartidos entre los participantes del proyecto.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'El entorno colaborativo es caracterizado por la confianza y el respeto a las directrices definidas.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'cap_red_modelos',
    category: 'capacidad',
    name: 'Capacidad: Integración Basada en Red (Modelos)',
    icon: '🌐',
    description: 'Generación, gestión y optimización de modelos integrados en la red.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Los modelos integrados son generados por una serie limitada de participantes en el proyecto - posiblemente por barreras organizacionales.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Los modelos integrados son generados por un gran subconjunto de los participantes en el proyecto.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los modelos integrados (o partes de) son generados y gestionados por la mayoría de los participantes en el proyecto.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los modelos integrados son generados y gestionados por todos los participantes clave del proyecto.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Se revisa y optimiza continuamente la integración de modelos y flujos de trabajo.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'cap_red_coordinacion',
    category: 'capacidad',
    name: 'Capacidad: Integración Basada en Red (Coordinación)',
    icon: '⚡',
    description: 'Intercambio concurrente e interdisciplinario y detección proactiva de desajustes.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'La integración se produce con guías de procesos, normas o protocolos de intercambio poco o no definidos.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'La integración sigue guías de proceso, normas y protocolos de intercambio pre-definidos.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'La integración sigue guías de proceso, normas y protocolos de intercambio definidas y adaptadas a las estrategias de la organización.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'La integración es la norma y el foco no está en la forma de integrar modelos o flujos de trabajo, sino en la detección y resolución proactiva de los desajustes de tecnología, procesos y políticas.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Un equipo de proyecto interdisciplinar, estrechamente unido, persigue de forma activa nuevas eficiencias, entregables y alineaciones.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },

  // --- ESCALA (3 filas) ---
  {
    id: 'esc_organizaciones',
    category: 'escala',
    name: 'Escala: Organizaciones',
    icon: '🏢',
    description: 'Liderazgo formal, estructuración de roles y liderazgo dinámico adaptable.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'No existe un liderazgo BIM; la implementación depende de los campeones de la tecnología.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Se formaliza el liderazgo BIM; los diferentes roles en el proceso de implementación están definidos.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los roles BIM Pre-definidos se complementan entre ellos en la gestión del proceso de implementación.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los roles BIM están integrados en las estructuras de liderazgo de la organización.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'El liderazgo BIM muta continuamente para permitir nuevas tecnologías, procesos y entregables.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'esc_equipos',
    category: 'escala',
    name: 'Escala: Equipos de Proyecto',
    icon: '👥',
    description: 'Colaboración inter-organizacional, alianzas temporales y equipos integrados.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Cada proyecto se ejecuta de forma independiente. No existe ningún acuerdo entre los agentes que intervienen para colaborar más allá del proyecto común actual.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Los participantes piensan más allá de un solo proyecto. Se definen y documentan los protocolos de colaboración entre participantes del proyecto.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'La colaboración entre múltiples organizaciones en varios proyectos se gestiona a través de alianzas temporales entre participantes.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'Los proyectos de colaboración los realizan organizaciones interdisciplinares o equipos de proyectos multidisciplinares; una alianza entre muchos actores clave.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'Los proyectos de colaboración son realizados por equipos de proyectos interdisciplinares auto-optimizados, que incluyen a la mayoría de los participantes.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  },
  {
    id: 'esc_mercados',
    category: 'escala',
    name: 'Escala: Mercados',
    icon: '📈',
    description: 'Componentes generados por proveedores, repositorios centrales y conexión interactiva.',
    levels: [
      { title: 'Nivel 0: Inicial', description: 'Muy pocos componentes BIM generados por proveedores (productos y materiales virtuales que representan a los físicos). La mayoría de los componentes los preparan los desarrolladores de software y los usuarios finales.', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      { title: 'Nivel 1: Definido', description: 'Los componentes BIM generados por proveedores cada vez son más asequibles a medida que los fabricantes / proveedores identifican los beneficios del negocio.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      { title: 'Nivel 2: Gestionado', description: 'Los componentes BIM están disponibles a través de repositorios centrales de muy fácil acceso / búsqueda. Los componentes no están conectados de forma interactiva a las bases de datos de los proveedores.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
      { title: 'Nivel 3: Integrado', description: 'El acceso a los repositorios de componentes está integrado en el software BIM. Los componentes están vinculados a bases de datos fuente de forma interactiva (por precio, disponibilidad, etc...).', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
      { title: 'Nivel 4: Optimizado', description: 'La generación e intercambio de componentes BIM dinámica, por múltiples vías (productos y materiales virtuales) entre todos los interesados en el proyecto a través de repositorios centrales o en red.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
    ]
  }
];

const DEFAULT_SELECTIONS: Record<string, number> = {
  // Tecnología (9)
  sw_seleccion: 1,
  sw_modelos: 1,
  sw_gestion: 0,
  sw_intercambios: 0,
  hw_equipamiento: 1,
  hw_actualizacion: 1,
  red_infraestructura: 0,
  red_canales: 0,
  red_conectividad: 0,
  // Procesos (9)
  rec_entorno: 1,
  rec_conocimiento: 0,
  act_roles: 1,
  act_colaboracion: 1,
  act_productividad: 0,
  mod_lod: 1,
  lid_vision: 0,
  lid_estrategia: 0,
  lid_innovacion: 0,
  // Políticas (7)
  ent_requisitos: 0,
  ent_programas: 0,
  est_politicas: 1,
  est_gestion: 0,
  est_calidad: 0,
  con_responsabilidades: 0,
  ind_desempeño: 0,
  // Capacidad BIM (5)
  cap_modelado: 1,
  cap_col_metodo: 0,
  cap_col_confianza: 0,
  cap_red_modelos: 0,
  cap_red_coordinacion: 0,
  // Escala (3)
  esc_organizaciones: 1,
  esc_equipos: 0,
  esc_mercados: 0,
};

const LOCAL_DRAFT_KEY = 'mesh_bim_maturity_draft_v1';

export const BimMaturityMatrixSlide = () => {
  const [selections, setSelections] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selections) return parsed.selections;
      }
    } catch {
      // Ignore parse error
    }
    return DEFAULT_SELECTIONS;
  });

  const [organization, setOrganization] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.organization) return parsed.organization;
      }
    } catch {
      // Ignore parse error
    }
    return 'Mesh Estudio';
  });

  const [assessmentTitle, setAssessmentTitle] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return `Avance_Matriz_BIM_${today}`;
  });

  const [activeCategory, setActiveCategory] = useState<'tecnologia' | 'procesos' | 'politicas' | 'capacidad' | 'escala'>('tecnologia');

  // Google Drive Auth & State
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveAssessmentFile[]>([]);
  const [activeDriveFile, setActiveDriveFile] = useState<DriveAssessmentFile | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isSavingDrive, setIsSavingDrive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mandatory Confirmation Modal State for Mutating/Destructive Drive Operations
  const [confirmModal, setConfirmModal] = useState<{
    action: 'update' | 'delete';
    file: DriveAssessmentFile;
  } | null>(null);

  // Save draft locally (only matrix selections & org name, never tokens)
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_DRAFT_KEY,
        JSON.stringify({ selections, organization, updatedAt: new Date().toISOString() })
      );
    } catch {
      // Ignore storage error
    }
  }, [selections, organization]);

  const fetchDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await listDriveAssessments(TARGET_DRIVE_FOLDER_ID);
      setDriveFiles(files);
    } catch (err: any) {
      if (err?.message === 'AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'No se pudieron consultar los archivos en la carpeta de Google Drive.',
        });
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser) => {
        setUser(authenticatedUser);
        setNeedsAuth(false);
        fetchDriveFiles();
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        await fetchDriveFiles();
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al iniciar sesión con Google.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setDriveFiles([]);
    setActiveDriveFile(null);
    setStatusMessage(null);
  };

  const handleCellClick = (dimensionId: string, levelIndex: number) => {
    setSelections(prev => ({
      ...prev,
      [dimensionId]: levelIndex
    }));
  };

  // Compute stats
  const totalLevels = (Object.values(selections) as number[]).reduce((acc: number, curr: number) => acc + (curr || 0), 0);
  const maxPossible = DIMENSIONS.length * 4;
  const scorePercentage = Math.round((totalLevels / maxPossible) * 100);

  // Overall category name
  let maturityCategory = 'BIM Inicial / Incipiente';
  let categoryColor = 'text-red-800 border-red-300 bg-red-50';
  if (scorePercentage >= 80) {
    maturityCategory = 'Nivel 3: Corporación Optimizada / Líder BIM';
    categoryColor = 'text-emerald-800 border-emerald-300 bg-emerald-50';
  } else if (scorePercentage >= 50) {
    maturityCategory = 'Nivel 2: Corporación Integrada / Colaborativa';
    categoryColor = 'text-amber-800 border-amber-300 bg-amber-50';
  } else if (scorePercentage >= 20) {
    maturityCategory = 'Nivel 1: Corporación Modelado en Silo';
    categoryColor = 'text-orange-800 border-orange-300 bg-orange-50';
  }

  // Generate a custom technical auditor prescription report
  const generateAuditorTips = () => {
    const sw = ((selections.sw_seleccion || 0) + (selections.sw_modelos || 0) + (selections.sw_gestion || 0) + (selections.sw_intercambios || 0)) / 4;
    const hw = ((selections.hw_equipamiento || 0) + (selections.hw_actualizacion || 0)) / 2;
    const red = ((selections.red_infraestructura || 0) + (selections.red_canales || 0) + (selections.red_conectividad || 0)) / 3;
    
    const act = ((selections.act_roles || 0) + (selections.act_colaboracion || 0) + (selections.act_productividad || 0)) / 3;
    const mod = selections.mod_lod || 0;
    const lid = ((selections.lid_vision || 0) + (selections.lid_estrategia || 0) + (selections.lid_innovacion || 0)) / 3;

    const con = selections.con_responsabilidades || 0;

    const tips: string[] = [];

    if ((sw + hw + red) / 3 > (act + mod + lid) / 3 + 0.8) {
      tips.push("⚠️ Desequilibrio Tecnológico: Tu infraestructura de Hardware/Software está por delante de tus flujos de trabajo prácticos. Detén adquisiciones avanzadas y prioriza capacitar a tus colaboradores en la estandarización del modelado.");
    }

    if ((act + mod) / 2 > (sw + hw + red) / 3 + 0.8) {
      tips.push("💡 Cuello de Botella de Red/Hardware: Tus intenciones y flujos están listos para la coordinación de alto nivel, pero los computadores lentos o redes inestables frustran el rendimiento técnico. Actualiza tu CDE.");
    }

    if (mod >= 2 && con < 2) {
      tips.push("📋 Vulnerabilidad Contractual: Aunque modelas con precisión y gestionas el LOD, trabajas con contratos tradicionales sin cláusulas de propiedad intelectual o flujos de responsabilidad BIM. Introduce un Anexo EIR/BIM.");
    }

    if (scorePercentage < 20) {
      tips.push("🚀 Diagnóstico Inicial: Tu organización está en un nivel primario. Te recomendamos arrancar con un piloto a pequeña escala. Define un estándar mínimo de 3 páginas de modelado para unificar criterios.");
    } else if (scorePercentage < 50) {
      tips.push("📌 Diagnóstico Nivel 1: Tienes herramientas de modelado pero operan de forma aislada. La prioridad de la empresa debe ser estructurar un Entorno Común de Datos (CDE) y homogeneizar las plantillas de inicio.");
    } else if (scorePercentage < 80) {
      tips.push("📈 Diagnóstico Nivel 2: Excelente base colaborativa. Para escalar al siguiente nivel, necesitas integrar flujos de control de calidad automatizados y consolidar auditorías semanales.");
    } else {
      tips.push("🌟 Diagnóstico Nivel 3: Tu corporación está en la cima del rendimiento. Invierte en integraciones con ERP, simulación BIM 5D en tiempo real o gemelos digitales (Digital Twins).");
    }

    return tips;
  };

  const auditorPrescriptions = generateAuditorTips();

  const buildPayload = (): SavedBimAssessmentPayload => ({
    title: assessmentTitle.trim() || 'Avance_Matriz_BIM',
    organization: organization.trim() || 'Mesh Estudio',
    updatedAt: new Date().toISOString(),
    scorePercentage,
    maturityCategory,
    selections,
    auditorPrescriptions,
  });

  const handleSaveNewToDrive = async () => {
    setIsSavingDrive(true);
    setStatusMessage(null);
    try {
      const created = await createDriveAssessment(buildPayload(), TARGET_DRIVE_FOLDER_ID);
      setActiveDriveFile(created);
      setStatusMessage({
        type: 'success',
        text: `Avance guardado en Google Drive como "${created.name}".`,
      });
      await fetchDriveFiles();
    } catch (err: any) {
      if (err?.message === 'AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'No se pudo guardar el avance en Google Drive.',
        });
      }
    } finally {
      setIsSavingDrive(false);
    }
  };

  const handleConfirmUpdateDrive = async () => {
    if (!confirmModal || confirmModal.action !== 'update') return;
    const targetFile = confirmModal.file;
    setConfirmModal(null);
    setIsSavingDrive(true);
    setStatusMessage(null);
    try {
      const updated = await updateDriveAssessment(targetFile.id, buildPayload());
      setActiveDriveFile(updated);
      setStatusMessage({
        type: 'success',
        text: `Archivo "${updated.name}" actualizado correctamente en Google Drive.`,
      });
      await fetchDriveFiles();
    } catch (err: any) {
      if (err?.message === 'AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'No se pudo actualizar el archivo en Google Drive.',
        });
      }
    } finally {
      setIsSavingDrive(false);
    }
  };

  const handleConfirmDeleteDrive = async () => {
    if (!confirmModal || confirmModal.action !== 'delete') return;
    const targetFile = confirmModal.file;
    setConfirmModal(null);
    setIsSavingDrive(true);
    setStatusMessage(null);
    try {
      await deleteDriveAssessment(targetFile.id);
      if (activeDriveFile?.id === targetFile.id) {
        setActiveDriveFile(null);
      }
      setStatusMessage({
        type: 'success',
        text: `Archivo "${targetFile.name}" eliminado de Google Drive.`,
      });
      await fetchDriveFiles();
    } catch (err: any) {
      if (err?.message === 'AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'No se pudo eliminar el archivo de Google Drive.',
        });
      }
    } finally {
      setIsSavingDrive(false);
    }
  };

  const handleLoadFromDrive = async (file: DriveAssessmentFile) => {
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const data = await loadDriveAssessment(file.id);
      if (data?.selections) {
        setSelections(data.selections);
      }
      if (data?.organization) {
        setOrganization(data.organization);
      }
      if (data?.title) {
        setAssessmentTitle(data.title.replace(/\.json$/i, ''));
      } else {
        setAssessmentTitle(file.name.replace(/\.json$/i, ''));
      }
      setActiveDriveFile(file);
      setStatusMessage({
        type: 'success',
        text: `Avance "${file.name}" cargado en la matriz.`,
      });
    } catch (err: any) {
      if (err?.message === 'AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'No se pudo cargar el archivo desde Google Drive.',
        });
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const filteredDimensions = DIMENSIONS.filter(
    dim => dim.category === activeCategory
  );

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto text-slate-900 font-sans pb-8" id="maturity-slide">
      {/* Confirmation Modal for Updating or Deleting Drive Files */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {confirmModal.action === 'update'
                    ? 'Confirmar actualización en Google Drive'
                    : 'Confirmar eliminación en Google Drive'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {confirmModal.action === 'update'
                    ? `¿Estás seguro de que deseas sobrescribir el contenido del archivo "${confirmModal.file.name}" en Google Drive con los niveles actuales (${scorePercentage}%)?`
                    : `¿Estás seguro de que deseas eliminar permanentemente el archivo "${confirmModal.file.name}" de tu carpeta de Google Drive?`}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={
                  confirmModal.action === 'update'
                    ? handleConfirmUpdateDrive
                    : handleConfirmDeleteDrive
                }
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer ${
                  confirmModal.action === 'update'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.action === 'update' ? 'Confirmar actualización' : 'Eliminar archivo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="text-emerald-600 w-6 h-6 shrink-0" />
            <span>Medición del Proceso BIM a Nivel Empresa (Matriz de Madurez)</span>
          </h1>
        </div>
        <a
          href={TARGET_DRIVE_FOLDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Abrir Carpeta en Google Drive</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Google Drive Persistence Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <CloudUpload className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                Respaldo de Avances en Google Drive
              </h2>
              <p className="text-xs text-slate-500">
                Guarda y recupera las evaluaciones de madurez directamente en la carpeta compartida de Google Drive.
              </p>
            </div>
          </div>

          {needsAuth ? (
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>{isLoggingIn ? 'Conectando...' : 'Sign in with Google'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-medium">
                Conectado: <strong className="text-slate-900">{user?.email}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {!needsAuth && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Save Form */}
            <div className="lg:col-span-6 space-y-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Empresa / Área Evaluada
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Ej. Mesh Estudio"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nombre del Archivo de Avance
                  </label>
                  <input
                    type="text"
                    value={assessmentTitle}
                    onChange={(e) => setAssessmentTitle(e.target.value)}
                    placeholder="Ej. Avance_Matriz_BIM"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveNewToDrive}
                  disabled={isSavingDrive}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{isSavingDrive ? 'Guardando...' : 'Guardar Nuevo en Drive'}</span>
                </button>

                {activeDriveFile && (
                  <button
                    type="button"
                    onClick={() => setConfirmModal({ action: 'update', file: activeDriveFile })}
                    disabled={isSavingDrive}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Actualizar "{activeDriveFile.name}"</span>
                  </button>
                )}
              </div>
            </div>

            {/* Saved Files in Drive Folder */}
            <div className="lg:col-span-6 bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">
                  Avances en la carpeta Drive ({driveFiles.length})
                </span>
                <button
                  type="button"
                  onClick={fetchDriveFiles}
                  disabled={isLoadingFiles}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Actualizar lista</span>
                </button>
              </div>

              {driveFiles.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  {isLoadingFiles
                    ? 'Consultando archivos en Google Drive...'
                    : 'Aún no hay archivos JSON de avance guardados en esta carpeta.'}
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-200/80 border border-slate-200 rounded-lg bg-white">
                  {driveFiles.map((file) => {
                    const isCurrent = activeDriveFile?.id === file.id;
                    return (
                      <div
                        key={file.id}
                        className={`px-3 py-2 flex items-center justify-between gap-2 text-xs ${
                          isCurrent ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 truncate">{file.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                            {new Date(file.modifiedTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLoadFromDrive(file)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-semibold rounded-md transition-colors cursor-pointer"
                          >
                            Cargar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmModal({ action: 'delete', file })}
                            title="Eliminar archivo de Google Drive"
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* A. Los Cinco Vectores de Madurez Corporativa */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Los Vectores de Madurez Corporativa (Bilal Succar)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-600">
              <Cpu className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold text-slate-900">Tecnología</h4>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Hardware, Software de autoría, coordinación y redes para Entorno Común de Datos (CDE).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600">
              <Layers className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold text-slate-900">Procesos</h4>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Manuales de modelado, flujos de trabajo, gestión del entorno laboral y conocimiento.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-600">
              <FileText className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold text-slate-900">Políticas</h4>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Contratos BIM (EIR/BEP), entrenamiento técnico estructurado y auditorías de indicadores.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-600">
              <Compass className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold text-slate-900">Capacidad BIM</h4>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Transición de modelado aislado a colaboración federada e integración de datos en red.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-pink-600">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold text-slate-900">Escala</h4>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Madurez organizativa, integración de equipos de proyectos y penetración del mercado.
            </p>
          </div>
        </div>
      </div>

      {/* TAB BAR FOR CATEGORY FILTERING */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveCategory('tecnologia')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'tecnologia'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          1. Tecnología ({DIMENSIONS.filter(d => d.category === 'tecnologia').length} filas)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('procesos')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'procesos'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          2. Procesos ({DIMENSIONS.filter(d => d.category === 'procesos').length} filas)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('politicas')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'politicas'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          3. Políticas ({DIMENSIONS.filter(d => d.category === 'politicas').length} filas)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('capacidad')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'capacidad'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          4. Capacidad BIM ({DIMENSIONS.filter(d => d.category === 'capacidad').length} filas)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('escala')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'escala'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          5. Escala ({DIMENSIONS.filter(d => d.category === 'escala').length} filas)
        </button>
      </div>

      {/* INTERACTIVE GRID MATRIX */}
      <div className="space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            Selección Interactiva de Capacidad
          </h3>
          <span className="text-xs text-slate-500">
            Haz clic en cada celda para actualizar tu nivel de madurez
          </span>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-slate-100 border-b border-slate-200 p-3.5 text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider text-center">
            <div className="col-span-12 md:col-span-3 text-left pl-2">Dimensión Evaluada</div>
            <div className="col-span-9 hidden md:grid md:grid-cols-5 gap-2">
              <div>Nivel 0: Inicial</div>
              <div>Nivel 1: Definido</div>
              <div>Nivel 2: Gestionado</div>
              <div>Nivel 3: Integrado</div>
              <div>Nivel 4: Optimizado</div>
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-200">
            {filteredDimensions.map((dim) => (
              <div key={dim.id} className="grid grid-cols-12 p-4 items-stretch gap-3 md:gap-0 hover:bg-slate-50/50 transition-colors">
                {/* Left labels */}
                <div className="col-span-12 md:col-span-3 flex flex-col justify-center space-y-1.5 md:pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">{dim.icon}</span>
                    <h4 className="text-xs font-bold text-slate-900">{dim.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{dim.description}</p>
                </div>

                {/* Level blocks */}
                <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-5 gap-2.5">
                  {dim.levels.map((lvl, index) => {
                    const isSelected = selections[dim.id] === index;
                    return (
                      <button
                        type="button"
                        key={index}
                        onClick={() => handleCellClick(dim.id, index)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[112px] cursor-pointer group ${
                          isSelected
                            ? `${lvl.bg} ${lvl.border} ring-2 ring-emerald-600/25 text-slate-900 shadow-xs`
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3px]" />
                          </span>
                        )}
                        <span className={`text-[10px] font-mono uppercase font-bold tracking-wider pr-5 ${isSelected ? lvl.color : 'text-slate-500'}`}>
                          {lvl.title}
                        </span>
                        <p className={`text-[11px] leading-snug mt-2 ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>
                          {lvl.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AUDIT SUMMARY & PRESCRIPTION */}
      <div className="grid grid-cols-12 gap-6">
        {/* Maturity score card */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col justify-between text-center shadow-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest block">
                ÍNDICE DE MADUREZ BIM
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">Resultado de Auditoría</h4>
            </div>

            {/* Circular progress display */}
            <div className="relative py-6 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border-4 border-emerald-100 bg-emerald-50/50 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-mono font-extrabold text-emerald-700 tabular-nums">
                  {scorePercentage}%
                </span>
                <span className="text-[10px] font-mono text-slate-600 font-semibold uppercase tracking-wider mt-1">
                  Capacidad Lograda
                </span>
              </div>
            </div>

            {/* Rating Category Box */}
            <div className={`p-3.5 rounded-xl border text-center transition-colors ${categoryColor}`}>
              <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75 font-semibold">
                Rango de Clasificación
              </span>
              <span className="text-xs font-bold block mt-0.5">{maturityCategory}</span>
            </div>
          </div>
        </div>

        {/* Auditor Prescriptions and Actionable Advice */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <Award className="text-emerald-600 w-5 h-5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Recetario del Auditor BIM</h4>
                  <p className="text-xs text-slate-500">
                    Recomendaciones estratégicas generadas a medida según las selecciones de madurez.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {auditorPrescriptions.map((tip, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-xl">
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex flex-wrap justify-between items-center gap-2 text-[11px] font-mono text-slate-500">
              <span>Metodología de Auditoría: Modelo Bilal Succar</span>
              <span className="text-emerald-700 font-bold">Aseguramiento de Calidad BIM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
