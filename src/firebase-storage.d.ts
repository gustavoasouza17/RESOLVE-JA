declare module 'firebase/storage' {
  import { FirebaseApp } from 'firebase/app';

  export interface Storage {
    app: FirebaseApp;
    maxOperationRetryTime: number;
    maxUploadRetryTime: number;
  }

  export interface StorageReference {
    bucket: string;
    fullPath: string;
    name: string;
    storage: Storage;
    parent: StorageReference | null;
    root: StorageReference;
  }

  export interface UploadResult {
    ref: StorageReference;
    metadata: FullMetadata;
  }

  export interface FullMetadata {
    bucket: string;
    fullPath: string;
    name: string;
    size: number;
    type: string;
    timeCreated: string;
    updated: string;
  }

  export function getStorage(app?: FirebaseApp): Storage;
  export function ref(storage: Storage, url?: string): StorageReference;
  export function uploadBytes(ref: StorageReference, data: Blob | Uint8Array | ArrayBuffer): Promise<UploadResult>;
  export function getDownloadURL(ref: StorageReference): Promise<string>;
}