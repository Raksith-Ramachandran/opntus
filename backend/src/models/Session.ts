import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  listenerId?: mongoose.Types.ObjectId;
  mood: string;
  communicationType: "text" | "voice" | "video";
  status: "queued" | "active" | "completed" | "abandoned";
  queuePosition?: number;
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  userRating?: number;
  userFeedback?: string;
  listenerHelpful?: boolean;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listenerId: {
      type: Schema.Types.ObjectId,
      ref: "Listener",
      index: true,
    },
    mood: {
      type: String,
      required: true,
      enum: [
        "stressed", "lonely", "anxious", "overthinking",
        "relationship", "academic", "work", "general",
      ],
    },
    communicationType: {
      type: String,
      enum: ["text", "voice", "video"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["queued", "active", "completed", "abandoned"],
      default: "queued",
      index: true,
    },
    queuePosition:   Number,
    startedAt:       Date,
    endedAt:         Date,
    durationSeconds: Number,
    userRating:      { type: Number, min: 1, max: 5 },
    userFeedback:    { type: String, maxlength: 1000 },
    listenerHelpful: Boolean,
    isFlagged:       { type: Boolean, default: false, index: true },
    flagReason:      { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Single TTL index
sessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

export const Session = mongoose.model<ISession>("Session", sessionSchema);