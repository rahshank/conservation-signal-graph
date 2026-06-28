import { createServer } from "node:http";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4178);
const { app, graphRepository } = await createApp();
const server = createServer(app);

if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
}

server.listen(port, "127.0.0.1", () => {
  console.log(`Ethogram Graph running at http://127.0.0.1:${port}`);
});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function shutdown() {
  server.close();
  await graphRepository.close();
  process.exit(0);
}
