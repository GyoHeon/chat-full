import * as authController from "@/controllers/auth.controller";
import Elysia from "elysia";

const auth = (app: Elysia) =>
  app.group("/auth", (app) =>
    app
      .use(authController.getUser)
      .use(authController.authMe)
      .use(authController.postSignup)
      .use(authController.postCheckDuplicateId)
      .use(authController.postRefresh)
      .use(authController.postLogin)
      .use(authController.patchUser)
  );

export const route = (app: Elysia) => app.use(auth);
