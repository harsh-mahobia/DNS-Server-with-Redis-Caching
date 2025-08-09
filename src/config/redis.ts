import { createClient } from 'redis';

const redisClient = createClient({
    url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

await redisClient.connect(); // top-level await allowed in ES2022+

export default redisClient;