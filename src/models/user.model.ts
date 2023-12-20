import mongoose from "mongoose";
import { gravatar } from "../utils/gravatar";

export interface AuthToken {
  accessToken: string;
  kind: string;
}

export const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    picture: String,
    chats: [{ type: String }],
  },
  {
    methods: {
      async comparePassword(password: string) {
        if (!password) return false;

        return await Bun.password.verify(password, this.password);
      },
    },
    timestamps: true,
  }
);

export type User = mongoose.Document &
  mongoose.InferSchemaType<typeof userSchema>;

/**
 * Password hash middleware.
 */
userSchema.pre("save", async function save(next) {
  const user = this as User;

  // Not new user
  if (!user.isModified("id")) return next();

  user.chats = [];
  if (!user.picture) {
    user.picture = gravatar(user._id.toString());
  }
  const bcryptHash = await Bun.password.hash(user.password, {
    algorithm: "bcrypt",
  });

  user.password = bcryptHash;
  next();
});

export const User = mongoose.model<User>("User", userSchema, "User");
