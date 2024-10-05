import { config } from '@repo/config';
import { Command, type CommandContext, Declare } from 'seyfert';
import type { ShardData } from 'seyfert/lib/websocket';

@Declare({
    name: 'ping',
    description: 'pong',
})
export default class PingCommand extends Command {
    async run(ctx: CommandContext) {
        await ctx.deferReply();

        const re: {
            latency: number;
            shards: {
                data: ShardData;
                heart: {
                    ack: boolean;
                    interval: number;
                    lastAck: number | undefined;
                    lastBeat: number | undefined;
                };
                latency: number;
                id: number;
            }[];
        } = await fetch(`http://localhost:${config.wsPort}/info`, {
            headers: {
                authorization: config.rc.token,
            },
        }).then((x) => x.json());

        await ctx.editOrReply({
            content: `Gateway avg ping ${re.latency}ms\nShard #${ctx.shardId} ping: ${re.shards.find((x) => x.id === ctx.shardId)?.latency}ms`,
        });
    }
}
