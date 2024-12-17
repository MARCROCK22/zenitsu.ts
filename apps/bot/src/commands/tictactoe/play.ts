import {
    AutoLoad,
    type CommandContext,
    Declare,
    type OKFunction,
    Options,
    SubCommand,
    User,
    createUserOption,
} from 'seyfert';

const options = {
    user: createUserOption({
        description: 'an option',
        required: true,
        value({ value, context }, ok: OKFunction<User>, fail) {
            if (value instanceof User) {
                return context.guildId
                    ? fail('User must be a member of this guild')
                    : ok(value);
            }
            ok(value.user);
        },
    }),
};

@Declare({
    name: 'play',
    description: 'a command',
})
@AutoLoad()
@Options(options)
export default class Play extends SubCommand {
    async run(ctx: CommandContext<typeof options>) {
        await ctx.client.games.requestPlay(ctx, ctx.options.user, {
            game: 'tictactoe',
            wanna_play: `Wanna play tictactoe? ${ctx.options.user.username}`,
        });
    }
}
