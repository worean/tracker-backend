import express, { Request, Response }  from 'express';
import prisma from '../client';

const router = express.Router();

interface HashTag {
    id: number;
    name: string;
}

// 모든 해시태그를 조회한다.
router.get('/', async (req:Request, res:Response) => {
    try {
        const hashtags = await prisma.hashTag.findMany();
        res.status(200).json(hashtags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hashtags' });
    }
});

// 특정 이름을 가지는 해시태그를 조회한다.
router.get('/:name', async (req:Request, res:Response) => {
    const { name } = req.params;

    // 해당 이름을 가지는 해시태그를 찾는다.
    const hashtag = await prisma.hashTag.findMany({
        where: { name },
    });
    if (hashtag) {
        res.status(200).json(hashtag);
    } else {
        res.status(404).json({ error: 'Hashtag not found' });
    }
});

router.get('/:name/issues', async (req:Request, res:Response) => {
    const { name } = req.params;

    // 해당 해시태그를 가지고 있는 이슈를 찾는다.
    const issues = await prisma.issue.findMany({
        where: {
            hashTags: {
                some: {
                    name
                }
            }
        }
    });
    if (issues) {
        res.status(200).json(issues);
    } else {
        res.status(404).json({ error: 'Issues not found' });
    }
});

export default router;