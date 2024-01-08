import mongoose from "mongoose";

import { User } from "@/models/user.model";

await mongoose.connect(process.env.MONGO_URL as string);

const newPeople = new User({
  id: "test1",
  password: "test",
  name: "test",
});

await newPeople.save();
