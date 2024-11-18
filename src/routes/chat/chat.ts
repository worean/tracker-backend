import express, { Request, Response } from 'express';
import prisma from '../../client';
import { GetLoginedUser } from '../../utils/auth';

const router = express.Router();

// 특정 채팅방의 메시지를 조회한다.
router.get('/:chatId/messages', async (req: Request, res: Response) => {
    var chatId = parseInt(req.params.chatId);

    // 현재 로그인된 사용자를 가져온다.
    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // 로그인된 유저가 속해있는 채팅방에서의 메시지를 가져온다. 
    var messages = await prisma.chat_Message.findMany({
        where: {
            chatId,
            chat: {
                users: {
                    some: {
                        id: user.id
                    }
                }
            }
        }
    });
    if (messages == null || messages.length == 0) {
        res.status(404).json({ error: 'No messages found' });
    }
    res.status(200).json(messages);
});

// 특정 채팅방의 특정 메시지를 조회한다.
router.get('/:chatId/message/:messageId', async (req: Request, res: Response) => {
    // 채팅방 아이디와 메시지 아이디를 가져온다.
    var messageId = parseInt(req.params.messageId);
    var chatId = parseInt(req.params.chatId);

    // 현재 로그인된 사용자를 가져온다.
    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // 로그인된 유저가 속해있는 채팅방에서의 메시지를 가져온다.
    var message = await prisma.chat_Message.findUnique({
        where: {
            id: messageId,
            chat: {
                id: chatId,
                users: {
                    some: {
                        id: user.id
                    }
                }
            }
        }
    });

    // 메시지가 없다면 404를 반환한다.
    if (message == null) {
        res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json(message);
});

export default router;