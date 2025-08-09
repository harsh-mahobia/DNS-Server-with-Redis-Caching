import express from 'express';
import type { Request, Response } from 'express';
import {router} from './route/allRoutes.js'; 

const server = express();

server.use(express.json());


server.use(router);

server.listen(3010, () => {
    console.log("Server is running on port 3010");
});
