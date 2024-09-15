import { ApiHandler, Router, ShardManager } from 'seyfert';
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

if (!TOKEN) {
    throw new Error('Cannot start process without token');
}

if (!INTENTS && INTENTS !== 0) {
    throw new Error('Cannot start process without intents');
}

if (!BOT_PORT) {
    throw new Error('Cannot start process without BOT_PORT');
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
        });
    },
    token: TOKEN,
    intents: INTENTS,
    debug: rc.debug,
});

await ws.spawnShards();
