import express,{ Express,Request, Response } from "express";
import bodyParser from "body-parser";
import user from "./routes/user";
import issue from "./routes/issue";
import project from "./routes/project";
import comment from "./routes/comment";
import issue_like from "./routes/issue_like";
import issue_comment from "./routes/issue_comment";

const router = express.Router();

router.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

router.use('/user', user);
router.use('/issue', issue);
router.use('/issue', issue_like);
router.use('/issue', issue_comment);
router.use('/project', project);
router.use('/comment', comment);

export default router;