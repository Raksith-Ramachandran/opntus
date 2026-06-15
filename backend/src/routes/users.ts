import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { authenticateListener, requireAdmin } from "../middleware/auth";
const r = Router();

r.get("/:sessionId", authenticateListener, requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId }).select("-ipHash").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch { res.status(500).json({ error: "Failed to fetch user" }); }
});

export default r;
