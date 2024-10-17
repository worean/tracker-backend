import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

interface Project {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    managerId: number;
    iconId: number;
}


// GET /projects : 모든 프로젝트 조회
router.get('/' , (req: Request, res: Response) => {
    // 모든 프로젝트를 찾는다.
    var projects = prisma.project.findMany
    
    // 프로젝트 정보를 반환한다.
    res.status(200).send(`${JSON.stringify(projects)}`);
});

// GET /projects/:id : 특정 프로젝트 조회
router.get('/:id', async (req: Request, res: Response) => {
    // project id를 받는다.
    var projectId = parseInt(req.params.id);

    // project id로 project를 찾는다.
    var ret = await prisma.project.findUnique({
        where: {
            id: projectId
        }
    });

    // project를 찾았다면 project 정보를 반환한다.
    if (ret != null) {
        res.status(200).send(`${JSON.stringify(ret)}`);
    }
});

// POST /projects : 프로젝트 생성
router.post('/', async (req: Request, res: Response) => {

    // Request에서 project 정보를 가져온다.
    var project: Project = req.body;

    // project를 생성한다.
    var ret = await prisma.project.create({
        data: {
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            managerId: project.managerId,
        },
    });

    // project 정보를 반환한다.
    res.status(200).send(`${JSON.stringify(ret)}`);
});


export default router;