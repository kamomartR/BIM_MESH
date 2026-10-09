import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
];

export const TARGET_DRIVE_FOLDER_ID = '1o9ZvJZlgFn1RI3oNp54LuViAPXGtZjv0';
export const TARGET_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_DRIVE_FOLDER_ID}`;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory only (never in localStorage or sessionStorage).
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface SavedBimAssessmentPayload {
  title: string;
  organization: string;
  updatedAt: string;
  scorePercentage: number;
  maturityCategory: string;
  selections: Record<string, number>;
  auditorPrescriptions: string[];
}

export interface DriveAssessmentFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export async function listDriveAssessments(folderId: string = TARGET_DRIVE_FOLDER_ID): Promise<DriveAssessmentFile[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const query = encodeURIComponent(
    `'${folderId}' in parents and mimeType = 'application/json' and trashed = false`
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=25&supportsAllDrives=true&includeItemsFromAllDrives=true`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(' Error de permisos al consultar la carpeta de Google Drive.');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Error al listar archivos en Google Drive.');
  }

  const data = await res.json();
  return data.files || [];
}

export async function createDriveAssessment(
  payload: SavedBimAssessmentPayload,
  folderId: string = TARGET_DRIVE_FOLDER_ID
): Promise<DriveAssessmentFile> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const safeName = payload.title.trim() || 'Matriz_Madurez_BIM';
  const fileName = safeName.endsWith('.json') ? safeName : `${safeName}.json`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
    description: `Evaluación Matriz de Madurez BIM - ${payload.organization} (${payload.scorePercentage}%)`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(payload, null, 2) +
    closeDelim;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,webViewLink&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'No se pudo guardar el archivo en la carpeta de Google Drive.');
  }

  return await res.json();
}

export async function updateDriveAssessment(
  fileId: string,
  payload: SavedBimAssessmentPayload
): Promise<DriveAssessmentFile> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const safeName = payload.title.trim() || 'Matriz_Madurez_BIM';
  const fileName = safeName.endsWith('.json') ? safeName : `${safeName}.json`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Evaluación Matriz de Madurez BIM - ${payload.organization} (${payload.scorePercentage}%)`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(payload, null, 2) +
    closeDelim;

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,modifiedTime,webViewLink&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'No se pudo actualizar el archivo en Google Drive.');
  }

  return await res.json();
}

export async function loadDriveAssessment(fileId: string): Promise<SavedBimAssessmentPayload> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'No se pudo leer el archivo desde Google Drive.');
  }

  return await res.json();
}

export async function deleteDriveAssessment(fileId: string): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'No se pudo eliminar el archivo de Google Drive.');
  }
}
