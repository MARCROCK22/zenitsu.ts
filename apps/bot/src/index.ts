import {
    type UsingClient as NoShadowUsingClient,
    type ParseMiddlewares,
    type ParseLocales,
    type ParseClient,
    Client
} from 'seyfert';
import {
    type GatewayDispatchPayload,
    MessageFlags
} from 'seyfert/lib/types/index.js';
import { isAnyArrayBuffer } from 'node:util/types';
import { config } from '@repo/config';
import { WebSocketServer } from 'ws';
import { join } from 'node:path';
import MeowDB from 'meowdb';

import type DefaultLang from './locales/en.js';

import { QueueManager } from './manager/queue.js';
import { allMiddlewares } from './middlewares.js';
import { ApiManager } from './api/apiManager.js';
import { GameManager } from './manager/game.js';
import { WsManager } from './api/wsManager.js';

const client = new Client({
    getRC() {
        return config.rc;
    },
    commands: {
        defaults: {
            onRunError(ctx, error) {
                client.logger.error(
                    ctx.author.id,
                    ctx.author.username,
                    ctx.fullCommandName,
                    error
                );
                const content = `\`\`\`${error instanceof Error
                    ? error.stack ?? error.message
                    : String(error) || `Unknown error`
                    }\`\`\``;

                return ctx.editOrReply({
                    content
                });
            },
            onMiddlewaresError(ctx, error) {
                return ctx.editOrReply({
                    content: error,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
    globalMiddlewares: [`checkIfRestarting`]
}) as unknown as NoShadowUsingClient & Client;
client.ws = new WsManager();
client.api = new ApiManager();
client.games = new GameManager(client);
client.queue = new QueueManager(client);
client.meowdb = new MeowDB<`raw`>({
    dir: join(process.cwd(), `cache`),
    name: `games`,
    raw: true
});

client.setServices({
    cache: {
        disabledCache: true
    },
    middlewares: allMiddlewares,
    langs: {
        default: `en`,
        aliases: {
            en: [`en-GB`, `en-US`],
            es: [`es-419`, `es-ES`]
        }
    }
});
client.queue.start();
// Await client.games.syncFromCache();
await client.start({}, false);
await client.uploadCommands({
    cachePath: join(process.cwd(), `_seyfert_cache.json`)
});

const server = new WebSocketServer({
    port: config.port.bot
});

server.on(`connection`, (socket) => {
    socket.on(`message`, (raw) => {
        if (isAnyArrayBuffer(raw)) {
            throw new Error(`Invalid data`);
        }
        const { shardId, packet, key } = JSON.parse(raw.toString()) as {
            shardId: number;
            packet: GatewayDispatchPayload;
            key: string;
        };
        if (key !== config.auth.ws) {
            // Xd?
            socket.close();
            return;
        }

        return client.gateway.options.handlePayload(shardId, packet);
    });
});

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<false>> {
        ws: WsManager;
        api: ApiManager;
        games: GameManager;
        queue: QueueManager;
        restarting?: true;
        meowdb: MeowDB;
    }

    interface RegisteredMiddlewares
        extends ParseMiddlewares<typeof allMiddlewares> { }

    interface DefaultLocale extends ParseLocales<typeof DefaultLang> { }
}
