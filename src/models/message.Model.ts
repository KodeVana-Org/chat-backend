import mongoose, { Schema, Document, Model } from "mongoose";

interface IAttachment {
  url: string;
  localPath: string;
}

interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  attachments: IAttachment[];
  chat: mongoose.Types.ObjectId;
}

const attachmentSchema = new Schema<IAttachment>({
  url: { type: String, required: true },
  localPath: { type: String, required: true },
});

const chatMessageSchema = new Schema<IChatMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    //might be the cloudinary url ,TODO:todo
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  { timestamps: true },
);

export const ChatMessage: Model<IChatMessage> = mongoose.model<IChatMessage>(
  "ChatMessage",
  chatMessageSchema,
);
