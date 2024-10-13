import { runtimeConfig } from './seyfert.config.js';

const WS_PORT = Number(process.env.WS_PORT);

if (!WS_PORT) {
    throw new Error('Cannot start process without WS_PORT');
}

const API_PORT = Number(process.env.API_PORT);

if (!API_PORT) {
    throw new Error('Cannot start process without API_PORT');
}

const config = {
    rc: runtimeConfig,
    wsPort: WS_PORT,
    apiPort: API_PORT,
} as const;

export { config };
