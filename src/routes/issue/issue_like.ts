import express, { Request, Response } from 'express';
import prisma from '../../client';
import { GetLoginedUser } from '../../utils/auth';

interface Like {
    id: number;
    issueId: number;
    commentId: number;
    userId: number;
}

const router = express.Router();

// 특정 이슈의 코멘트에 대한 likes 를 가져온다.
router.get('/:issueId/likes', async (req: Request, res: Response) => {
    var issueId = parseInt(req.params.issueId);

    var likes = await prisma.issue_Like.findMany({
        where: {
            issueId
        }
    });
    if (likes == null || likes.length == 0) {
        res.status(404).json({ error: 'No likes found' });
    }
    res.status(200).json(likes);
});

// 특정 이슈에 대한 like를 생성한다.
router.post('/:issueId/like', async (req: Request, res: Response) => {
    var issueId = parseInt(req.params.issueId);
    
    // 현재 로그인된 사용자를 가져온다.
    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // like를 생성한다.
    const like = await prisma.issue_Like.create({
        data: {
            userId: user.id,
            issueId,
        }
    });

    // like가 생성되지 않았다면 500 에러를 반환한다.
    if (like == null) {
        res.status(500).json({ error: 'Internal server error' });
    }

    // 생성된 like를 반환한다.
    res.status(201).json(like);
});

// 특정 이슈에 대한 like를 삭제한다.
router.delete('/:issueId/like/:likeId', async (req: Request, res: Response) => {
    var issueId = parseInt(req.params.issueId);
    var likeId = parseInt(req.params.likeId);

    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // like를 찾는다.
    var like = await prisma.issue_Like.findFirst({
        where: {
            userId: user.id,
            issueId,
            id: likeId
        }
    });
    if(like == null) {
        res.status(404).json({ error: 'Like not found' });
        return;
    }

    // like를 삭제한다.
    var ret = await prisma.issue_Like.delete({
        where: {
            id: like.id
        }
    });
    if(ret == null) {
        res.status(500).json({ error: 'Internal server error' });
    }

    res.status(204).json(ret);
});

export default router;