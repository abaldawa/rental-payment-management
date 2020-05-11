/**
 * User: abhijit.baldawa
 *
 * This middleware module is used to log response time for HTTP calls
 */
import { Context, Next } from 'koa';
import logger from '../logger/logger';

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
  } finally {
    const rt = Date.now() - start;
    logger.info(`${ctx.status} ${ctx.method} ${ctx.url} - ${rt}ms`);
  }
}

export default logResponseTime;
