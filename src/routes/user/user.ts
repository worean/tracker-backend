import express, { Request, Response } from 'express';
import prisma from '../../client';
import auth, { GetLoginedUser } from '../../utils/auth';
import bcrypt from 'bcrypt';

interface User {
    name: string;
    email: string;
    password: string;
}

interface register {
    name: string;
    email: string;
    password: string;
}
const router = express.Router();

// 현재 로그인된 유저를 반환한다. (토큰을 기반으로 인증이 필요)
router.get('/account', async (req: Request, res: Response) => {
    var user = await GetLoginedUser(req);
    if (user == null) {
        res.status(401).send('Unauthorized');
    }
    else {
        res.status(200).json({ message: 'My Account found', result: user });
    }
});

// id를 기반으로 user를 찾는다.
router.get('/:id', async (req: Request, res: Response) => {
    var id = parseInt(req.params.id);
    // email이 없다면 400을 반환한다.
    if (id == null || isNaN(id)) {
        res.status(400).send(`email is required`);
        return;
    }
    // user id로 user를 찾는다.
    var ret = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            email: true,
            name: true,
            avatar: true,
            birthDate: true,
        }
    });

    // user를 찾았다면 user 정보를 반환한다.
    if (ret != null) {
        res.status(200).send({ message: 'user found', result: ret });
    }
    // user를 찾지 못했다면 404를 반환한다.
    else {
        res.status(404).send(`user not found`);
    }
});

// 특정 유저의 데이터를 업데이트한다.
router.put('/:id', async (req: Request, res: Response) => {
    // user id를 가져온다.
    var userId = parseInt(req.params.id);
    console.log(req.body);
    const { name, email, password, avatar, birthDate } = req.body;

    if (userId == null || isNaN(userId)) {
        res.status(400).send('User ID is required');
        return;
    }

    try {
        // User를 찾는다.
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        // 만약 ID가 유효하지 않다면 404를 반환한다.
        if (!existingUser) {
            res.status(404).send('User not found');
            return;
        }

        // User를 업데이트한다.
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                avatar: avatar ? req.body.avatar : existingUser.avatar,
                birthDate: birthDate ? new Date(birthDate) : existingUser.birthDate,
                password: password ? await bcrypt.hash(password, 10) : existingUser.password,
            },
        });

        res.status(200).send({ message: 'User updated', result: updatedUser });
    } catch (error) {
        res.status(500).send({ message: 'Error updating user', error });
    }
});

// 특정 유저를 삭제한다. (토큰을 기반으로 인증이 필요하며 개인정보 보호를 위해 본인만 삭제 가능)
router.delete('/:id', async (req: Request, res: Response) => {

    // 매개변수로 들어온 id값을 가져온다.
    const id = parseInt(req.params.id);

    // 현재 로그인된 유저를 가져온다.
    var User = await GetLoginedUser(req);

    // 로그인된 유저가 없다면 401을 반환한다.
    if (User == null || id != User.id) {
        res.status(401).send('Unauthorized');
        return;
    }

    // // user가 존재하는지 확인한다.
    // const existingUser = await prisma.user.findUnique({
    //     where: { id}
    // });

    // // 만약 user가 존재하지 않는다면 400을 반환한다.
    // if (!existingUser) {
    //     res.status(400).send('User not found');
    //     return;
    // }

    // user를 삭제한다.
    var deletedUser = await prisma.user.delete({
        where: {
            id: User.id
        }
    });

    // 삭제된 user를 반환한다.
    res.status(204).send({ message: 'deleted', result: deletedUser });
});

// 유저를 등록한다.
router.post('/register', async (req: Request, res: Response) => {
    var info: register = req.body;

    // 이미 등록된 user인지 확인한다.
    var user = await prisma.user.findUnique({
        where: {
            email: info.email
        }
    });

    // 등록되지 않은 user라면 등록한다.
    if (user == null) {

        var pw = await bcrypt.hash(info.password, 10);

        user = await prisma.user.create({
            data: {
                email: info.email,
                name: info.name,
                password: pw
            }
        });
        res.status(201).json({ message: 'registered', user: user });
    }
    else {
        res.status(500).json({ messaege: "user already registered", user: user });
    }
});

// 로그인을 시도한다.
router.post('/login', async (req: Request, res: Response) => {
    var info: register = req.body;
    // 로그인을 시고한다.
    var ret = await auth.login(info.email, info.password).then((ret) => {
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
    console.log(res.statusCode);
});


export default router;