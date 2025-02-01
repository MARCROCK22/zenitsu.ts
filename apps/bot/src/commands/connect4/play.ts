import {
    type CommandContext,
    createUserOption,
    type OKFunction,
    SubCommand,
    AutoLoad,
    Declare,
    Options,
    User
} from 'seyfert';

const options = {
    user: createUserOption({
        description: `an option`,
        required: true,
        value({ value, context }, ok: OKFunction<User>, fail) {
            if (value instanceof User) {
                if (context.guildId) {
                    fail(`User must be a member of this guild`);
                } else {
                    ok(value);
                }
                return;
            }
            ok(value.user);
        }
    })
};

@Declare({
    name: `play`,
    description: `a command`
})
@Options(options)
@AutoLoad()
export default class Play extends SubCommand {
    async run(ctx: CommandContext<typeof options>) {
        await ctx.client.games.requestPlay(ctx, ctx.options.user, {
            game: `connect4`,
            wanna_play: `Wanna play connect4? ${ctx.options.user.username}`
        });
    }
}
