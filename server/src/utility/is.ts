export function string(v: any): v is string {
  return typeof v === "string"
}
export function array(v: any): v is Array<any> {
  return Array.isArray(v);
}
export function number(v: any): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}
export function boolean(v: any): v is boolean {
  return typeof v === "boolean";
}
export function empty(v: any): v is object {
  return v && Object.keys(v).length === null
}

export default {
  string,
  array,
  number,
  boolean,
}
