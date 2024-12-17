import { AutoLoad, Command, Declare } from 'seyfert';

@Declare({
    name: 'tictactoe',
    description: 'a command',
    integrationTypes: ['GuildInstall', 'UserInstall'],
    contexts: ['Guild', 'PrivateChannel'],
})
@AutoLoad()
export default class TicTacToe extends Command {}
