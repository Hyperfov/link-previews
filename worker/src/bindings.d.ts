export {};

declare global {
  const CORS: string;
  const CACHE_DURATION: string;
  const MAX_DESCRIPTION_LENGTH: string;

  interface CacheStorage {
    default: CacheStorage;
  }
}
