import mongoose,{Document,Schema} from "mongoose";
import bcrypt from "bcryptjs";
export interface IListener extends Document {
  name:string; email:string; passwordHash:string; role:"listener"|"admin";
  status:"online"|"busy"|"offline"|"suspended"; isVerified:boolean; bio?:string;
  totalSessions:number; averageRating:number; totalRatings:number;
  createdAt:Date; lastLoginAt?:Date;
  comparePassword(p:string):Promise<boolean>;
}
const s = new Schema<IListener>({
  name:         { type:String, required:true, trim:true, maxlength:100 },
  email:        { type:String, required:true, unique:true, lowercase:true, trim:true, match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  passwordHash: { type:String, required:true, select:false },
  role:         { type:String, enum:["listener","admin"], default:"listener" },
  status:       { type:String, enum:["online","busy","offline","suspended"], default:"offline", index:true },
  isVerified:   { type:Boolean, default:false },
  bio:          { type:String, maxlength:500 },
  totalSessions:{ type:Number, default:0 },
  averageRating:{ type:Number, default:0, min:0, max:5 },
  totalRatings: { type:Number, default:0 },
  lastLoginAt:  Date,
},{ timestamps:true, versionKey:false });
s.pre("save", async function(next){ if(!this.isModified("passwordHash")) return next(); const salt=await bcrypt.genSalt(12); this.passwordHash=await bcrypt.hash(this.passwordHash,salt); next(); });
s.methods.comparePassword = async function(p:string){ return bcrypt.compare(p,this.passwordHash); };
s.set("toJSON",{ transform:(_d,r)=>{ delete r.passwordHash; return r; } });
export const Listener = mongoose.model<IListener>("Listener",s);
