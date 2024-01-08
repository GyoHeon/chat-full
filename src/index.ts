import { cookie } from "@elysiajs/cookie";
import { Elysia } from "elysia";

import { auth } from "./controllers/auth.controller";

const app = new Elysia();

app.use(cookie());

// AWS health check
app.get("/health", () => "OK");

// 404 Not Found
app.onError(({ code, set }) => {
  if (code === "NOT_FOUND") {
    set.status = 404;

    return "Page not found!";
  }
});

//auth
app.use(auth);

app.listen(process.env.PORT as string);

console.log(`Listening on http://localhost:${process.env.PORT} ...`);
