import express, { Request, Response } from 'express';
import prisma from '../../client';
import { GetLoginedUser } from '../../utils/auth';

const router = express.Router();


// 특정 채팅방에서 메시지를 조회한다.
router.get(':chatId/message/:messageId', async (req: Request, res: Response) => {
    var messageId = parseInt(req.params.messageId);



});




export default router;