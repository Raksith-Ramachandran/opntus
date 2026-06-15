import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { Session } from "../models/Session";
import { Message } from "../models/Message";
import { Report } from "../models/Report";
import { Listener } from "../models/Listener";
import { authenticateListener } from "../middleware/auth";
const r = Router();

r.get("/:id", authenticateListener, [param("id").isMongoId()], async (req: Request, res: Response) => {
  try {
    const s = await Session.findById(req.params.id).populate("listenerId", "name email").lean();
    if (!s) return res.status(404).json({ error: "Session not found" });
    res.json({ session: s });
  } catch { res.status(500).json({ error: "Failed to fetch session" }); }
});

r.get("/:id/messages", authenticateListener, [param("id").isMongoId()], async (req: Request, res: Response) => {
  try {
    const msgs = await Message.find({ sessionId: req.params.id }).sort({ timestamp: 1 }).lean();
    res.json({ messages: msgs });
  } catch { res.status(500).json({ error: "Failed to fetch messages" }); }
});

r.post("/:id/feedback",
  [param("id").isMongoId(), body("rating").optional().isInt({ min: 1, max: 5 }), body("helpful").optional().isBoolean(), body("feedback").optional().isString().isLength({ max: 1000 }).trim()],
  async (req: Request, res: Response) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    try {
      const { rating, helpful, feedback } = req.body;
      const session = await Session.findByIdAndUpdate(req.params.id, { ...(rating && { userRating: rating }), ...(helpful !== undefined && { listenerHelpful: helpful }), ...(feedback && { userFeedback: feedback }) }, { new: true });
      if (!session) return res.status(404).json({ error: "Session not found" });
      if (rating && session.listenerId) {
        const sessions = await Session.find({ listenerId: session.listenerId, userRating: { $exists: true } }).select("userRating");
        const avg = sessions.reduce((a, s) => a + (s.userRating || 0), 0) / sessions.length;
        await Listener.findByIdAndUpdate(session.listenerId, { averageRating: Math.round(avg * 10) / 10, totalRatings: sessions.length });
      }
      res.json({ message: "Feedback submitted", session });
    } catch { res.status(500).json({ error: "Failed to submit feedback" }); }
  }
);

r.post("/:id/report",
  [param("id").isMongoId(), body("reason").isIn(["harassment", "inappropriate_content", "spam", "impersonation", "technical_issue", "other"]), body("reporterType").isIn(["user", "listener"]), body("description").optional().isString().isLength({ max: 1000 }).trim()],
  async (req: Request, res: Response) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    try {
      const session = await Session.findById(req.params.id);
      if (!session) return res.status(404).json({ error: "Session not found" });
      const report = await Report.create({ sessionId: req.params.id, reason: req.body.reason, reporterType: req.body.reporterType, description: req.body.description });
      await Session.findByIdAndUpdate(req.params.id, { isFlagged: true, flagReason: req.body.reason });
      res.status(201).json({ message: "Report submitted", reportId: report._id });
    } catch { res.status(500).json({ error: "Failed to submit report" }); }
  }
);

export default r;
