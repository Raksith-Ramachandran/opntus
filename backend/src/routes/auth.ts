import { Router,Request,Response } from "express";
import jwt from "jsonwebtoken";
import { body,validationResult } from "express-validator";
import { Listener } from "../models/Listener";
import { User } from "../models/User";
import { generateAnonymousName } from "../utils/nameGenerator";
import crypto from "crypto";
const r = Router();

r.post("/listener/login",
  [body("email").isEmail().normalizeEmail(), body("password").isLength({min:8})],
  async(req:Request,res:Response)=>{
    const errs=validationResult(req); if(!errs.isEmpty()) return res.status(400).json({errors:errs.array()});
    const {email,password}=req.body;
    const listener=await Listener.findOne({email}).select("+passwordHash");
    if(!listener||!(await listener.comparePassword(password))) return res.status(401).json({error:"Invalid credentials"});
    if(listener.status==="suspended") return res.status(403).json({error:"Account suspended"});
    await Listener.findByIdAndUpdate(listener._id,{lastLoginAt:new Date()});
    const token=jwt.sign({id:listener._id,role:listener.role},process.env.JWT_SECRET!,{expiresIn:process.env.JWT_EXPIRES_IN||"7d"});
    res.json({token,listener:{id:listener._id,name:listener.name,email:listener.email,role:listener.role,status:listener.status}});
  }
);

r.post("/user/start",
  [body("mood").isIn(["stressed","lonely","anxious","overthinking","relationship","academic","work","general"])],
  async(req:Request,res:Response)=>{
    const errs=validationResult(req); if(!errs.isEmpty()) return res.status(400).json({errors:errs.array()});
    const {mood}=req.body;
    const sessionId=crypto.randomBytes(32).toString("hex");
    const anonymousName=await generateAnonymousName();
    const ip=req.ip||req.socket.remoteAddress||"";
    const ipHash=crypto.createHash("sha256").update(ip+(process.env.IP_SALT||"salt")).digest("hex");
    const user=await User.create({sessionId,anonymousName,mood,ipHash});
    res.status(201).json({sessionId,anonymousName,mood,userId:user._id});
  }
);

r.post("/listener/register",
  [body("name").trim().isLength({min:2,max:100}),body("email").isEmail().normalizeEmail(),body("password").isLength({min:8}),body("adminKey").notEmpty()],
  async(req:Request,res:Response)=>{
    if(req.body.adminKey!==process.env.ADMIN_REGISTRATION_KEY) return res.status(403).json({error:"Invalid admin key"});
    const errs=validationResult(req); if(!errs.isEmpty()) return res.status(400).json({errors:errs.array()});
    const {name,email,password}=req.body;
    if(await Listener.findOne({email})) return res.status(409).json({error:"Email already registered"});
    const listener=await Listener.create({name,email,passwordHash:password,role:"listener",status:"offline",isVerified:true});
    res.status(201).json({message:"Listener account created",listener:{id:listener._id,name:listener.name,email:listener.email,role:listener.role}});
  }
);

export default r;
