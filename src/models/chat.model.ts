import mongoose, { Types } from "mongoose";
import { MessageList } from "./message.model";

export type ChatDocument = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  isPrivate: boolean;
  users: string[];
  messageId: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
};

export const chatSchema = new mongoose.Schema<ChatDocument>(
  {
    _id: { type: String, required: true, unique: true },
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

  const newMessageList = new MessageList({});

  chat.messageId = newMessageList._id;

  return next();
});

export const Chat = mongoose.model<ChatDocument>("Chat", chatSchema, "Chat");
