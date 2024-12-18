import { join } from 'node:path';
import { config } from '@repo/config';
import MeowDB from 'meowdb';
import {
    Client,
    type ParseClient,
    type ParseLocales,
    type ParseMiddlewares,
    type UsingClient,
} from 'seyfert';
import {
    type GatewayDispatchPayload,
    MessageFlags,
} from 'seyfert/lib/types/index.js';
import { WebSocketServer } from 'ws';
import { ApiManager } from './api/apiManager.js';
import { WsManager } from './api/wsManager.js';
import type DefaultLang from './locales/en.js';
import { GameManager } from './manager/game.js';
import { allMiddlewares } from './middlewares.js';

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
                    error,
                );
                const content = `\`\`\`${
                    error instanceof Error
                        ? (error.stack ?? error.message)
                        : `${error ?? 'Unknown error'}`
                }\`\`\``;

                return ctx.editOrReply({
                    content,
                });
            },
            onMiddlewaresError(ctx, error) {
                return ctx.editOrReply({
                    content: error,
                    flags: MessageFlags.Ephemeral,
                });
            },
        },
    },
    globalMiddlewares: ['checkIfRestarting'],
}) as unknown as UsingClient & Client;
client.ws = new WsManager();
client.api = new ApiManager();
client.games = new GameManager(client);
client.meowdb = new MeowDB<'raw'>({
    dir: join(process.cwd(), 'cache'),
    name: 'games',
    raw: true,
});

client.setServices({
    cache: {
        disabledCache: true,
    },
    middlewares: allMiddlewares,
    langs: {
        default: 'en',
        aliases: {
            en: ['en-GB', 'en-US'],
            es: ['es-419', 'es-ES'],
        },
    },
});
await client.games.syncFromCache();
await client.start({}, false);
await client.uploadCommands({
    cachePath: join(process.cwd(), '_seyfert_cache.json'),
});

const server = new WebSocketServer({
    port: config.port.bot,
});

server.on('connection', (socket) => {
    socket.on('message', (raw) => {
        const { shardId, packet, key } = JSON.parse(raw.toString()) as {
            shardId: number;
            packet: GatewayDispatchPayload;
            key: string;
        };
        if (key !== config.auth.ws) {
            // xd?
            return socket.close();
        }

        return client.gateway.options.handlePayload(shardId, packet);
    });
});

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<false>> {
        ws: WsManager;
        api: ApiManager;
        games: GameManager;
        restarting?: true;
        meowdb: MeowDB;
    }

    interface RegisteredMiddlewares
        extends ParseMiddlewares<typeof allMiddlewares> {}

    interface DefaultLocale extends ParseLocales<typeof DefaultLang> {}
}
