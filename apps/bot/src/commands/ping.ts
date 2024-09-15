import { Command, type CommandContext, Declare } from 'seyfert';
import { getConfig } from '../utils/config.js';

const { WS_PORT, TOKEN } = getConfig();

@Declare({
    name: 'ping',
    description: 'pong',
})
export default class PingCommand extends Command {
    async run(ctx: CommandContext) {
        await ctx.deferReply();

        const re = await fetch(`http://localhost:${WS_PORT}/info`, {
            headers: {
                authorization: TOKEN,
            },
        }).then((x) => x.json());

        await ctx.editOrReply({
            content: `Gateway ping ${re.latency}ms\nShard #${ctx.shardId} ping: ${re.shards.find((x: { id: number; latency: number }) => x.id === ctx.shardId).latency}ms`,
        });
    }
}
