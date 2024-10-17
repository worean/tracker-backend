import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

interface Issue {
    id: string;
    summary: string;
    description: string;
    issueTypeId: number;
    projectId: number;
}

// 모든 이슈를 조회한다.
router.get('/issues', async (req: Request, res: Response) => {
    try {
        const issues = await prisma.issue.findMany();
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 이슈중에 특정 ID를 가진 이슈를 조회한다.
router.get('/issues/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // ID를 기반으로 이슈를 찾는다.
        const issue = await prisma.issue.findUnique({ where: { id: Number(id) } });
        if (!issue) {
            res.status(404).json({ error: 'Issue not found' });
        } else {
            res.json(issue);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 이슈를 생성하는 메서드
router.post('/issues', async (req: Request, res: Response) => {
    let info: Issue = req.body;

    // 이슈를 생성한다.
    const issue = await prisma.issue.create({
        data: {
            summary: info.summary,
            description: info.description,
            issueTypeId: info.issueTypeId,
            projectId: info.projectId
        }
    });

    // 이슈가 제대로 생성되지 않았다면 에러를 반환한다.
    if(issue == null) {
        res.status(500).json({ error: 'Internal server error' });
    }
    res.json(issue);
});

// 이슈의 데이터를 업데이트 한다.
router.put('/issues/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { summary, description } = req.body;
    try {
        const issue = await prisma.issue.update({
            where: { id: Number(id) },
            data: { summary, description },
        });
        res.json(issue);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 특정 id의 이슈를 삭제한다.
router.delete('/issues/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // ID를 기반으로 이슈를 삭제한다.
        await prisma.issue.delete({ where: { id: Number(id) } });
        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;