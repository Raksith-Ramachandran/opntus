import mongoose,{Document,Schema} from "mongoose";
export type ReportReason="harassment"|"inappropriate_content"|"spam"|"impersonation"|"technical_issue"|"other";
export interface IReport extends Document {
  sessionId:mongoose.Types.ObjectId; reporterType:"user"|"listener"; reason:ReportReason;
  description?:string; status:"pending"|"reviewed"|"resolved"|"dismissed";
  reviewedBy?:mongoose.Types.ObjectId; reviewedAt?:Date; actionTaken?:string; timestamp:Date;
}
const s = new Schema<IReport>({
  sessionId:    { type:Schema.Types.ObjectId, ref:"Session", required:true, index:true },
  reporterType: { type:String, enum:["user","listener"], required:true },
  reason:       { type:String, enum:["harassment","inappropriate_content","spam","impersonation","technical_issue","other"], required:true },
  description:  { type:String, maxlength:1000 },
  status:       { type:String, enum:["pending","reviewed","resolved","dismissed"], default:"pending", index:true },
  reviewedBy:   { type:Schema.Types.ObjectId, ref:"Listener" },
  reviewedAt:   Date,
  actionTaken:  { type:String, maxlength:500 },
  timestamp:    { type:Date, default:Date.now, index:true },
},{ versionKey:false });
export const Report = mongoose.model<IReport>("Report",s);
