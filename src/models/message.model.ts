import mongoose from "mongoose";

// Message

export type MessageDocument = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  text: string;
  userId: string;

  createdAt: Date;
};

export const messageSchema = new mongoose.Schema<MessageDocument>(
  {
    _id: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    userId: { type: String, required: true },
    createdAt: Date,
  },
  { timestamps: true }
);

messageSchema.pre("init", function save(next) {
  const message = this as MessageDocument;
  if (!message.text.trim()) {
    throw new Error("Text cannot be empty");
  }
  if (message.text.length > 1000) {
    throw new Error("Text cannot be longer than 1000 characters");
  }

  return next();
});

export const Message = mongoose.model<MessageDocument>(
  "Message",
  messageSchema,
  "Message"
);

// MessageList

export type MessageListDocument = mongoose.Document & {
  _id: mongoose.Types.ObjectId;

  updatedAt: Date;
};

export const messageListSchema = new mongoose.Schema<MessageListDocument>(
  {
    _id: { type: String, required: true, unique: true },
    updatedAt: Date,
  },
  { timestamps: true }
);

messageSchema.pre("init", function save(next) {
  const message = this as MessageDocument;
  if (!message.text.trim()) {
    throw new Error("Text cannot be empty");
  }
  if (message.text.length > 1000) {
    throw new Error("Text cannot be longer than 1000 characters");
  }

  return next();
});

export const MessageList = mongoose.model<MessageListDocument>(
  "MessageList",
  messageListSchema,
  "MessageList"
);
