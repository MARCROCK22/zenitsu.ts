import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Client } from 'seyfert';
import type { GatewayDispatchPayload } from 'seyfert/lib/types';

const client = new Client();

await client.start({}, false);

const app = new Hono();

app.post('/packet', async (c) => {
    const body: {
        shardId: number;
        authorization: string;
        packet: GatewayDispatchPayload;
    } = await c.req.json();
    if (body?.authorization !== client.rest.options.token) {
        client.logger.fatal('Invalid authorization');
        return c.status(418);
    }
    await client.gateway.options.handlePayload(body.shardId, body.packet);
});

serve({
    fetch: app.fetch,
    port: 2807,
});
