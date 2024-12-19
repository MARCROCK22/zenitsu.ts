import { AutoLoad, Command, Declare } from 'seyfert';

@Declare({
    name: 'queue',
    description: 'a command',
})
@AutoLoad()
export default class Queue extends Command {}
