import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { ApiHandler, Logger, Router, ShardManager } from 'seyfert';
import {
    BaseClient,
    type InternalRuntimeConfig,
} from 'seyfert/lib/client/base.js';
import type { DeepPartial } from 'seyfert/lib/common';

const rc = (await BaseClient.prototype.getRC.call(
    {},
)) as unknown as DeepPartial<InternalRuntimeConfig>;

const TOKEN = rc.token;
const INTENTS = rc.intents;
const BOT_PORT = Number(process.env.BOT_PORT);
const WS_PORT = Number(process.env.WS_PORT);

if (!TOKEN) {
    throw new Error('Cannot start process without token');
}

if (!INTENTS && INTENTS !== 0) {
    throw new Error('Cannot start process without intents');
}

if (!BOT_PORT) {
    throw new Error('Cannot start process without BOT_PORT');
}

if (!WS_PORT) {
    throw new Error('Cannot start process without WS_PORT');
}

const rest = new ApiHandler({
    token: TOKEN,
});

const router = new Router(rest);

const ws = new ShardManager({
    info: await router.createProxy().gateway.bot.get(),
    async handlePayload(shardId, packet) {
        await fetch(`http://localhost:${BOT_PORT}/packet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                packet,
                shardId,
                authorization: TOKEN,
            }),
        }).catch(() => {
            // likely a network error
        });
    },
    token: TOKEN,
    intents: INTENTS,
    debug: rc.debug,
});

await ws.spawnShards();

const logger = new Logger({
    name: '[ShardManager]',
});

const app = new Hono();

app.get('/info', async (c) => {
    if (c.req.header('authorization') !== ws.options.token) {
        logger.fatal('Invalid authorization');
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

serve({
    fetch: app.fetch,
    port: WS_PORT,
});
