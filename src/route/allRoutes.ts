import { Router } from "express";
import type { Request, Response } from "express";
import redisClient from '../config/redis.js';
import localdb from '../config/temp-db.js';
export const router = Router();



router.post('/', (req: any, res) => {
    if (!req.body?.type || !req.body?.ip || !req.body?.name) {
        return res.status(400).send('Invalid request');
    }
    const { type, ip, name } = req.body;

    localdb.push({ type, ip, name });
    res.status(201).json({ message: 'Data saved successfully' });
});



router.get('/get-data', async (req: Request, res: Response) => {
    try {
        res.json({ data: localdb });
    } catch (err) {
        console.log(err);
    }
});





