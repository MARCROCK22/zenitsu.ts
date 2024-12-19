import { Image } from 'imagescript';

// const assets = (...path: string[]) =>
//     join(process.cwd(), '..', '..', 'assets', 'connect4', ...path);

export function drawConnect4(table: number[][]) {
    const canvas = new Image(
        table[0].length * 100,
        table.length * 100 + 50,
    ).fill(0x4287f3ff);

    for (let y = 0; y < table.length; y++) {
        for (let x = 0; x < table[y].length; x++) {
            const color = table[y][x];
            if (color === 1) {
                canvas.drawCircle(x * 100 + 50, y * 100 + 50, 40, 0xff0000ff);
            } else if (color === 2) {
                canvas.drawCircle(x * 100 + 50, y * 100 + 50, 40, 0xffff00ff);
            }
        }
    }

    return canvas.encode();
}
