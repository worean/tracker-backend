import express,{ Express,Request, Response } from "express";
import bodyParser from "body-parser";


const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

export default router;