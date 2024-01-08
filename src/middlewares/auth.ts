import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const isAuthenticated = (app: Elysia) =>
  app
    .use(jwt({ secret: process.env.ACCESS_TOKEN_SECRET! }))
    .derive(async ({ headers, jwt, set }) => {
      const bearer = headers.authorization;

      const isBearer =
        typeof bearer === "string" && bearer.startsWith("Bearer ");

      if (!isBearer) {
        set.status = 403;

        return "Unauthorized";
      }

      const token = bearer.split(" ")[1];

      const decoded = await jwt.verify(token);
      const { id } = decoded as { id: string };

      return { userId: id };
    });
