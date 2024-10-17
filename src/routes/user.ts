import express, { Request, Response } from 'express';
import prisma from '../client';
import auth from '../auth/auth';

interface User {
    id: string;
    name: string;
    email: string;
}
interface register {
    name: string;
    email: string;
    password: string;
}

const router = express.Router();

// GET /users 
router.get('/:id', async (req: Request, res: Response) => {
    var userId = parseInt(req.params.id);
    // user id로 user를 찾는다.
    var ret = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    // user를 찾았다면 user 정보를 반환한다.
    if (ret != null) {
        res.status(200).send(`${JSON.stringify(ret)}`);
    }
    // user를 찾지 못했다면 404를 반환한다.
    else {
        res.status(404).send(`user not found`);
    }
});

// PUT /users/:id
router.put('/:id', (req: Request, res: Response) => {
    // Your code here
});

// DELETE /users/:id
router.delete('/:id', (req: Request, res: Response) => {
    // Your code here
});

router.post('/register', async (req: Request, res: Response) => {
    var info: register = req.body;

    // 이미 등록된 user인지 확인한다.
    var ret = await prisma.user.findUnique({
        where: {
            email: info.email
        }
    });

    // 등록되지 않은 user라면 등록한다.
    if (ret == null) {
        ret = await prisma.user.create({
            data: {
                email: info.email,
                name: info.name,
                password: info.password
            }
        });
        res.status(201).json({ message: 'registered', result: ret });
    }
    else {
        res.status(500).json({ message: 'user is already registered', result: ret });
    }
});

router.put('/login', async (req: Request, res: Response) => {
    var info: register = req.body;

    // 로그인을 시고한다.
    auth.login(info.email, info.password).then((ret) => {
        if (ret == "User not found") {
            res.status(404).json({ message: 'User not found' });
        }
        else if (ret == "Password is incorrect") {
            res.status(500).json({ message: 'Password is incorrect' });
        }
        else {
            res.status(200).json({ message: 'login success', result: ret });
        }
    });

});

export default router;