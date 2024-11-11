import { Router, Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';
import { AuthFunction, GetLoginedUser, UserAuthFunction } from '../auth/auth';

const prisma = new PrismaClient();
const router = Router();

// 이슈 처리를 위한 interface 
interface Issue {
    id: string;
    summary: string;
    description: string;
    issueTypeId: number;
    projectId: number;
    priority: number;
    keyName: string;
    status: number;
    
}

// 이슈중에 특정 ID를 가진 이슈를 조회한다.
router.get('/:id', async (req: Request, res: Response) => {
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
router.post('/create', AuthFunction(async (req: Request, res: Response) => {
    // 현재 로그인된 사용자를 가져온다.
    const user = await GetLoginedUser(req);
    if(user == null || user.id == null){
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    let info: Issue = req.body;
    if (info == null) {
        res.status(400).json({ error: 'Invalid request' });
    }

    // 이슈를 생성한다.
    const issue = await prisma.issue.create({
        data: {
            summary: info.summary,
            keyName: info.keyName ? info.keyName : 'ISSUE-1',
            description: info.description,
            issueTypeId: info.issueTypeId,
            projectId: info.projectId
        }
    });

    // 이슈가 제대로 생성되지 않았다면 에러를 반환한다.
    if (issue == null) {
        res.status(500).json({ error: 'Internal server error' });
    }

    res.status(201).json(issue);
}));

// 특정 ID의 이슈를 삭제한다.
router.delete('/:id', AuthFunction(async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // ID를 기반으로 이슈를 삭제한다.
        await prisma.issue.delete({ where: { id: Number(id) } });
        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));

// 이슈의 데이터를 업데이트 한다.
router.put('/:id', UserAuthFunction(async (req: Request, res: Response, user:User) => {
    const { id } = req.params;
    const { summary, description } = req.body;
    try {
        const issue = await prisma.issue.update({
            where: { id: Number(id) },
            data: { summary, description,  },
        });
        res.json(issue);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));

export default router;