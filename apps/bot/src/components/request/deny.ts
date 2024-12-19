import type { UUID } from 'node:crypto';
import { ComponentCommand, type ComponentContext } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

const regex =
    /deny_(tictactoe)_[0-9]{17,19}_[0-9]{17,19}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export default class Deny extends ComponentCommand {
    componentType = 'Button' as const;

    filter(ctx: ComponentContext<typeof this.componentType>) {
        return !!ctx.customId.match(regex);
    }

    run(ctx: ComponentContext<typeof this.componentType>) {
        const customIdSplit = ctx.customId.split('_');
        const authorId = customIdSplit[2];
        const userId = customIdSplit[3];
        const uuid = customIdSplit[4] as UUID;

        if (!ctx.client.games.values.has(uuid)) {
            return ctx.update({
                content: 'Game does not exists',
                components: [],
            });
        }

        if (ctx.client.games.hasGame([authorId, userId]).length !== 2) {
            return ctx.update({
                content: 'Something went wrong...?',
                components: [],
            });
        }

        if (userId !== ctx.author.id) {
            return ctx.write({
                content: '?',
                flags: MessageFlags.Ephemeral,
            });
        }

        return ctx.update({
            content: 'when te rechazan',
            components: [],
        });
    }
}
