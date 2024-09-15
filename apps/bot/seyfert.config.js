import { join } from 'node:path';
import { config } from 'seyfert';

process.loadEnvFile(join(process.cwd(), '..', '..', '.env'));

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    throw new Error('Cannot start process without token');
}

export default config.bot({
    locations: {
        base: 'src',
        output: 'dist',
        commands: 'commands',
    },
    token: TOKEN,
    debug: true,
});
