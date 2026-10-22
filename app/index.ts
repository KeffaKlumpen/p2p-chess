import myReactSinglePageApp from "./index.html";

const STATIC_PATH = "app/static";

const server = Bun.serve({
  routes: {
    "/": myReactSinglePageApp,

    "/chesspieces/:theme/:piece": req => {
      return new Response(Bun.file(`${STATIC_PATH}/chesspieces/${req.params.theme}/${req.params.piece}`));
    },

    // Wildcard route for all routes that start with "/api/" and aren't otherwise matched
    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),

    // Redirect from /blog/hello to /blog/hello/world
    "/blog/hello": Response.redirect("/blog/hello/world"),

    // Serve a file by lazily loading it into memory
    "/favicon.ico": new Response(Bun.file(`${STATIC_PATH}/favicon.ico`)),
  },
});

console.log(`Server running at ${server.url}`);