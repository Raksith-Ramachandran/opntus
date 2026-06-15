import mongoose,{Document,Schema} from "mongoose";
export interface IUser extends Document {
  sessionId:string; anonymousName:string; mood:string; ipHash?:string;
  isBanned:boolean; bannedAt?:Date; bannedReason?:string; createdAt:Date; lastActiveAt:Date;
}
const s = new Schema<IUser>({
  sessionId:    { type:String, required:true, unique:true, index:true },
  anonymousName:{ type:String, required:true, maxlength:30, match:/^[a-zA-Z0-9]+$/ },
  mood:         { type:String, required:true, enum:["stressed","lonely","anxious","overthinking","relationship","academic","work","general"] },
  ipHash:       { type:String, select:false },
  isBanned:     { type:Boolean, default:false, index:true },
  bannedAt:     Date,
  bannedReason: { type:String, maxlength:500 },
  lastActiveAt: { type:Date, default:Date.now },
},{ timestamps:true, versionKey:false });
s.index({ createdAt:1 },{ expireAfterSeconds:90*24*60*60 });
export const User = mongoose.model<IUser>("User",s);
