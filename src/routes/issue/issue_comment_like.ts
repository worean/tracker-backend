import { Router, Request, Response } from 'express';
import prisma from '../../client';
import { GetLoginedUser, getUser } from '../../utils/auth';

const router = Router();

// 특정 이슈의 코멘트에 대한 likes를 조회한다.
router.get('/:issueId/comment/:commentId/likes', async (req: Request, res: Response) => {
    const issueId = parseInt(req.params.issueId);
    const commentId = parseInt(req.params.commentId);

    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // 특정 Issue를 가져온다.
    var issue = await prisma.issue.findUnique({
        where: {
            id: issueId,
        }
    });
    if (issue == null) {
        res.status(404).json({ error: 'Issue not found' });
        return;
    }

    // 특정 Issue에 속한 특정 Comment에 대한 모든 Like를 가져온다.
    var likes = await prisma.comment_Like.findMany({
        where: {
            commentId,
        }
    });

    if (likes == null || likes.length == 0) {
        res.status(404).json({ error: 'No likes found' });
    }
    res.status(200).json(likes);
});

// 특정 이슈의 코멘트에 대한 like를 생성한다.
router.post('/:issueId/comment/:commentId/like', async (req: Request, res: Response) => {

    const issueId = parseInt(req.params.issueId);
    const commentId = parseInt(req.params.commentId);

    // 현재 로그인된 사용자를 가져온다.
    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // like를 생성한다.
    const like = await prisma.comment_Like.create({
        data: {
            userId: user.id,
            commentId,
        }
    });

    // like가 생성되지 않았다면 500 에러를 반환한다.
    if (like == null) {
        res.status(500).json({ error: 'Internal server error' });
    }

    // 생성된 like를 반환한다.
    res.status(201).json(like);
});

// 특정 이슈의 코멘트에 대한 like를 삭제한다.
router.delete('/:issueId/comment/:commentId/like/:likeId', async (req: Request, res: Response) => {
    const issueId = parseInt(req.params.issueId);
    const commentId = parseInt(req.params.commentId);
    const likeId = parseInt(req.params.likeId);

    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // like를 찾는다.
    var like = await prisma.comment_Like.findFirst({
        where: {
            userId: user.id,
            commentId,
            id: likeId
        }
    });

    if (like == null) {
        res.status(404).json({ error: 'Like not found' });
        return;
    }

    // like를 삭제한다.
    await prisma.comment_Like.delete({
        where: {
            id: likeId
        }
    });

    res.status(204).json();
});

export default router;
