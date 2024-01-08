import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

export const isAuthenticated = (app: Elysia) =>
  app
    .use(jwt({ secret: process.env.ACCESS_TOKEN_SECRET! }))
    .derive(async ({ headers, jwt, set }) => {
      const bearer = headers.authorization;

      const isBearer =
        typeof bearer === "string" && bearer.startsWith("Bearer ");

      if (!isBearer) {
        set.status = 403;

        return {
          success: false,
          message: "Unauthorized",
        };
      }

      const token = bearer.split(" ")[1];

      const decoded = await jwt.verify(token);
      if (!decoded) {
        set.status = 403;

        return {
          success: false,
          message: "Unauthorized",
        };
      }

      const { id } = decoded as { id: string };

      if (!id) {
        set.status = 403;

        return {
          success: false,
          message: "Unauthorized",
        };
      }

      return { userId: id };
    });
