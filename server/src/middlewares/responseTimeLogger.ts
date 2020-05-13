/**
 * User: abhijit.baldawa
 *
 * This middleware module is used to log response time for HTTP calls
 */
import { Context, Next } from 'koa';
import logger from '../logger/logger';

/**
 * Logs request time taken
 * @param statusCode - HTTP status code
 * @param method - HTTP method
 * @param url - URL of the request
 * @param responseTime - time taken by request
 * @param responseTimeUnit - ms or seconds
 * @param warn - log as warning
 */
function log(statusCode: number, method: string, url: string, responseTime: number, responseTimeUnit: string, warn?: boolean): void {
  const methodName = warn ? 'warn' : 'info';
  logger[methodName](`${statusCode} ${method} ${url} - ${responseTime}${responseTimeUnit}`);
}

/**
 * @public
 *
 * This method logs the response time for HTTP requests made to the server
 *
 * @param {Object} ctx - koa context object (see: https://koajs.com/#context)
 * @param {Context} next - koa function to call next middleware
 * @returns {Promise<void>}
 */
async function logResponseTime(ctx: Context, next: Next): Promise<void> {
  const start = Date.now();

  try {
    await next();

    const rt = Date.now() - start;
    log(ctx.status, ctx.method, ctx.url, rt, 'ms', false);
  } catch (err) {
    const statusCode = err.statusCode || err.status || 500;
    const rt = Date.now() - start;

    log(statusCode, ctx.method, ctx.url, rt, 'ms', true);
    throw err;
  }
}

export default logResponseTime;
