import { config } from '@repo/config';
import { statsResult } from './_.js';

export class ApiManager {
    private baseURL = `http://localhost:${config.apiPort}`;

    async stats() {
        const response = await fetch(`${this.baseURL}/stats`, {
            headers: {
                authorization: config.rc.token,
            },
        });
        const result = await response.json();
        return statsResult.parse(result);
    }

    async test() {
        const response = await fetch(`${this.baseURL}/test`);
        return response.arrayBuffer();
    }
}
