
require('dotenv').config();
import jwt from 'jsonwebtoken'
import prisma from '../client';
import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import { User } from '@prisma/client';

var secretKey: jwt.Secret = process.env.SECRET_KEY!;
interface UserPayload {
    email: string;
    password: string;
}

// email과 password를 통해서 로그인을 수행
export async function login(email: string, password: string) {
    var user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (user == null) {
        return "User not found";
    }

    if (!bcrypt.compareSync(password, user.password)) {
        return "Password is incorrect";
    }

    var token = jwt.sign({ email: email }, secretKey);
    return token;
}

// token을 기반으로 현재 유저를 확인하여 반환
export async function getUser(token: string | null | undefined): Promise<User | null> {

    if (token == null)
        return null;
    
    var ret = verifyToken(token);

    if (ret == null)
        return null;

    // token을 통해서 email을 가져온다.
    const email = (ret as UserPayload).email;
    
    // user를 Database에서 찾아서 return
    var user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    return user;
}

export function generateToken(email: string, password: string): string {
    const payload: UserPayload = { email, password };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

export function verifyToken(token: string): UserPayload | null {
    try {
        return jwt.verify(token, secretKey) as UserPayload;
    } catch (error) {
        return null;
    }
}

// token을 이용해서 로그인된 유저인지 확인한다.
export const AuthFunction = ((func: Function) => async (req: Request, res: Response) => {

    // request 에서 token을 가져온다.
    const token = req.headers.authorization;
    if (token == null) {
        // token이 없다면 Unauthorized
        res.status(401).send('Unauthorized');
        return;
    }
    const user = await getUser(token);
    if (user == null) {
        res.status(401).send('Unauthorized');
        return;
    }
    func(req, res);
});

// token을 이용해서 로그인된 유저인지 확인한다.
export const UserAuthFunction = ((func: Function) => async (req: Request, res: Response) => {

    // request 에서 token을 가져온다.
    const token = req.headers.authorization;
    if (token == null) {
        // token이 없다면 Unauthorized
        res.status(401).send('Unauthorized');
        return;
    }
    const user = await getUser(token);
    if (user == null) {
        res.status(401).send('Unauthorized');
        return;
    }
    func(req, res, user);
});

export const GetLoginedUser = (req: Request) => {
    // header에서 token을 가져온다.
    const token = req.headers.authorization;

    // token을 이용해서 user를 가져온다.
    return getUser(token);
}

export default {
    login,
    getUser,
    generateToken,
    verifyToken,
    AuthFunction
}