import { IStorageProvider } from './IStorageProvider';
import { IndexedDBStorageProvider } from './IndexedDBStorageProvider';

// Singleton instance used across the app
export const storage: IStorageProvider = new IndexedDBStorageProvider();

// Helper to switch storage provider in the future (e.g. to Cloudflare D1 or REST)
let currentProvider: IStorageProvider = storage;

export function getStorageProvider(): IStorageProvider {
  return currentProvider;
}

export function setStorageProvider(provider: IStorageProvider): void {
  currentProvider = provider;
}

export * from './IStorageProvider';
export * from './IndexedDBStorageProvider';

