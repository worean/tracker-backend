import express, { Request, Response } from 'express';
import { GetLoginedUser, UserAuthFunction } from '../auth/auth';
import prisma from '../client';
import { User } from '@prisma/client';
interface Comment {
    id: number;
    issueId: number;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
}

const router = express.Router();

// 특정 이슈아이디에 대한 모든 코멘트를 가져온다.
router.get('/:issueId/comments', async (req: Request, res: Response) => {
    const issueId = parseInt(req.params.issueId);

    // 특정 Issue에 대한 모든 코멘트를 가져온다.
    var comments = await prisma.comment.findMany({
        where: {
            IssueId: issueId
        }
    });
    if (comments == null || comments.length == 0) {
        res.status(404).json({ error: 'No comments found' });
    }
    res.status(200).json(comments);
});

// 특정 코멘트를 가져온다.
router.get('/:commentId', async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.commentId);

    // 특정 코멘트를 가져온다.
    var comment = await prisma.comment.findUnique({
        where: {
            id: commentId
        }
    });
    if (comment == null) {
        res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(comment);
});

// 특정 이슈에 대해서 코멘트를 생성한다.
router.post('/:issueId/comment/create', async (req: Request, res: Response) => {
    // 현재 로그인된 사용자를 가져온다.
    const user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    
    const { content } = req.body;
    if (content == null || content == '') {
        res.status(400).json({ error: 'Invalid request' });
    }
    
    // issueId를 통해서 issue를 찾는다.
    const issueId = parseInt(req.params.issueId);
    var issue = await prisma.issue.findUnique({
        where: {
            id: issueId
        }
    });

    if (issue == null) {
        res.status(404).json({ error: 'Issue not found' });
    }

    var newComment = await prisma.comment.create({
        data: {
            authorId: user.id,
            IssueId: issueId,
            content: content,
        }
    });
    if (newComment == null) {
        res.status(500).json({ error: 'Failed to create comment' });
    }
    res.status(201).json(newComment);
});

// 코멘트의 정보를 수정한다.
router.put('/comment/:commentId', UserAuthFunction(async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.commentId);
    var comment = await prisma.comment.findUnique({
        where: {
            id: commentId
        }
    });
    if (comment != null) {
        const { content } = req.body;
        var updatedComment = await prisma.comment.update({
            where: {
                id: commentId
            },
            data: {
                content: content
            }
        });
        if (updatedComment == null) {
            res.status(500).json({ error: 'Failed to update comment' });
        }
        res.status(200).json(updatedComment);
    }
    else {
        res.status(404).json({ error: 'Comment not found' });
    }
}));

// 특정 Issue에 연결된 코멘트를 삭제한다.
router.delete('/:issueId/comments/:commentId', UserAuthFunction(async (req: Request, res: Response, user: User) => {
    const commentId = parseInt(req.params.commentId);

    var ret = await prisma.comment.delete({
        where: {
            id: commentId,
            authorId: user.id
        }
    });
    if (ret == null) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }

    res.status(204).json(ret);
}));

export default router;
