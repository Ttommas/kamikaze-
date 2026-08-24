import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentUser } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Scopes required for Gmail sending and User Profile
export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory token cache (strictly in-memory, not in storage)
let cachedAccessToken: string | null = null;
let cachedUser: StudentUser | null = null;

export const getCachedAccessToken = (): string | null => cachedAccessToken;

export const mapFirebaseUserToStudent = (fbUser: FirebaseUser): StudentUser => {
  const email = fbUser.email?.toLowerCase() || '';
  const displayName = fbUser.displayName || email.split('@')[0] || 'Participante Kamikaze';
  const avatarUrl =
    fbUser.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  return {
    id: `g-${fbUser.uid}`,
    name: displayName,
    email,
    phone: fbUser.phoneNumber || '',
    doc: '',
    isMember: false,
    avatarUrl,
    provider: 'google',
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
};

// Listen to auth state
export const initAuth = (
  onAuthSuccess?: (user: StudentUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser && cachedAccessToken) {
      const student = mapFirebaseUserToStudent(fbUser);
      cachedUser = student;
      if (onAuthSuccess) onAuthSuccess(student, cachedAccessToken);
    } else {
      if (!cachedAccessToken && onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

// Real Google Sign-in with OAuth Access Token
export const signInWithGoogle = async (): Promise<{
  user: StudentUser;
  accessToken: string;
  rawUser: FirebaseUser;
}> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('No se recibió el Access Token de Google OAuth.');
    }

    cachedAccessToken = accessToken;
    const studentUser = mapFirebaseUserToStudent(result.user);
    cachedUser = studentUser;

    return {
      user: studentUser,
      accessToken,
      rawUser: result.user,
    };
  } catch (error: any) {
    console.error('Error en Google Sign-In:', error);
    throw error;
  }
};

export const logoutGoogleAuth = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

// Create RFC 2822 MIME message for Gmail API
function makeEmailRFC822(
  to: string,
  from: string,
  subject: string,
  messageText: string,
  replyTo?: string
): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const lines = [
    `To: ${to}`,
    `From: ${from}`,
    replyTo ? `Reply-To: ${replyTo}` : '',
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    messageText,
  ].filter(Boolean);

  const rawString = lines.join('\r\n');
  return btoa(unescape(encodeURIComponent(rawString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Send real Email via Gmail API
export async function sendEmailViaGmail({
  accessToken,
  senderEmail,
  recipientEmail,
  subject,
  body,
}: {
  accessToken: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
}): Promise<{ id: string; threadId: string }> {
  const raw = makeEmailRFC822(recipientEmail, senderEmail, subject, body, senderEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message ||
        `Error al enviar correo con Gmail API (Status ${response.status}: ${response.statusText})`
    );
  }

  return await response.json();
}
