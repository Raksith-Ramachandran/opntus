import { Request, Response, NextFunction } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const allowed = process.env.FRONTEND_URL || "http://localhost:3000";
  const origin = req.headers["origin"];
  const referer = req.headers["referer"];

  const source = origin || (referer ? new URL(referer).origin : null);
  if (source !== allowed) {
    return res.status(403).json({ error: "Forbidden: invalid request origin" });
  }
  next();
}
