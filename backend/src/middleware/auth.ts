import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Listener } from "../models/Listener";

interface JwtPayload { id:string; role:"listener"|"admin"; }
declare global { namespace Express { interface Request { listener?:{ id:string; role:"listener"|"admin"; }; } } }

export const authenticateListener = async (req:Request,res:Response,next:NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error:"No token" });
    const decoded = jwt.verify(auth.substring(7),process.env.JWT_SECRET!) as JwtPayload;
    const listener = await Listener.findById(decoded.id);
    if (!listener || listener.status==="suspended") return res.status(401).json({ error:"Invalid or suspended account" });
    req.listener = { id:decoded.id, role:decoded.role };
    next();
  } catch(err) {
    if (err instanceof jwt.TokenExpiredError) return res.status(401).json({ error:"Token expired" });
    return res.status(401).json({ error:"Invalid token" });
  }
};

export const requireAdmin = (req:Request,res:Response,next:NextFunction) => {
  if (req.listener?.role!=="admin") return res.status(403).json({ error:"Admin access required" });
  next();
};
