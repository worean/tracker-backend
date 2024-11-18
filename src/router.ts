import express,{ Express,Request, Response } from "express";
import bodyParser from "body-parser";

// 라우팅 모듈을 import한다.
import user from "./routes/user/user";
import issue from "./routes/issue/issue";
import project from "./routes/project/project";
import chat from "./routes/chat/chat";

const router = express.Router();

// json UTF-8 parsing을 위해서 body-parser를 사용한다.
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// 라우팅을 추가한다.
router.use('/user', user);
router.use('/issue', issue);
router.use('/project', project);
router.use('/chat', chat)

export default router;