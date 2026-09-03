import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

async function main(): Promise<void> {
  await connectDatabase();
  console.log('[db] connected');

  const server = createApp().listen(env.PORT, () => {
    console.log(`[api] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  // Finish in-flight requests before the process goes away — deploys restart
  // this container regularly.
  const shutdown = (signal: string) => async () => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));
}

main().catch((err: unknown) => {
  console.error('[api] failed to start', err);
  process.exit(1);
});
