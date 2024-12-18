import type { UserStructure } from 'seyfert';

export default {
    tictactoe: {
        wanna_play: (user: UserStructure) => `Wanna play? ${user.username}`,
    },
} as const;
