import { config } from '@repo/config';
import { statsResult } from './_.js';

export class ApiManager {
    private baseURL = `http://localhost:${config.port.api}`;

    async stats() {
        const response = await fetch(`${this.baseURL}/stats`, {
            headers: {
                authorization: config.rc.token,
            },
        });
        const result = await response.json();
        return statsResult.parse(result);
    }
}
