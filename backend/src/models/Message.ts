import mongoose,{Document,Schema} from "mongoose";
export interface IMessage extends Document {
  sessionId:mongoose.Types.ObjectId; senderType:"user"|"listener"|"system";
  message:string; isDeleted:boolean; timestamp:Date;
}
const s = new Schema<IMessage>({
  sessionId:  { type:Schema.Types.ObjectId, ref:"Session", required:true, index:true },
  senderType: { type:String, enum:["user","listener","system"], required:true },
  message:    { type:String, required:true, maxlength:5000, trim:true },
  isDeleted:  { type:Boolean, default:false },
  timestamp:  { type:Date, default:Date.now, index:true },
},{ versionKey:false });
s.index({ timestamp:1 },{ expireAfterSeconds:30*24*60*60 });
s.set("toJSON",{ transform:(_d,r)=>{ if(r.isDeleted) r.message="[Message deleted]"; return r; } });
export const Message = mongoose.model<IMessage>("Message",s);
