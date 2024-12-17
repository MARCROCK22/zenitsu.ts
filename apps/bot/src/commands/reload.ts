import { Command, type CommandContext, Declare } from 'seyfert';
import type { GenericGameDB } from '../manager/game.js';

@Declare({
    name: 'reload',
    description: 'pong',
})
export default class ReloadCommand extends Command {
    async run(ctx: CommandContext) {
        for (const [key, value] of ctx.client.games.values) {
            switch (value.type) {
                case 'tictactoe':
                    ctx.client.meowdb.set<
                        Extract<GenericGameDB, { type: 'tictactoe' }>
                    >(key, {
                        game: {
                            lastTurn: value.game.lastTurn,
                            map: value.game.map,
                            users: value.game.users,
                        },
                        type: 'tictactoe',
                    });
                    break;
                default:
                    throw new Error('Unexpected');
            }
        }

        ctx.client.restarting = true;
        await ctx.editOrReply({
            content: 'Games saved',
        });
    }
}
