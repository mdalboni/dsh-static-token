import assert from 'node:assert';
import { Context } from '/home/mdalboni/.local/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/cordis/lib/index.js';
import * as plugin from './index.js';

const connLib = await import('/home/mdalboni/.local/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-client-connection/lib/index.js');

// 1. Test token from config
{
  const ctx = new Context();
  ctx.provide('credentials', { modifyRecord: async (_, fn) => fn(undefined) });
  await ctx.plugin(connLib, { trustedHosts: ['dsh.lab.dalboni.com.br'] });
  await ctx.plugin(plugin, { token: 'token-from-config-123' });

  assert.strictEqual(ctx.connection.browserAuth.launchToken, 'token-from-config-123');
  const url = ctx.connection.authenticatedUrl('https://dsh.lab.dalboni.com.br');
  assert.strictEqual(url, 'https://dsh.lab.dalboni.com.br/?token=token-from-config-123');
}

// 2. Test token from environment
{
  process.env.DSH_WEB_TOKEN = 'token-from-env-456';
  const ctx = new Context();
  ctx.provide('credentials', { modifyRecord: async (_, fn) => fn(undefined) });
  await ctx.plugin(connLib, { trustedHosts: ['dsh.lab.dalboni.com.br'] });
  await ctx.plugin(plugin, {});

  assert.strictEqual(ctx.connection.browserAuth.launchToken, 'token-from-env-456');
  delete process.env.DSH_WEB_TOKEN;
}

// 3. Test authorizeIndex with matching static token
{
  const ctx = new Context();
  ctx.provide('credentials', { modifyRecord: async (_, fn) => fn(undefined) });
  await ctx.plugin(connLib, { trustedHosts: ['dsh.lab.dalboni.com.br'] });
  await ctx.plugin(plugin, { token: 'my-static-token-secret-123' });

  let status = 0;
  let headers = {};
  const mockReq = {
    method: 'GET',
    url: '/?token=my-static-token-secret-123',
    headers: { host: 'dsh.lab.dalboni.com.br' }
  };
  const mockRes = {
    writeHead: (code, h) => { status = code; headers = h; },
    end: () => {}
  };
  ctx.connection.authorizeIndex(mockReq, mockRes);
  assert.strictEqual(status, 303);
  assert.ok(headers['set-cookie']);
}

// 4. Test minimum length validation (< 16 characters throws)
{
  const ctx = new Context();
  assert.throws(
    () => plugin.apply(ctx, { token: 'too-short' }),
    /static token must be at least 16 characters long/
  );
}

console.log('dsh-static-token tests passed.');
