import path from "path";

export const platformPath = (p: string) => {
  let normalized: string;
  if (process.platform === "win32") {
    normalized = path.win32.normalize(p);
  } else {
    normalized = path.normalize(p);
  }
  return normalized;
};
