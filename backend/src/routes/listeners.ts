import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateListener } from "../middleware/auth";
import { Listener } from "../models/Listener";
import { Session } from "../models/Session";
const r = Router();
r.use(authenticateListener);

r.get("/me", async (req: Request, res: Response) => {
  try {
    const l = await Listener.findById(req.listener!.id).lean();
    if (!l) return res.status(404).json({ error: "Not found" });
    res.json({ listener: l });
  } catch { res.status(500).json({ error: "Failed to fetch listener" }); }
});

r.patch("/me/status", [body("status").isIn(["online", "offline", "busy"])], async (req: Request, res: Response) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  try {
    const l = await Listener.findByIdAndUpdate(req.listener!.id, { status: req.body.status }, { new: true });
    res.json({ status: l?.status });
  } catch { res.status(500).json({ error: "Failed to update status" }); }
});

r.get("/me/sessions", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const sessions = await Session.find({ listenerId: req.listener!.id }).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean();
    const total = await Session.countDocuments({ listenerId: req.listener!.id });
    res.json({ sessions, total, page: +page });
  } catch { res.status(500).json({ error: "Failed to fetch sessions" }); }
});

export default r;
