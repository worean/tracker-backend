import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /comments
router.get('/', async (req: Request, res: Response) => {
    try {
        const comments = await prisma.comment.findMany();
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /comments/:id
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(id) },
        });
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
        } else {
            res.json(comment);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /comments
router.post('/', async (req: Request, res: Response) => {
    const { text } = req.body;
    try {
        const comment = await prisma.comment.create({
            data: { text },
        });
        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /comments/:id
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
        const comment = await prisma.comment.update({
            where: { id: parseInt(id) },
            data: { text },
        });
        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /comments/:id
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.comment.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;