import {
    AutoLoad,
    type CommandContext,
    Declare,
    type InteractionGuildMemberStructure,
    type OKFunction,
    Options,
    SubCommand,
    User,
    createUserOption,
} from 'seyfert';

const options = {
    member: createUserOption({
        description: 'an option',
        required: true,
        value(
            { value },
            ok: OKFunction<InteractionGuildMemberStructure>,
            fail,
        ) {
            if (value instanceof User) {
                return fail('User must be a member of this guild');
            }
            ok(value);
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
        await ctx.client.games.requestPlay(ctx, ctx.options.member, {
            game: 'tictactoe',
            wanna_play: `Wanna play tictactoe? ${ctx.options.member.username}`,
        });
    }
}
