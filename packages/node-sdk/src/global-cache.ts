type GlobalCacheStore<T> = Record<string, T>

interface GlobalCache<T> {
  get: (key: string) => T | undefined
  set: (key: string, value: T) => void
  has: (key: string) => boolean
}

export const cache = <T>(): GlobalCache<T> => {
  const store: GlobalCacheStore<T> = {}

  const get = (key: string): T | undefined => {
    return store[key]
  }

  const set = (key: string, value: T): void => {
    store[key] = value
  }

  const has = (key: string): boolean => {
    return key in store
  }

  return {
    get,
    set,
    has,
  }
}
