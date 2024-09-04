import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 4000;


app.listen(port, () => {
    console.log(`🚀 [Server] : http://localhost:${port}`);
});


app.get('/', (req, res) => {
    res.send('Hello, World!');
});