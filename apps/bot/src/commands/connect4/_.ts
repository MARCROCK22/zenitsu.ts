import { AutoLoad, Command, Declare } from 'seyfert';

@Declare({
    name: 'connect4',
    description: 'a command'
})
@AutoLoad()
export default class Connect4 extends Command { }
