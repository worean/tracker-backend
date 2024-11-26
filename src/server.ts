import express, { Express, Request, Response } from 'express';
import router from './router';
var cors = require('cors');

const app: Express = express();
const port = 4000;


app.listen(port, () => {
    console.log(`🚀 [Server] : http://localhost:${port}`);
});

app.use(cors());
app.use('/api', router);