import type { UUID } from 'node:crypto';
import { ComponentCommand, type ComponentContext } from 'seyfert';

const regex =
    /move_tictactoe_[0-8]{1,1}_[0-9]{17,19}_[0-9]{17,19}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export default class MoveTicTacToe extends ComponentCommand {
    componentType = 'Button' as const;

    filter(ctx: ComponentContext<typeof this.componentType>) {
        return !!ctx.customId.match(regex);
    }

    run(ctx: ComponentContext<typeof this.componentType>) {
        const customIdSplit = ctx.customId.split('_');
        const move = Number(customIdSplit[2]);
        const authorID = customIdSplit[3];
        const userID = customIdSplit[4];
        const uuid = customIdSplit[5] as UUID;

        if (!ctx.client.games.values.has(uuid)) {
            return ctx.update({
                content: 'Game does not exists',
                components: [],
            });
        }

        if (ctx.client.games.hasGame([authorID, userID]).length !== 2) {
            return ctx.update({
                content: 'Something went wrong...?',
                components: [],
            });
        }

        const rawGame = ctx.client.games.values.get(uuid);
        if (!rawGame) {
            throw new Error('Unexpected');
        }

        if (!rawGame.game.canPlay(move, ctx.author.id)) {
            return ctx.deferUpdate();
        }
        rawGame.game.play(move, ctx.author.id);

        if (rawGame.game.finished) {
            ctx.client.games.deleteUserGames([authorID, userID]);
            try {
                ctx.client.meowdb.delete(uuid);
            } catch {
                //
            }
        }

        return ctx.update(
            ctx.client.games.getTicTacToeMessage(
                rawGame.game,
                ctx,
                userID,
                uuid,
            ),
        );
    }
}
