import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

import { Token } from "@/models/token.model";
import { User } from "@/models/user.model";
import { t_patchUser, t_postRefresh, t_user } from "@/types/elysia/user";
import { sendError } from "@/utils/error";
import { comparePassword } from "@/utils/user";

export const postSignup = async (app: Elysia) =>
  app.post(
    "/signup",
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

        const user = new User({
          id,
          name,
          password,
          picture,
        });

        await user.save();

        return { message: "User created" };
      } catch (error) {
        return sendError({ error, set, log: "postSignup error" });
      }
    },
    t_user
  );

export const postCheckDuplicateId = async (app: Elysia) =>
  app.post(
    "/check/id",
    async ({ body, set }) => {
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
      } catch (error) {
        return sendError({ error, set, log: "postCheckDuplicatedId error" });
      }
    },
    t_user
  );

export const postRefresh = async (app: Elysia) =>
  app.use(jwt({ secret: process.env.ACCESS_TOKEN_SECRET! })).post(
    "/refresh",
    async ({ body, set, jwt }) => {
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
        const accessToken = jwt.sign({
          id,
          expiresIn: "7d",
        });
        return accessToken;
      } catch (error) {
        return sendError({ error, set, log: "postRefresh error" });
      }
    },
    t_postRefresh
  );

export const patchUser = async (app: Elysia) =>
  app.use(jwt({ secret: process.env.ACCESS_TOKEN_SECRET! })).patch(
    "/user",
    async ({ body, jwt, set }) => {
      const { name, picture } = body;
      if (!(name || picture)) {
        set.status = 400;

        return "Invalid request";
      }

      const newData = {
        ...(name && { name }),
        ...(picture && { picture }),
      };

      const { user } = body;

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

          return "User updated";
        }
      } catch (error) {
        return sendError({ error, set, log: "patchUser error" });
      }
    },
    t_patchUser
  );

export const getUser = async (app: Elysia) =>
  app.get("/user", async ({ query, set }) => {
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
    } catch (error) {
      return sendError({ error, set, log: "getUser error" });
    }
  });

export const authMe = async (app: Elysia) =>
  app
    .use(jwt({ secret: process.env.ACCESS_TOKEN_SECRET! }))
    .get("/me", async ({ headers, set, jwt }) => {
      const { authorization } = headers;
      const token = authorization?.split(" ")[1];
      const isTokenInvalid =
        !token || token === "null" || token === "undefined";

      if (isTokenInvalid) {
        set.status = 400;

        return { auth: false };
      }

      try {
        const isValid = await jwt.verify(token);
        if (!isValid) {
          set.status = 400;

          return { auth: false };
        }

        const { id } = isValid;

        if (!id) {
          set.status = 400;

          return { auth: false };
        } else {
          const userFromDb = await User.findOne({ id });

          if (!userFromDb) {
            set.status = 400;

            return { auth: false };
          }

          const responseUser = {
            id: id,
            name: userFromDb.name,
            picture: userFromDb.picture,
          };

          return { auth: true, user: responseUser };
        }
      } catch (error) {
        return sendError({ error, set, log: "authMe error" });
      }
    });

export const postLogin = async (app: Elysia) =>
  app.use(jwt({ secret: process.env.ACCESS_TOKEN_SECRET! })).post(
    "/login",
    async ({ body, set, jwt }) => {
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

      const accessToken = jwt.sign({ id, expiresIn: "7d" });
      const refreshToken = jwt.sign({ id, expiresIn: "2w" });

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
      } catch (error) {
        return sendError({ error, set, log: "postLogin error" });
      }
    },
    t_user
  );

export const auth = (app: Elysia) =>
  app.group("/auth", (app) =>
    app
      .use(getUser)
      .use(authMe)
      .use(postSignup)
      .use(postCheckDuplicateId)
      .use(postRefresh)
      .use(postLogin)
      .use(patchUser)
  );
