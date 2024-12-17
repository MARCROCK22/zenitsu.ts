import { Image } from 'imagescript';

export function decodeImage(buffer: Buffer) {
    return Image.decode(buffer);
}
