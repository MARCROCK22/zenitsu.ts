import { ApiHandler, Router, ShardManager } from 'seyfert';
import 'dotenv/config';
import {
    BaseClient,
    type InternalRuntimeConfig,
} from 'seyfert/lib/client/base';
import type { DeepPartial } from 'seyfert/lib/common';

const rc = (await BaseClient.prototype.getRC.call(
    undefined,
)) as unknown as DeepPartial<InternalRuntimeConfig>;

const TOKEN = rc.token;
const INTENTS = rc.intents;

if (!TOKEN) {
    throw new Error('Cannot start process without token');
}

if (!INTENTS && INTENTS !== 0) {
    throw new Error('Cannot start process without intents');
}

const rest = new ApiHandler({
    token: TOKEN,
});

const router = new Router(rest);

const ws = new ShardManager({
    info: await router.createProxy().gateway.bot.get(),
    handlePayload(shardId, packet) {
        return { shardId, packet };
    },
    token: TOKEN,
    intents: INTENTS,
});

await ws.spawnShards();
