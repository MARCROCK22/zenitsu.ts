import { config } from '@repo/config';
import s from 'ajv-ts';

const shardsInfoResult = s.object({
    latency: s.number(),
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
            latency: s.number(),
            id: s.number(),
        }),
    ),
});

const uptimeResult = s.number();

export class WsApiManager {
    private baseURL = `http://localhost:${config.wsPort}`;

    async shardsInfo() {
        const response = await fetch(`${this.baseURL}/info`, {
            headers: {
                authorization: config.rc.token,
            },
        });
        const result = await response.json();
        return shardsInfoResult.parse(result);
    }

    async uptime() {
        const response = await fetch(`${this.baseURL}/uptime`, {
            headers: {
                authorization: config.rc.token,
            },
        });
        const result = await response.json();
        return uptimeResult.parse(result);
    }
}
