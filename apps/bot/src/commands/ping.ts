import { Command, type CommandContext, Declare } from 'seyfert';

@Declare({
    name: 'ping',
    description: 'pong',
})
export default class PingCommand extends Command {
    async run(ctx: CommandContext) {
        await ctx.deferReply();

        const info = await ctx.client.ws.shardsInfo();

        await ctx.editOrReply({
            content: `Gateway avg ping ${info.latency}ms\nShard #${ctx.shardId} ping: ${info.shards.find((x) => x.id === ctx.shardId)?.latency}ms`,
        });
    }
}
