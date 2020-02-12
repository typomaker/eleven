function fallback<T>(value: T): NonNullable<T> {
  if (!value) throw new Error(`Required set value for '${name}' environment variable`);
  return value as NonNullable<T>;
}


export function string(name: string, def?: string): string {
  if (process.env[name]) {
    return process.env[name]!;
  }
  return fallback(def);
}
export function integer(name: string, def?: number): number {
  const v = parseInt(process.env[name]!, 10);
  if (Number.isNaN(v)) return fallback(def)
  return v;
}

export default {
  string,
  integer,
}