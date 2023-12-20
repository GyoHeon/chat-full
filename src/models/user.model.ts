import mongoose from "mongoose";

export type UserDocument = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  id: string;
  password: string;
  name: string;
  picture: string;
  chats: string[];

  gravatar: () => string;
};

export interface AuthToken {
  accessToken: string;
  kind: string;
}

export const userSchema = new mongoose.Schema<UserDocument>(
  {
    id: { type: String, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    picture: String,
    chats: Array,
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", async function save(next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  }
  user.chats = [];
  if (!user.picture) {
    user.picture = user.gravatar();
  }
  const bcryptHash = await Bun.password.hash(user.password, {
    algorithm: "bcrypt",
  });

  user.password = bcryptHash;
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  if (!password) return false;

  return await Bun.password.verify(password, this.password);
};

export const User = mongoose.model<UserDocument>("User", userSchema, "User");
