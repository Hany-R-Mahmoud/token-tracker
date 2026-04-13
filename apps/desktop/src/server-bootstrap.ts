import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

export interface ServerConfig {
  port: number;
  host: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

export function createDesktopServer(
  handleRequest: (request: IncomingMessage, response: ServerResponse) => void,
): ReturnType<typeof createServer> {
  return createServer(handleRequest);
}

export function startServer(
  server: ReturnType<typeof createServer>,
  config: ServerConfig,
  onListen?: () => void,
): void {
  server.listen(config.port, config.host, () => {
    onListen?.();
  });
}

export function createDefaultServerConfig(): ServerConfig {
  return {
    port: Number(process.env.TTM_DESKTOP_PORT ?? '3100'),
    host: '127.0.0.1',
    rateLimitWindowMs: 60 * 1000,
    rateLimitMaxRequests: 60,
  };
}