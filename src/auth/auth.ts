
require('dotenv').config();
import jwt from 'jsonwebtoken'
import prisma from '../client';
import bcrypt from 'bcrypt';

var secretKey: jwt.Secret = process.env.SECRET_KEY!;
interface UserPayload {
    email: string;
    password: string;
}

// email과 password를 통해서 로그인을 수행
export async function login(email: string, password: string) {
    var user =  await prisma.user.findUnique({
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
export async function getUser(token: string) {
    
    var ret = verifyToken(token);
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

export function verifyToken(token: string): UserPayload | string {
    try {
        return jwt.verify(token, secretKey) as UserPayload;
    } catch (error) {
        return 'Invalid Token';
    }
}

export default {
    login,
    getUser,
    generateToken,
    verifyToken
}