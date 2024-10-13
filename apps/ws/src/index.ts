import { serve } from '@hono/node-server';
import { createClient } from '@redis/client';
import { config } from '@repo/config';
import { Hono } from 'hono';
import { ApiHandler, Logger, ShardManager } from 'seyfert';

const rest = new ApiHandler({
    token: config.rc.token,
});

const redisClient = createClient();
await redisClient.connect();
const ws = new ShardManager({
    info: await rest.proxy.gateway.bot.get(),
    handlePayload(s, p) {
        return redisClient.publish(
            'gateway',
            JSON.stringify({
                s,
                p,
            }),
        );
    },
    token: config.rc.token,
    intents: config.rc.intents,
    debug: config.rc.debug,
});

await ws.spawnShards();
const logger = new Logger({
    name: '[APIWebSocket]',
});

const app = new Hono();

app.get('/info', async (c) => {
    if (c.req.header('authorization') !== ws.options.token) {
        logger.warn('Invalid auth', c.req.header('authorization'));
        c.status(418);
        return c.text('Invalid authorization');
    }

    return c.json({
        latency: ws.latency,
        shards: [...ws.values()].map((shard) => ({
            data: shard.data,
            heart: {
                ack: shard.heart.ack,
                interval: shard.heart.interval,
                lastAck: shard.heart.lastAck,
                lastBeat: shard.heart.lastBeat,
            },
            latency: shard.latency,
            id: shard.id,
        })),
    });
});

app.get('/stats', (c) =>
    c.json({
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
    }),
);

serve(
    {
        fetch: app.fetch,
        port: config.wsPort,
    },
    (address) => {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log(`Listening to ${address.port}`);
    },
);
