import mongoose, { Schema, Document, Model } from "mongoose";

interface IChat extends Document {
  name: string;
  isGroupChat: boolean;
  lastMessage: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
}

const chatSchema = new Schema<IChat>(
  {
    name: {
      type: String,
      required: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);
