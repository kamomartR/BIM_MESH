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
