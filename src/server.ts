import express, { Express, Request, Response } from 'express';
import router from './router';

const app: Express = express();
const port = 4000;


app.listen(port, () => {
    console.log(`🚀 [Server] : http://localhost:${port}`);
});

app.use('/api', router);