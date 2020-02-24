export function string(v: any): v is string {
  return typeof v === "string"
}
export function array(v: any): v is Array<any> {
  return Array.isArray(v);
}
export function number(v: any): v is number {
  return typeof v === "number";
}
export function boolean(v: any): v is boolean {
  return typeof v === "boolean";
}

export default {
  string,
  array,
  number,
  boolean,
}
