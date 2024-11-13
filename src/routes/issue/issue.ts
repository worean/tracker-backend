import { Router, Request, Response } from 'express';
import prisma from '../../client';
import { GetLoginedUser } from '../../utils/auth';
import issue_like from './issue_like';
import issue_comment from './issue_comment';
import hashtag from '../../utils/hashtag';

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
router.post('/create', async (req: Request, res: Response) => {
    // 현재 로그인된 사용자를 가져온다.
    const user = await GetLoginedUser(req);
    if (user == null || user.id == null) {
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

    // content에 따라 hashtag를 생성한다.
    await hashtag.UpdateHashTag(issue.id, issue.description!);

    // 이슈가 제대로 생성되지 않았다면 에러를 반환한다.
    if (issue == null) {
        res.status(500).json({ error: 'Internal server error' });
    }

    // 생성된 이슈를 반환한다. 이 때 201상태코드를 반환한다.
    res.status(201).json(issue);
});

// 특정 ID의 이슈를 삭제한다.
router.delete('/:id', async (req: Request, res: Response) => {

    const { id } = req.params;

    try {
        // ID를 기반으로 이슈를 삭제한다.
        await prisma.issue.delete({ where: { id: Number(id) } });
        res.status(204).json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 이슈의 데이터를 업데이트 한다.
router.put('/:issueId', async (req: Request, res: Response) => {
    const issueId = req.params.issueId;
    const req_issue: Issue = req.body;

    if (issueId == null || req_issue == null) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    let issue = await prisma.issue.findUnique({
        where: { id: Number(issueId) }
    });

    if (issue == null) {
        res.status(404).json({ error: 'Issue not found' });
        return;
    }

    // 이슈를 업데이트한다.
    issue = await prisma.issue.update({
        where: { id: Number(issueId) },
        data: {
            summary: req_issue.summary ? req_issue.summary : issue.summary,
            description: req_issue.description ? req_issue.description : issue.description,
            issueTypeId: req_issue.issueTypeId ? req_issue.issueTypeId : issue.issueTypeId,
        },
    });


    if (issue == null) {
        res.status(500).json({ error: 'Internal server error' });
    }

    // content에 따라 hashtag를 생성한다.
    await hashtag.UpdateHashTag(issue.id, issue.description!);

    // 업데이트된 이슈를 반환한다..' 
    res.status(200).json(issue);
});

router.use('/', issue_comment);
router.use('/', issue_like);

export default router;