import express, { Router, Request, Response } from 'express';
import prisma from '../../client';
import { PrismaClient, User } from '@prisma/client';
import { AuthFunction, GetLoginedUser, getUser, UserAuthFunction } from '../../utils/auth';

const router = express.Router();

interface Project {
    id: string;
    name: string;
    description: string;
    managerId: number;
    iconId: number;
    startDate: string;
    endDate: string;
}

// 내가 가지고 있는 프로젝트들을 조회한다.
router.get('/projects', async (req: Request, res: Response) => {
    // 내가 가지고 있는 프로젝트들을 찾는다.
    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).send('Unauthorized');
        return;
    }

    var projects = await prisma.project.findMany({
        where: {
            managerId: user.id
        }
    });

    // 프로젝트 정보를 반환한다.
    res.status(200).send(`${JSON.stringify(projects)}`);
});

// 해당 프로젝트에 등록된 모든 이슈를 조회한다.
router.get('/:projectId/issues', async (req: Request, res: Response) => {

    // parameter에서 projectId를 가져온다.
    var projectId = parseInt(req.params.projectId);
    if (projectId == null || isNaN(projectId)) {
        res.status(400).send('Invalid project id');
        return;
    }

    // issue 중에서 projectId가 해당되는 Issue들을 가져온ㄷ.
    const issues = await prisma.issue.findMany({
        where: {
            projectId: parseInt(req.params.projectId)
        }
    });
    res.status(200).json(issues);

    if (issues == null) {
        res.status(200).json({ message: 'Issues not found' });
    }
});

// 특정 프로젝트를 조회한다.
router.get('/:id', async (req: Request, res: Response) => {
    // project id를 받는다.
    var projectId = parseInt(req.params.id);

    // projectId가 없다면 에러를 반환한다.
    if (projectId == null || isNaN(projectId)) {
        res.status(400).send('Invalid project id');
        return;
    }

    // project id로 project를 찾는다.
    var ret = await prisma.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            id: true,
            name: true,
            description: true,
            managerId: true,
            iconId: true,
            startDate: true,
            endDate: true,
        }
    });

    // project를 찾았다면 project 정보를 반환한다.
    if (ret != null) {
        res.status(200).send(`${JSON.stringify(ret)}`);
    }
    // project를 찾지 못했다면 에러를 반환한다.
    else {
        res.status(404).send('Project not found');
    }
});

// 프로젝트를 생성한다.
router.post('/create', UserAuthFunction(async (req: Request, res: Response, user: User) => {

    // Request에서 project 정보를 가져온다.
    var project: Project = req.body;

    // project 데이터 유효성 검사
    if (!project.name || !project.description) {
        return res.status(400).send('Invalid project data');
    }

    // project를 생성한다.
    var ret = await prisma.project.create({
        data: {
            name: project.name,
            description: project.description,
            managerId: user.id,
            iconId: project.iconId ? project.iconId : null,
            startDate: project.startDate ? project.startDate : null,
        },
    });

    // project 정보를 반환한다.
    res.status(201).send(`${JSON.stringify(ret)}`);
}));

// 내 계정에 속한 프로젝트 중 특정 프로젝트를 삭제한다.
router.delete('/:id', UserAuthFunction(async (req: Request, res: Response, user: User) => {
    // project id를 받는다.
    var projectId = parseInt(req.params.id);

    if (projectId == null) {
        res.status(400).send('Invalid project id');
        return;
    }

    // project id로 project를 찾는다.
    var project = await prisma.project.findUnique({
        where: {
            id: projectId,
            managerId: user.id
        }
    });

    // project를 찾지 못했다면 에러를 반환한다.
    if (!project) {
        res.status(404).send('Project not found or you do not have permission to delete this project');
        return;
    }

    // project를 찾았다면 project 정보를 삭제한다.
    var ret = await prisma.project.delete({
        where: {
            id: projectId,
            managerId: user.id
        }
    });

    // 삭제되었다면 No Content를 반환한다.
    res.status(204);
}));

router.put('/:id', UserAuthFunction(async (req: Request, res: Response, user: User) => {
    // project id를 받는다.
    var projectId = parseInt(req.params.id);

    if (projectId == null) {
        res.status(400).send('Invalid project id');
        return;
    }

    // project id로 project를 찾는다.
    var project = await prisma.project.findUnique({
        where: {
            id: projectId,
            managerId: user.id
        }
    });

    var newData: Project = req.body;

    // project를 찾지 못했다면 에러를 반환한다.
    if (!project) {
        res.status(404).send('Project not found or you do not have permission to update this project');
        return;
    }

    // project 정보를 업데이트한다.
    var ret = await prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            name: newData.name? newData.name : project.name,
            description: newData.description? newData.description : project.description,
            iconId: newData.iconId ? newData.iconId : project.iconId,
            startDate: newData.startDate ? new Date(newData.startDate) : project.startDate,
            endDate: newData.endDate ? new Date(newData.endDate) : project.endDate
        }
    });

    res.status(200).send(`${JSON.stringify(ret)}`);
}));

export default router;