type Level = "error" | "warn" | "info" | "debug";
const C: Record<Level, string> = { error: "\x1b[31m", warn: "\x1b[33m", info: "\x1b[36m", debug: "\x1b[37m" };
const R = "\x1b[0m";

function sanitize(val: unknown): unknown {
  if (typeof val === "string") return val.replace(/[\r\n\t]/g, " ").replace(/[\x00-\x1f\x7f]/g, "");
  return val;
}

function log(l: Level, ...a: unknown[]) {
  const p = `${C[l]}[${new Date().toISOString()}] [${l.toUpperCase()}]${R}`;
  const safe = a.map(sanitize);
  l === "error" ? console.error(p, ...safe) : console.log(p, ...safe);
}

export const logger = {
  error: (...a: unknown[]) => log("error", ...a),
  warn:  (...a: unknown[]) => log("warn", ...a),
  info:  (...a: unknown[]) => log("info", ...a),
  debug: (...a: unknown[]) => { if (process.env.NODE_ENV !== "production") log("debug", ...a); },
};
