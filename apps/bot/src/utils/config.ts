export function getConfig() {
    const BOT_PORT = Number(process.env.BOT_PORT);

    if (!BOT_PORT) {
        throw new Error('Cannot start process without BOT_PORT');
    }

    const WS_PORT = Number(process.env.WS_PORT);

    if (!WS_PORT) {
        throw new Error('Cannot start process without WS_PORT');
    }

    const TOKEN = process.env.TOKEN;

    if (!TOKEN) {
        throw new Error('Cannot start process without token');
    }

    return {
        BOT_PORT,
        WS_PORT,
        TOKEN,
    };
}
