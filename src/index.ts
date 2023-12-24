import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { postSignup } from "./controllers/auth.controller";
import { TSignUp } from "./types/api/req";

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

//auth
app.get("/auth/signup", (req: TSignUp) => postSignup(req));

app.listen(process.env.PORT as string);

console.log(`Listening on http://localhost:${process.env.PORT} ...`);
