import { Router,Request,Response } from "express";
import { body,param,validationResult } from "express-validator";
import { authenticateListener,requireAdmin } from "../middleware/auth";
import { User } from "../models/User";
import { Listener } from "../models/Listener";
import { Session } from "../models/Session";
import { Report } from "../models/Report";
const r = Router();
r.use(authenticateListener,requireAdmin);

r.get("/metrics",async(_req,res:Response)=>{
  const [totalUsers,activeListeners,activeSessions,completedToday,pendingReports]=await Promise.all([
    User.countDocuments(),Listener.countDocuments({status:"online"}),Session.countDocuments({status:"active"}),
    Session.countDocuments({status:"completed",endedAt:{$gte:new Date(new Date().setHours(0,0,0,0))}}),Report.countDocuments({status:"pending"})
  ]);
  res.json({totalUsers,activeListeners,activeSessions,completedToday,pendingReports});
});

r.get("/listeners",async(_req,res:Response)=>{ res.json({listeners:await Listener.find().select("-passwordHash").sort({createdAt:-1}).lean()}); });

r.patch("/listeners/:id/status",[param("id").isMongoId(),body("status").isIn(["online","offline","suspended"])],async(req:Request,res:Response)=>{
  const errs=validationResult(req); if(!errs.isEmpty()) return res.status(400).json({errors:errs.array()});
  const l=await Listener.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true}).select("-passwordHash");
  if(!l) return res.status(404).json({error:"Listener not found"});
  res.json({message:"Status updated",listener:l});
});

r.delete("/listeners/:id",[param("id").isMongoId()],async(req:Request,res:Response)=>{
  const l=await Listener.findByIdAndDelete(req.params.id);
  if(!l) return res.status(404).json({error:"Not found"});
  res.json({message:"Listener removed"});
});

r.get("/reports",async(req:Request,res:Response)=>{
  const {status="pending",page=1,limit=20}=req.query;
  const reports=await Report.find({status}).populate("sessionId").sort({timestamp:-1}).skip((+page-1)*+limit).limit(+limit).lean();
  res.json({reports,total:await Report.countDocuments({status}),page:+page});
});

r.patch("/reports/:id",[param("id").isMongoId(),body("status").isIn(["reviewed","resolved","dismissed"]),body("actionTaken").optional().isString().isLength({max:500}).trim()],
  async(req:Request,res:Response)=>{
    const errs=validationResult(req); if(!errs.isEmpty()) return res.status(400).json({errors:errs.array()});
    const rpt=await Report.findByIdAndUpdate(req.params.id,{status:req.body.status,reviewedBy:req.listener!.id,reviewedAt:new Date(),...(req.body.actionTaken&&{actionTaken:req.body.actionTaken})},{new:true});
    if(!rpt) return res.status(404).json({error:"Report not found"});
    res.json({message:"Report updated",report:rpt});
  }
);

r.post("/users/:sessionId/ban",[param("sessionId").isString().isLength({min:10}),body("reason").isString().isLength({min:5,max:500}).trim()],
  async(req:Request,res:Response)=>{
    const errs=validationResult(req); if(!errs.isEmpty()) return res.status(400).json({errors:errs.array()});
    const user=await User.findOneAndUpdate({sessionId:req.params.sessionId},{isBanned:true,bannedAt:new Date(),bannedReason:req.body.reason},{new:true});
    if(!user) return res.status(404).json({error:"User not found"});
    res.json({message:"User banned",userId:user._id});
  }
);

export default r;
