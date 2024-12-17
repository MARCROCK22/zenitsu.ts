import { runtimeConfig } from './seyfert.config.js';

const WS_PORT = Number(process.env.WS_PORT);

if (!WS_PORT) {
    throw new Error('Cannot start process without WS_PORT');
}

const BOT_PORT = Number(process.env.BOT_PORT);

if (!BOT_PORT) {
    throw new Error('Cannot start process without BOT_PORT');
}

const WS_AUTH = process.env.WS_AUTH;

if (!WS_AUTH) {
    throw new Error('Cannot start process without WS_AUTH');
}

const API_PORT = Number(process.env.API_PORT);

if (!API_PORT) {
    throw new Error('Cannot start process without API_PORT');
}

const API_AUTH = process.env.API_AUTH;

if (!API_AUTH) {
    throw new Error('Cannot start process without API_AUTH');
}

const config = {
    rc: runtimeConfig,
    port: {
        bot: BOT_PORT,
        ws: WS_PORT,
        api: API_PORT,
    },
    auth: {
        ws: WS_AUTH,
        api: API_AUTH,
    },
} as const;

export { config };
