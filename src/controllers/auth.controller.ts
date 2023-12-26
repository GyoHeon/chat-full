import { JWTPayloadSpec } from "@elysiajs/jwt";
import { Elysia, InputSchema, t } from "elysia";

import { TSignUp } from "@/index";
import { Token } from "@/models/token.model";
import { User } from "@/models/user.model";
import { TUser } from "@/types/user";
import { comparePassword } from "@/utils/user";

export const postSignup = async (app: Elysia) =>
  app.get(
    "/auth/signup",
    async ({ body, set }) => {
      const { id, password, name, picture } = body;

      const isInvalidRequest =
        !id ||
        !id.match(/^[a-zA-Z0-9]+$/) ||
        !password ||
        password.length < 5 ||
        !name;

      if (isInvalidRequest) {
        set.status = 400;

        return { message: "Invalid request" };
      }

      try {
        const existingUser = await User.findOne({ id });

        if (existingUser) {
          set.status = 401;

          return { message: "Account with that id address already exists." };
        }
      } catch (err) {
        set.status = 500;

        return { message: "Internal server error" };
      }

      try {
        const user = new User({
          id,
          name,
          password,
          picture,
        });

        await user.save();

        return { message: "User created" };
      } catch (err) {
        console.error(err);

        set.status = 500;

        return { message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        id: t.String(),
        password: t.String(),
        name: t.String(),
        email: t.String(),
        picture: t.String(),
      }),
      set: t.Object({
        status: t.Number(),
      }),
    }
  );

export const postCheckDuplicateId = async ({ body, set }: typeof TSignUp) => {
  const { id } = body;

  const isInvalidRequest = !id || !id.match(/^[a-zA-Z0-9]+$/);

  try {
    if (isInvalidRequest) {
      set.status = 401;

      return { message: "Invalid request" };
    }

    const existingUser = await User.findOne({ id });

    if (existingUser) {
      return { isDuplicated: true };
    }

    return { isDuplicated: false };
  } catch (err) {
    console.error(err);

    set.status = 500;

    return { message: "Internal server error" };
  }
};

export const postRefresh = async ({ body, set, jwt }: InputSchema) => {
  const { refreshToken } = body;

  if (!refreshToken) {
    set.status = 403;

    return { message: "Unauthorized" };
  }

  try {
    const decoded = await jwt.verify(refreshToken);
    const { id } = decoded as { id: string };

    const existingToken = await Token.findOne({ userId: id });
    if (!existingToken) {
      set.status = 403;

      return "Unauthorized";
    }

    const user = await User.findOne({ id });
    if (!user) {
      set.status = 403;

      return "Unauthorized";
    }
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "7d",
    });
    return accessToken;
  } catch (err) {
    console.error(err);

    set.status = 500;

    return { message: "Internal server error" };
  }
};

export const patchUser = async ({ body, set }) => {
  const { name, picture } = body;
  if (!(name || picture)) {
    set.status = 400;

    return "Invalid request";
  }

  const newData = {
    [name && "name"]: name,
    [picture && "picture"]: picture,
  };

  const user = body.user;

  try {
    const userFromDb = await User.findOne({ id: user.id });

    if (!userFromDb) {
      set.status = 403;

      return "Unauthorized";
    } else {
      if (newData.name) {
        await userFromDb.updateOne({
          name: newData.name,
        });
      }
      if (newData.picture) {
        await userFromDb.updateOne({
          picture: newData.picture,
        });
      }

      set.status = 200;

      return "User updated";
    }
  } catch (err) {
    console.error(err);

    set.status = 500;

    return { message: "Internal server error" };
  }
};

export const getUser = async ({ query, set }) => {
  const id = query.userId as string;

  if (!id && typeof id !== "string") {
    set.status = 400;

    return { message: "Invalid id" };
  }

  try {
    const userFromDb = await User.findOne({ id });

    if (!userFromDb) {
      set.status = 403;

      return { message: "Unauthorized" };
    }

    const responseUser = {
      id: userFromDb.id,
      name: userFromDb.name,
      picture: userFromDb.picture,
    };

    return { user: responseUser };
  } catch (err) {
    console.error(err);

    set.status = 500;

    return { message: "Internal server error" };
  }
};

export const authMe = async ({ headers, user, set, jwt }) => {
  const { authorization } = headers;
  const token = authorization?.split(" ")[1];
  const isTokenInvalid = !token || token === "null" || token === "undefined";

  if (isTokenInvalid) {
    set.status = 400;

    return { auth: false };
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user: TUser) => {
      if (user?.id) {
        user = user as JWTPayloadSpec as TUser;
      }
    });

    if (!user) {
      set.status = 400;

      return { auth: false };
    } else {
      const userFromDb = await User.findOne({ id: req.user.id });

      if (!userFromDb) {
        set.status = 400;

        return { auth: false };
      }

      const responseUser = {
        id: user.id,
        name: userFromDb.name,
        picture: userFromDb.picture,
      };

      return { auth: true, user: responseUser };
    }
  } catch (err) {
    console.error(err);

    set.status = 500;

    return { message: "Internal server error" };
  }
};

export const postLogin = async ({ body, set, jwt }) => {
  const { id, password } = body;

  const user = await User.findOne({ id });
  if (!user) {
    set.status = 401;

    return { message: "Invalid id" };
  }

  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    set.status = 401;

    return { message: "Invalid password" };
  }

  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "2w",
  });

  const token = {
    userId: id,
    token: refreshToken,
    expires: new Date(Date.now() + 3600000 * 24 * 7),
  };
  try {
    const existingToken = await Token.findOne({ userId: id });
    if (existingToken) {
      await Token.updateOne({ userId: id }, token);
    } else {
      const newToken = new Token(token);
      await newToken.save();
    }

    return { accessToken, refreshToken };
  } catch (err) {
    console.error(err);

    set.status = 401;

    return { message: "Invalid id or password" };
  }
};
