declare module 'firebase/firestore' {
  import { FirebaseApp } from 'firebase/app';

  // ─── Firestore ───────────────────────────────────────────────────────────────
  export interface Firestore {
    app: FirebaseApp;
    type: 'firestore-lite' | 'firestore';
    toJSON(): object;
  }

  export interface DocumentData {
    [field: string]: unknown;
  }

  export interface DocumentReference<T = DocumentData> {
    firestore: Firestore;
    id: string;
    path: string;
    parent: CollectionReference<T>;
    get(): Promise<DocumentSnapshot<T>>;
    set(data: T, options?: SetOptions): Promise<void>;
    update(data: Partial<T>): Promise<void>;
    delete(): Promise<void>;
    onSnapshot(
      onNext: (snapshot: DocumentSnapshot<T>) => void,
      onError?: (error: FirestoreError) => void,
    ): () => void;
    withConverter<U>(converter: FirestoreDataConverter<U>): DocumentReference<U>;
  }

  export interface CollectionReference<T = DocumentData> extends Query<T> {
    id: string;
    path: string;
    parent: DocumentReference<DocumentData> | null;
    doc(documentPath?: string): DocumentReference<T>;
    add(data: T): Promise<DocumentReference<T>>;
    withConverter<U>(converter: FirestoreDataConverter<U>): CollectionReference<U>;
  }

  export interface Query<T = DocumentData> {
    firestore: Firestore;
    get(): Promise<QuerySnapshot<T>>;
    where(
      fieldPath: string | FieldPath,
      opStr: WhereFilterOp,
      value: unknown,
    ): Query<T>;
    orderBy(
      fieldPath: string | FieldPath,
      directionStr?: OrderByDirection,
    ): Query<T>;
    limit(limit: number): Query<T>;
    limitToLast(limit: number): Query<T>;
    startAt(...snapshotOrVar: unknown[]): Query<T>;
    startAfter(...snapshotOrVar: unknown[]): Query<T>;
    endBefore(...snapshotOrVar: unknown[]): Query<T>;
    endAt(...snapshotOrVar: unknown[]): Query<T>;
    onSnapshot(
      onNext: (snapshot: QuerySnapshot<T>) => void,
      onError?: (error: FirestoreError) => void,
    ): () => void;
    withConverter<U>(converter: FirestoreDataConverter<U>): Query<U>;
  }

  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    ref: DocumentReference<T>;
    exists(): this is QueryDocumentSnapshot<T>;
    data(): T | undefined;
    get(fieldPath: string | FieldPath): unknown;
    metadata: SnapshotMetadata;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot<T> {
    data(): T;
  }

  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot<T>[];
    empty: boolean;
    size: number;
    metadata: SnapshotMetadata;
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
    docChanges(options?: SnapshotListenOptions): DocumentChange<T>[];
  }

  export interface DocumentChange<T = DocumentData> {
    type: 'added' | 'removed' | 'modified';
    doc: QueryDocumentSnapshot<T>;
    oldIndex: number;
    newIndex: number;
  }

  export interface SnapshotMetadata {
    hasPendingWrites: boolean;
    fromCache: boolean;
    isEqual(other: SnapshotMetadata): boolean;
  }

  export interface SnapshotListenOptions {
    includeMetadataChanges?: boolean;
  }

  export interface SetOptions {
    merge?: boolean;
    mergeFields?: (string | FieldPath)[];
  }

  export interface FirestoreDataConverter<T> {
    toFirestore(modelObject: T): DocumentData;
    fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options?: SnapshotOptions): T;
  }

  export interface SnapshotOptions {
    serverTimestamps?: 'estimate' | 'previous' | 'none';
  }

  export interface FirestoreError extends Error {
    code: FirestoreErrorCode;
    message: string;
    name: string;
  }

  export type FirestoreErrorCode =
    | 'cancelled'
    | 'unknown'
    | 'invalid-argument'
    | 'deadline-exceeded'
    | 'not-found'
    | 'already-exists'
    | 'permission-denied'
    | 'resource-exhausted'
    | 'failed-precondition'
    | 'aborted'
    | 'out-of-range'
    | 'unimplemented'
    | 'internal'
    | 'unavailable'
    | 'data-loss'
    | 'unauthenticated';

  export type WhereFilterOp =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'not-in'
    | 'array-contains-any';

  export type OrderByDirection = 'asc' | 'desc';

  export class FieldPath {
    constructor(...fieldNames: string[]);
    isEqual(other: FieldPath): boolean;
  }

  // ─── Functions ───────────────────────────────────────────────────────────────
  export function getFirestore(app?: FirebaseApp): Firestore;
  export function doc<T = DocumentData>(
    firestore: Firestore,
    path: string,
    ...pathSegments: string[]
  ): DocumentReference<T>;
  export function doc<T = DocumentData>(
    ref: CollectionReference<T>,
    path?: string,
  ): DocumentReference<T>;
  export function collection<T = DocumentData>(
    firestore: Firestore,
    path: string,
    ...pathSegments: string[]
  ): CollectionReference<T>;
  export function collection<T = DocumentData>(
    ref: DocumentReference<T>,
    path: string,
    ...pathSegments: string[]
  ): CollectionReference<T>;
  export function query<T = DocumentData>(
    query: Query<T>,
    ...constraints: QueryFilterConstraint[]
  ): Query<T>;
  export function where(
    fieldPath: string | FieldPath,
    opStr: WhereFilterOp,
    value: unknown,
  ): QueryFilterConstraint;
  export function getDoc<T = DocumentData>(
    reference: DocumentReference<T>,
  ): Promise<DocumentSnapshot<T>>;
  export function getDocs<T = DocumentData>(
    query: Query<T>,
  ): Promise<QuerySnapshot<T>>;
  export function setDoc<T = DocumentData>(
    reference: DocumentReference<T>,
    data: T,
    options?: SetOptions,
  ): Promise<void>;
  export function updateDoc<T = DocumentData>(
    reference: DocumentReference<T>,
    data: Partial<T>,
  ): Promise<void>;
  export function deleteDoc(
    reference: DocumentReference<unknown>,
  ): Promise<void>;
  export function addDoc<T = DocumentData>(
    reference: CollectionReference<T>,
    data: T,
  ): Promise<DocumentReference<T>>;
  export function onSnapshot<T = DocumentData>(
    reference: DocumentReference<T>,
    onNext: (snapshot: DocumentSnapshot<T>) => void,
    onError?: (error: FirestoreError) => void,
  ): () => void;
  export function onSnapshot<T = DocumentData>(
    query: Query<T>,
    onNext: (snapshot: QuerySnapshot<T>) => void,
    onError?: (error: FirestoreError) => void,
  ): () => void;

  // ─── Constraint type ─────────────────────────────────────────────────────────
  export interface QueryFilterConstraint {
    type: 'where';
    _field: FieldPath | string;
    _op: WhereFilterOp;
    _value: unknown;
  }
}