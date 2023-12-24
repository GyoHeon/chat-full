import mongoose from "mongoose";

export type TUser = {
  _id: mongoose.Types.ObjectId;
  id: string;
  password: string;
  name: string;
  picture: string;
  chats: string[];
};
