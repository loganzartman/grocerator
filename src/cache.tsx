export class ExpiringCache<K, V> {
  expiresInMs: number;
  data: Map<string, [number, V]>;

  constructor({expiresInMs}: {expiresInMs: number}) {
    this.expiresInMs = expiresInMs;
    this.data = new Map();
  }

  private keyFor(k: K): string {
    return JSON.stringify(k);
  }

  private getIfNotExpired(key: string): V | undefined {
    const [expiration, v] = this.data.get(key);
    if (Date.now() >= expiration) {
      this.data.delete(key);
      return undefined;
    }
    return v;
  }

  has(k: K): boolean {
    const key = this.keyFor(k);
    if (this.data.has(key)) {
      if (typeof this.getIfNotExpired(key) === 'undefined') {
        return false;
      }
      return true;
    }
    return false;
  }

  set(k: K, v: V) {
    this.data.set(this.keyFor(k), [Date.now() + this.expiresInMs, v]);
  }

  get(k: K): V | undefined {
    const key = this.keyFor(k);
    if (this.data.has(key)) {
      return this.getIfNotExpired(key);
    }
    return undefined;
  }

  computeIfAbsent(k: K, compute: () => V): V {
    if (!this.has(k)) {
      this.set(k, compute());
    }
    return this.get(k);
  }

  async computeIfAbsentAsync(k: K, compute: () => Promise<V>): Promise<V> {
    if (!this.has(k)) {
      this.set(k, await compute());
    }
    return this.get(k);
  }
}
