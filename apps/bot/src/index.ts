import { join } from 'node:path';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Client, type ParseClient } from 'seyfert';
import type { GatewayDispatchPayload } from 'seyfert/lib/types';
import { getConfig } from './utils/config.js';

const client = new Client();

await client.start({}, false);

await client.uploadCommands({
    cachePath: join(process.cwd(), '_seyfert_cache.json'),
});

const { BOT_PORT } = getConfig();

const app = new Hono();

app.post('/packet', async (c) => {
    const body: {
        shardId: number;
        authorization: string;
        packet: GatewayDispatchPayload;
    } = await c.req.json();
    if (body?.authorization !== client.rest.options.token) {
        c.status(418);
        return c.text('Invalid authorization');
    }
    await client.gateway.options.handlePayload(body.shardId, body.packet);
    return;
});

serve({
    fetch: app.fetch,
    port: BOT_PORT,
});

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> {}
}
