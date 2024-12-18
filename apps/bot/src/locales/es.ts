import type DefaultLang from './en.js';

export default {
    tictactoe: {
        wanna_play: (user) => `¿Quieres jugar? ${user.username} `,
    },
} satisfies typeof DefaultLang;
