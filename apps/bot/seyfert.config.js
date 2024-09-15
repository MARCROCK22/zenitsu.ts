import { config as configDotEnv } from 'dotenv';
import { join } from 'node:path';
configDotEnv({
    path: join(process.cwd(), '..', '..', '.env'),
});
import { config } from 'seyfert';

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    throw new Error('Cannot start process without token');
}

export default config.bot({
    locations: {
        base: 'src',
        output: 'dist',
    },
    token: TOKEN,
    debug: true,
});
