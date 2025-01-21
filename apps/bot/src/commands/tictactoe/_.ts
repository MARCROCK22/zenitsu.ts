import { AutoLoad, Command, Declare } from 'seyfert';

@Declare({
    name: 'tictactoe',
    description: 'a command'
})
@AutoLoad()
export default class TicTacToe extends Command { }
