export const name = 'dsh-static-token';
export const inject = ['connection'];

export function apply(ctx, config) {
  // ponytail: override in-memory launch token; upgrade if multi-user session tokens are added.
  const token = (process.env.DSH_WEB_TOKEN && process.env.DSH_WEB_TOKEN.trim()) || (config?.token && String(config.token).trim());
  if (token && ctx.connection?.browserAuth) {
    ctx.connection.browserAuth.launchToken = token;
  }
}
