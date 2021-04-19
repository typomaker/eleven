import bcrypt from "bcrypt";

function litter(v: string): string {
  return `8c45ded42c8a40b${v.split("").map((v) => `c8a${v}2d6`).join("")}687882e7ea6d9d`;
}
export async function hash(v: string) {
  v = litter(v);
  return await bcrypt.hash(v, await bcrypt.genSalt(15));
}
export async function compare(password: string, encrypted: string) {
  password = litter(password);
  return await bcrypt.compare(password, encrypted);
}