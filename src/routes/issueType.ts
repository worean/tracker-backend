import express, { Request, Response }  from 'express';
import prisma from '../client';

interface IssueType {
    id: number;
    name: string;
    iconId: number;
    iconUrl: string;
}

const router = express.Router();

// 모든 이슈 타입을 조회한다.
router.get('/', async (req: Request, res: Response) => {
    // 모든 이슈 타입을 조회한다.
    const issueTypes = await prisma.issueType.findMany();

    if (issueTypes == null)
        res.status(404).json({ error: 'Issue types not found' });
    else
        res.status(200).json(issueTypes);
});

router.get('/:id', async (req: Request, res: Response) => {
    // issueType id를 가져온다.
    const id = parseInt(req.params.id);

    // 특정 이슈 타입을 조회한다.
    const issueType = await prisma.issueType.findUnique({
        where: {
            id
        }
    });

    if (issueType == null)
        res.status(404).json({ error: 'Issue type not found' });
    else
        res.status(200).json(issueType);
});

router.delete('/:id', async (req: Request, res: Response) => {
    // issueType id를 가져온다.
    const id = parseInt(req.params.id);

    // 특정 이슈 타입을 삭제한다.
    const issueType = await prisma.issueType.delete({
        where: {
            id
        }
    });

    if (issueType == null)
        res.status(404).json({ error: 'Issue type not found' });
    else
        res.status(200).json(issueType);
});


// 새로운 이슈 타입을 생성한다.
router.post('/', async (req: Request, res: Response) => {
    const it: IssueType = req.body;

    const issueType = await prisma.issueType.create({
        data: {
            name: it.name,
            icon: {
                connectOrCreate: {
                    create:
                    {
                        name: it.name,
                        uri: 'https://image.flaticon.com/icons/png/512/2922/2922510.png'
                    },
                    where: {
                        id: it.iconId
                    }
                }
            }
        }
    });

    if (issueType == null)
        res.status(500).json({ error: 'Internal server error' });
    else
        res.status(201).json(issueType);
});


// 이슈 타입을 수정한다.
router.put('/:id', async (req: Request, res: Response) => {
    // issueType id를 가져온다.
    const id = parseInt(req.params.id);

    // 수정할 정보를 가져온다.
    const { name } = req.body;

    // 특정 이슈 타입을 수정한다.
    const issueType = await prisma.issueType.update({
        where: {
            id
        },
        data: {
            name
        }
    });

    if (issueType == null)
        res.status(404).json({ error: 'Issue type not found' });
    else
        res.status(200).json(issueType);
});

export default router;