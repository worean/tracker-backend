import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

interface HashTag {
    id: number;
    name: string;
}

// 모든 해시태그를 조회한다.
router.get('/hashtags', async (req, res) => {
    try {
        const hashtags = await prisma.hashTag.findMany();
        res.status(200).json(hashtags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hashtags' });
    }
});

// 특정 이름을 가지는 해시태그를 조회한다.
router.get('/hashtags/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const hashtag = await prisma.hashTag.findMany({
            where: { name },
        });
        if (hashtag) {
            res.status(200).json(hashtag);
        } else {
            res.status(404).json({ error: 'Hashtag not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hashtag' });
    }
});

export default router;