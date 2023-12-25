import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { postSignup } from "./controllers/auth.controller";

const app = new Elysia();

app.use(jwt({ secret: process.env.ACCESS_TOKEN_SECRET as string }));

// AWS health check
app.get("/health", () => new Response("OK", { status: 200 }));

// 404 Not Found
app.onError(({ code, set }) => {
  if (code === "NOT_FOUND") {
    set.status = 404;

    return "Page not found!";
  }
});

export const TSignUp = {
  body: t.Object({
    id: t.String(),
    password: t.String(),
    name: t.String(),
    email: t.String(),
  }),
  set: t.Object({
    status: t.Number(),
  }),
};

//auth
app.get("/auth/signup", ({ body, set }) => postSignup({ body, set }), TSignUp);

app.listen(process.env.PORT as string);

console.log(`Listening on http://localhost:${process.env.PORT} ...`);
