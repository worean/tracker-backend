import express, { Request, Response } from 'express';
import prisma from '../client';

interface Like {
    id: number;
    issueId: number;
    commentId: number;
    userId :number;
}

const router = express.Router();


router.get('/:issueId/:commentId/likes', async (req: Request, res: Response) => {
    const issueId = parseInt(req.params.issueId);
    const commentId = parseInt(req.params.commentId);

    var likes = await prisma.like.findMany({
        where: {
            issueId,
            commentId
        }
    });

    if (likes == null || likes.length == 0) {
        res.status(404).json({ error: 'No likes found' });
    }
    res.status(200).json(likes);
});

export default router;