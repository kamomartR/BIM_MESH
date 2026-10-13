import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const MATRIX_COLLECTION = 'matrices';
const MATRIX_DOC_ID = 'mesh_estudio';
const MATRIX_PATH = `${MATRIX_COLLECTION}/${MATRIX_DOC_ID}`;

export interface CloudMatrixData {
  selections: Record<string, number>;
  scorePercentage: number;
  maturityCategory: string;
  updatedAt?: Timestamp | null;
}

export async function loadMatrixStateFromCloud(): Promise<CloudMatrixData | null> {
  try {
    const snap = await getDoc(doc(db, MATRIX_COLLECTION, MATRIX_DOC_ID));
    if (snap.exists()) {
      return snap.data() as CloudMatrixData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, MATRIX_PATH);
    return null;
  }
}

export function subscribeToMatrixState(
  onData: (data: CloudMatrixData) => void
) {
  return onSnapshot(
    doc(db, MATRIX_COLLECTION, MATRIX_DOC_ID),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as CloudMatrixData);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, MATRIX_PATH);
    }
  );
}

export async function saveMatrixStateToCloud(
  selections: Record<string, number>,
  scorePercentage: number,
  maturityCategory: string
): Promise<void> {
  const sanitizedSelections: Record<string, number> = {};
  for (const [key, val] of Object.entries(selections)) {
    const num = Math.max(0, Math.min(4, Math.round(Number(val) || 0)));
    sanitizedSelections[key] = num;
  }

  const sanitizedScore = Math.max(0, Math.min(100, Math.round(Number(scorePercentage) || 0)));
  const sanitizedCategory = (maturityCategory || 'BIM Inicial').slice(0, 120);

  try {
    await setDoc(doc(db, MATRIX_COLLECTION, MATRIX_DOC_ID), {
      selections: sanitizedSelections,
      scorePercentage: sanitizedScore,
      maturityCategory: sanitizedCategory,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, MATRIX_PATH);
  }
}

export const GOALS_COLLECTION = 'goals';
export const GOALS_DOC_ID = 'mesh_estudio';
export const GOALS_PATH = `${GOALS_COLLECTION}/${GOALS_DOC_ID}`;

export interface CloudGoalsData {
  targetSelections: Record<string, number>;
  categoryTargets: Record<string, number>;
  targetScorePercentage: number;
  targetPeriod: string;
  targetDate: string;
  responsibleRole: string;
  notes: string;
  updatedAt?: Timestamp | null;
}

export async function loadGoalsStateFromCloud(): Promise<CloudGoalsData | null> {
  try {
    const snap = await getDoc(doc(db, GOALS_COLLECTION, GOALS_DOC_ID));
    if (snap.exists()) {
      return snap.data() as CloudGoalsData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, GOALS_PATH);
    return null;
  }
}

export function subscribeToGoalsState(
  onData: (data: CloudGoalsData) => void
) {
  return onSnapshot(
    doc(db, GOALS_COLLECTION, GOALS_DOC_ID),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as CloudGoalsData);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, GOALS_PATH);
    }
  );
}

export async function saveGoalsStateToCloud(
  goals: Omit<CloudGoalsData, 'updatedAt'>
): Promise<void> {
  const sanitizedTargetSelections: Record<string, number> = {};
  for (const [key, val] of Object.entries(goals.targetSelections || {})) {
    sanitizedTargetSelections[key] = Math.max(0, Math.min(4, Math.round(Number(val) || 0)));
  }

  const sanitizedCategoryTargets: Record<string, number> = {
    tecnologia: Math.max(0, Math.min(100, Math.round(Number(goals.categoryTargets?.tecnologia) || 0))),
    procesos: Math.max(0, Math.min(100, Math.round(Number(goals.categoryTargets?.procesos) || 0))),
    politicas: Math.max(0, Math.min(100, Math.round(Number(goals.categoryTargets?.politicas) || 0))),
    capacidad: Math.max(0, Math.min(100, Math.round(Number(goals.categoryTargets?.capacidad) || 0))),
    escala: Math.max(0, Math.min(100, Math.round(Number(goals.categoryTargets?.escala) || 0))),
  };

  const sanitizedScore = Math.max(0, Math.min(100, Math.round(Number(goals.targetScorePercentage) || 0)));
  const sanitizedPeriod = (goals.targetPeriod || 'Q4 2026').slice(0, 64);
  const sanitizedDate = (goals.targetDate || '2026-12-31').slice(0, 32);
  const sanitizedRole = (goals.responsibleRole || 'BIM Manager / Dirección Técnica').slice(0, 100);
  const sanitizedNotes = (goals.notes || '').slice(0, 1000);

  try {
    await setDoc(doc(db, GOALS_COLLECTION, GOALS_DOC_ID), {
      targetSelections: sanitizedTargetSelections,
      categoryTargets: sanitizedCategoryTargets,
      targetScorePercentage: sanitizedScore,
      targetPeriod: sanitizedPeriod,
      targetDate: sanitizedDate,
      responsibleRole: sanitizedRole,
      notes: sanitizedNotes,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GOALS_PATH);
  }
}

// --- ISO 9001 CLOUD STORAGE ---
const ISO9001_MATRIX_COLLECTION = 'matrices_iso9001';
const ISO9001_MATRIX_DOC_ID = 'mesh_estudio';

export interface CloudIso9001MatrixData {
  selections: Record<string, number>;
  scorePercentage: number;
  maturityCategory: string;
  updatedAt?: Timestamp | null;
}

export async function loadIso9001MatrixStateFromCloud(): Promise<CloudIso9001MatrixData | null> {
  try {
    const snap = await getDoc(doc(db, ISO9001_MATRIX_COLLECTION, ISO9001_MATRIX_DOC_ID));
    if (snap.exists()) {
      return snap.data() as CloudIso9001MatrixData;
    }
    return null;
  } catch {
    return null;
  }
}

export function subscribeToIso9001MatrixState(
  onData: (data: CloudIso9001MatrixData) => void
) {
  return onSnapshot(
    doc(db, ISO9001_MATRIX_COLLECTION, ISO9001_MATRIX_DOC_ID),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as CloudIso9001MatrixData);
      }
    },
    () => {
      // Offline fallback operates silently
    }
  );
}

export async function saveIso9001MatrixStateToCloud(
  selections: Record<string, number>,
  scorePercentage: number,
  maturityCategory: string
): Promise<void> {
  const sanitizedSelections: Record<string, number> = {};
  for (const [key, val] of Object.entries(selections)) {
    sanitizedSelections[key] = Math.max(0, Math.min(4, Math.round(Number(val) || 0)));
  }
  const sanitizedScore = Math.max(0, Math.min(100, Math.round(Number(scorePercentage) || 0)));
  const sanitizedCategory = (maturityCategory || 'Inicial').slice(0, 120);

  try {
    await setDoc(doc(db, ISO9001_MATRIX_COLLECTION, ISO9001_MATRIX_DOC_ID), {
      selections: sanitizedSelections,
      scorePercentage: sanitizedScore,
      maturityCategory: sanitizedCategory,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Handled gracefully with local cache fallback
  }
}

const ISO9001_GOALS_COLLECTION = 'goals_iso9001';
const ISO9001_GOALS_DOC_ID = 'mesh_estudio';

export interface CloudIso9001GoalsData {
  targetSelections: Record<string, number>;
  categoryTargets: Record<string, number>;
  targetScorePercentage: number;
  targetPeriod: string;
  targetDate: string;
  responsibleRole: string;
  notes: string;
  updatedAt?: Timestamp | null;
}

export async function loadIso9001GoalsStateFromCloud(): Promise<CloudIso9001GoalsData | null> {
  try {
    const snap = await getDoc(doc(db, ISO9001_GOALS_COLLECTION, ISO9001_GOALS_DOC_ID));
    if (snap.exists()) {
      return snap.data() as CloudIso9001GoalsData;
    }
    return null;
  } catch {
    return null;
  }
}

export function subscribeToIso9001GoalsState(
  onData: (data: CloudIso9001GoalsData) => void
) {
  return onSnapshot(
    doc(db, ISO9001_GOALS_COLLECTION, ISO9001_GOALS_DOC_ID),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as CloudIso9001GoalsData);
      }
    },
    () => {
      // Offline fallback
    }
  );
}

export async function saveIso9001GoalsStateToCloud(
  goals: Omit<CloudIso9001GoalsData, 'updatedAt'>
): Promise<void> {
  const sanitizedTargetSelections: Record<string, number> = {};
  for (const [key, val] of Object.entries(goals.targetSelections || {})) {
    sanitizedTargetSelections[key] = Math.max(0, Math.min(4, Math.round(Number(val) || 0)));
  }
  const sanitizedCategoryTargets: Record<string, number> = {};
  for (const [key, val] of Object.entries(goals.categoryTargets || {})) {
    sanitizedCategoryTargets[key] = Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
  }

  try {
    await setDoc(doc(db, ISO9001_GOALS_COLLECTION, ISO9001_GOALS_DOC_ID), {
      targetSelections: sanitizedTargetSelections,
      categoryTargets: sanitizedCategoryTargets,
      targetScorePercentage: Math.max(0, Math.min(100, Math.round(Number(goals.targetScorePercentage) || 0))),
      targetPeriod: (goals.targetPeriod || 'Q4 2026').slice(0, 64),
      targetDate: (goals.targetDate || '2026-12-31').slice(0, 32),
      responsibleRole: (goals.responsibleRole || 'Director de Calidad / Auditor SGC').slice(0, 100),
      notes: (goals.notes || '').slice(0, 1000),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // LocalStorage guarantees persistence
  }
}

