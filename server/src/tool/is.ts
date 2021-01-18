export function string(v: any): v is string {
  return typeof v === "string"
}
export function array(v: any): v is any[] {
  return Array.isArray(v);
}
export function number(v: any): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}
export function boolean(v: any): v is boolean {
  return typeof v === "boolean";
}
export function empty(v: object | undefined): v is object;
export function empty(v: any): boolean {
  return v && Object.keys(v).length === 0
}

export default {
  string,
  array,
  number,
  boolean,
  empty,
}
