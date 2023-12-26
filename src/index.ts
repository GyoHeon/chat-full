import { cookie } from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

import { postSignup } from "./controllers/auth.controller";

const app = new Elysia();

app
  .use(jwt({ secret: process.env.ACCESS_TOKEN_SECRET as string }))
  .use(cookie());

// AWS health check
app.get("/health", () => new Response("OK", { status: 200 }));

// 404 Not Found
app.onError(({ code, set }) => {
  if (code === "NOT_FOUND") {
    set.status = 404;

    return "Page not found!";
  }
});

//auth
app.use(postSignup);

app.listen(process.env.PORT as string);

console.log(`Listening on http://localhost:${process.env.PORT} ...`);
