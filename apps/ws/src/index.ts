import { serve } from '@hono/node-server';
import { config } from '@repo/config';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ApiHandler, Logger, ShardManager } from 'seyfert';
import { PotoSocket } from './socket.js';

const rest = new ApiHandler({
    token: config.rc.token,
});

const socket = new PotoSocket(
    new Logger({
        name: '[WS_0]',
    }),
    config.port.bot,
);

const ws = new ShardManager({
    info: await rest.proxy.gateway.bot.get(),
    handlePayload(shardId, packet) {
        return socket.send(shardId, packet);
    },
    token: config.rc.token,
    intents: config.rc.intents,
    debug: config.rc.debug,
});

socket.connect();
await ws.spawnShards();

const logger = new Logger({
    name: '[APIWebSocket]',
});

const app = new Hono();

app.use((c, next) => {
    const auth = c.req.header('Authorization');
    if (auth === config.auth.ws) {
        return next();
    }
    throw new HTTPException(418, {
        message: 'Invalid authorization header',
    });
});

app.get('/info', async (c) => {
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
        port: config.port.ws,
    },
    (address) => {
        logger.info(`Listening to ${address.port}`);
    },
);
