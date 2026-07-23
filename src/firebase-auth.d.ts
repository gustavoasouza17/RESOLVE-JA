declare module 'firebase/auth' {
  import { FirebaseApp } from 'firebase/app';

  // ─── User ────────────────────────────────────────────────────────────────────
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
    providerData: UserInfo[];
    refreshToken: string;
    tenantId: string | null;
    delete(): Promise<void>;
    getIdToken(forceRefresh?: boolean): Promise<string>;
    getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
    reload(): Promise<void>;
    toJSON(): object;
  }

  export interface UserInfo {
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
  }

  export interface IdTokenResult {
    token: string;
    authTime: string;
    issuedAtTime: string;
    expirationTime: string;
    signInProvider: string | null;
    signInSecondFactor: string | null;
    claims: Record<string, unknown>;
  }

  // ─── Auth ────────────────────────────────────────────────────────────────────
  export interface Auth {
    app: FirebaseApp;
    name: string;
    currentUser: User | null;
    languageCode: string | null;
    tenantId: string | null;
    settings: AuthSettings;
    onAuthStateChanged(
      nextOrObserver: ((user: User | null) => void) | { next: (user: User | null) => void },
      error?: (error: AuthError) => void,
      completed?: () => void,
    ): () => void;
    onIdTokenChanged(
      nextOrObserver: ((user: User | null) => void) | { next: (user: User | null) => void },
      error?: (error: AuthError) => void,
      completed?: () => void,
    ): () => void;
    signOut(): Promise<void>;
    useDeviceLanguage(): void;
    updateCurrentUser(user: User | null): Promise<void>;
  }

  export interface AuthSettings {
    appVerificationDisabledForTesting: boolean;
  }

  // ─── Errors ──────────────────────────────────────────────────────────────────
  export interface AuthError extends Error {
    code: string;
    message: string;
    name: string;
  }

  // ─── Credentials ─────────────────────────────────────────────────────────────
  export interface UserCredential {
    user: User;
    providerId: string | null;
    operationType: string;
  }

  // ─── Action Code ─────────────────────────────────────────────────────────────
  export interface ActionCodeSettings {
    url: string;
    handleCodeInApp?: boolean;
    iOS?: { bundleId: string };
    android?: { packageName: string; installApp?: boolean; minimumVersion?: string };
    dynamicLinkDomain?: string;
  }

  // ─── Functions ───────────────────────────────────────────────────────────────
  export function getAuth(app?: FirebaseApp): Auth;
  export function signInWithEmailAndPassword(
    auth: Auth,
    email: string,
    password: string,
  ): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(
    auth: Auth,
    email: string,
    password: string,
  ): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function sendPasswordResetEmail(
    auth: Auth,
    email: string,
    actionCodeSettings?: ActionCodeSettings,
  ): Promise<void>;
  export function updateProfile(
    user: User,
    profile: { displayName?: string; photoURL?: string },
  ): Promise<void>;
  export function onAuthStateChanged(
    auth: Auth,
    nextOrObserver: ((user: User | null) => void) | { next: (user: User | null) => void },
    error?: (error: AuthError) => void,
    completed?: () => void,
  ): () => void;
  export function onIdTokenChanged(
    auth: Auth,
    nextOrObserver: ((user: User | null) => void) | { next: (user: User | null) => void },
    error?: (error: AuthError) => void,
    completed?: () => void,
  ): () => void;
  export function updateCurrentUser(auth: Auth, user: User | null): Promise<void>;
  export function reload(user: User): Promise<void>;
  export function getIdToken(user: User, forceRefresh?: boolean): Promise<string>;
  export function getIdTokenResult(
    user: User,
    forceRefresh?: boolean,
  ): Promise<IdTokenResult>;
}