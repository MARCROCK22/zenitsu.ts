import s from 'ajv-ts';

export const statsResult = s.object({
    uptime: s.number(),
    memoryUsage: s.object({
        arrayBuffers: s.number(),
        external: s.number(),
        heapTotal: s.number(),
        heapUsed: s.number(),
        rss: s.number(),
    }),
});
