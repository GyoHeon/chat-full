import mongoose, { Types } from "mongoose";

export type ChatDocument = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  isPrivate: boolean;
  users: string[];
  messageId: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
};

export const chatSchema = new mongoose.Schema<ChatDocument>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    users: Array,
    messageId: Types.ObjectId,
    isPrivate: Boolean,
  },
  {
    timestamps: true,
  }
);

chatSchema.pre("save", function (next) {
  const chat = this as ChatDocument;

  chat.messageId = new mongoose.Types.ObjectId();

  return next();
});

export const Chat = mongoose.model<ChatDocument>("Chat", chatSchema, "Chat");
