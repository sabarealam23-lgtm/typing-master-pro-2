import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  sendEmailVerification as fbSendEmailVerification,
  updateProfile as fbUpdateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || '',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: metaEnv.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== ''
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization error, operating in offline/local persistence mode:', err);
  }
}

export interface FirestoreTypingScore {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  wpm: number;
  rawWpm?: number;
  accuracy: number;
  timeTaken: number;
  mode?: string;
  createdAt?: any;
  completedAtIso?: string;
}

/**
 * Saves a completed typing test score to the 'typing_scores' collection in Firestore.
 */
export async function saveTypingScoreToFirestore(scoreData: {
  userId: string;
  userName?: string;
  userEmail?: string;
  wpm: number;
  rawWpm?: number;
  accuracy: number;
  timeTaken: number;
  mode?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!db) {
    return { success: false, error: 'Database not initialized' };
  }

  try {
    const scoresRef = collection(db, 'typing_scores');
    const docRef = await addDoc(scoresRef, {
      userId: scoreData.userId,
      userName: scoreData.userName || scoreData.userEmail?.split('@')[0] || 'Typist',
      userEmail: scoreData.userEmail || '',
      wpm: Number(scoreData.wpm) || 0,
      rawWpm: Number(scoreData.rawWpm) || Number(scoreData.wpm) || 0,
      accuracy: Number(scoreData.accuracy) || 0,
      timeTaken: Number(scoreData.timeTaken) || 0,
      mode: scoreData.mode || 'timed',
      createdAt: serverTimestamp(),
      completedAtIso: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    console.warn('Failed to save typing score to Firestore:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown Firestore error' 
    };
  }
}

/**
 * Fetches the top scores from Firestore 'typing_scores' ordered by wpm descending.
 */
export async function getGlobalLeaderboardFromFirestore(limitCount: number = 20): Promise<FirestoreTypingScore[]> {
  if (!db) return [];

  try {
    const scoresRef = collection(db, 'typing_scores');
    const q = query(scoresRef, orderBy('wpm', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const scores: FirestoreTypingScore[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      scores.push({
        id: docSnap.id,
        userId: data.userId || '',
        userName: data.userName || data.userEmail?.split('@')[0] || 'Anonymous Typist',
        userEmail: data.userEmail || '',
        wpm: typeof data.wpm === 'number' ? data.wpm : 0,
        rawWpm: typeof data.rawWpm === 'number' ? data.rawWpm : data.wpm || 0,
        accuracy: typeof data.accuracy === 'number' ? data.accuracy : 100,
        timeTaken: typeof data.timeTaken === 'number' ? data.timeTaken : 60,
        mode: data.mode || 'timed',
        createdAt: data.createdAt,
        completedAtIso: data.completedAtIso || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
      });
    });
    return scores;
  } catch (err) {
    console.warn('Failed to fetch leaderboard from Firestore:', err);
    return [];
  }
}

/**
 * Fetches typing history for a specific user from Firestore 'typing_scores'.
 */
export async function getUserHistoryFromFirestore(userId: string, limitCount: number = 50): Promise<FirestoreTypingScore[]> {
  if (!db || !userId) return [];

  try {
    const scoresRef = collection(db, 'typing_scores');
    const q = query(scoresRef, where('userId', '==', userId), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const scores: FirestoreTypingScore[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      scores.push({
        id: docSnap.id,
        userId: data.userId || '',
        userName: data.userName || data.userEmail?.split('@')[0] || 'User',
        userEmail: data.userEmail || '',
        wpm: typeof data.wpm === 'number' ? data.wpm : 0,
        rawWpm: typeof data.rawWpm === 'number' ? data.rawWpm : data.wpm || 0,
        accuracy: typeof data.accuracy === 'number' ? data.accuracy : 100,
        timeTaken: typeof data.timeTaken === 'number' ? data.timeTaken : 60,
        mode: data.mode || 'timed',
        createdAt: data.createdAt,
        completedAtIso: data.completedAtIso || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
      });
    });

    scores.sort((a, b) => {
      const timeA = a.completedAtIso ? new Date(a.completedAtIso).getTime() : 0;
      const timeB = b.completedAtIso ? new Date(b.completedAtIso).getTime() : 0;
      return timeB - timeA;
    });

    return scores;
  } catch (err) {
    console.warn('Failed to fetch user history from Firestore:', err);
    return [];
  }
}

export { 
  app, 
  auth, 
  db,
  serverTimestamp,
  Timestamp,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  fbSendPasswordResetEmail,
  fbSendEmailVerification,
  fbUpdateProfile,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc
};
export type { FirebaseUser };
