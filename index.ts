const server = Bun.serve({
  port: process.env.PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") return new Response("OK", { status: 200 });

    return new Response("404!", { status: 404 });
  },
  error(error) {
    return new Response(error.message, { status: 500 });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
