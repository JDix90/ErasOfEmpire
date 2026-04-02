import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from './config';

/**
 * Global Fastify error handler: log full detail server-side; avoid leaking stacks to clients in production.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const reqId = request.id;
    const statusCode = error.statusCode ?? 500;

    request.log.error(
      { err: error, reqId, url: request.url, method: request.method },
      error.message,
    );

    if (reply.sent) return;

    const isClientError = statusCode >= 400 && statusCode < 500;
    const body: { error: string; code?: string; reqId?: string; details?: unknown } = {
      error: isClientError ? error.message : 'Internal server error',
      reqId,
    };

    if (error.code) body.code = String(error.code);
    if (config.nodeEnv === 'development' && error.validation) {
      body.details = error.validation;
    }
    if (config.nodeEnv === 'development' && !isClientError) {
      body.error = error.message;
    }

    reply.status(statusCode).send(body);
  });
}
