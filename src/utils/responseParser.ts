import type { User } from "@/models/user.model";

export const userResponseParser = (user: User) => {
  const { id, name, picture } = user;
  return {
    id,
    name,
    picture,
  };
};
