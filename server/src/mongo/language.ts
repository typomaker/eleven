import client from "./client";

function db() {
  return client.db("localization");
}

export async function language() {
  const languages = await db().collection("language").find().toArray();
  const result: { [K: string]: string } = {};
  for (const language of languages) {
    result[language._id] = language.display;
  }

  return result;
}
export async function dictionary(key: string) {
  const words = await db().collection("dictionary").find({ [key]: { $exists: true } }).toArray();
  if (!words.length) return null;
  const result: { [K: string]: string } = {};
  for (const word of words) result[key] = word[key];
  return result;
}
