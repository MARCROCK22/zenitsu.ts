import { config } from '@repo/config';
import s from 'ajv-ts';
import { statsResult } from './_.js';

const workersInfoResult = s.array(
    s.object({
        shards: s.array(
            s.object({
                data: s.object({
                    resume_seq: s.number().nullable(),
                    resume_gateway_url: s.string().optional(),
                    session_id: s.string().optional(),
                }),
                heart: s.object({
                    ack: s.boolean(),
                    interval: s.number(),
                    lastAck: s.number().optional(),
                    lastBeat: s.number().optional(),
                }),
                latency: s.number().nullable(),
                id: s.number(),
            }),
        ),
        workerId: s.number(),
    }),
);

export class WsManager {
    private baseURL = `http://localhost:${config.port.ws}`;

    async shardsInfo() {
        const response = await fetch(`${this.baseURL}/info`, {
            headers: {
                authorization: config.auth.ws,
            },
        });
        const result = await response.json();
        return workersInfoResult.parse(result);
    }

    async stats() {
        const response = await fetch(`${this.baseURL}/stats`, {
            headers: {
                authorization: config.auth.ws,
            },
        });
        const result = await response.json();
        return statsResult.parse(result);
    }
}
