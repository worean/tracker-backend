import express,{ Express,Request, Response } from "express";
import bodyParser from "body-parser";
import user from "./routes/user/user";
import issue from "./routes/issue/issue";
import project from "./routes/project/project";

const router = express.Router();

router.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));

router.use('/user', user);

router.use('/issue', issue);

router.use('/project', project);

export default router;