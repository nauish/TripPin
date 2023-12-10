import { Request, Response } from 'express';
import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/user.js';
import PROVIDER from '../constants/provider.js';
import { ValidationError } from '../middleware/errorHandler.js';

const cookieOptions = {
  httpOnly: true,
  path: '/',
  secure: true,
  sameSite: 'strict',
} as const;

function createToken(userId: number, seconds: number) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + seconds;
  const jwtKey: jwt.Secret = process.env.TOKEN_SECRET || '';

  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        exp: expirationTimestamp,
        userId,
      },
      jwtKey,
      (err: any, token: any) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      },
    );
  });
}

export async function createUser(req: Request, res: Response) {
  try {
    const expiredIn = Number(process.env.EXPIRE_IN_SECONDS) || 3600;
    const { name, email, password } = req.body;
    const hashedPassword = await hash(password);
    const userId = await userModel.insertUser(email, name, PROVIDER.NATIVE, hashedPassword);
    const token = await createToken(userId, expiredIn);
    return res
      .cookie('jwt', token, cookieOptions)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: expiredIn,
          user: {
            id: userId,
            provider: PROVIDER.NATIVE,
            name,
            email,
            photo: '',
          },
        },
      });
  } catch (err) {
    if (err instanceof Error && err.message.includes('duplicate key')) {
      return res.status(400).json({ error: '信箱已經被註冊過' });
    }

    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(500).json({ error: '註冊失敗' });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const expiredIn = process.env.EXPIRE_IN_SECONDS ? +process.env.EXPIRE_IN_SECONDS : 3600;
    const { email, password, provider } = req.body;
    const user = await userModel.selectUserByEmail(email);

    if (!user) throw new ValidationError('使用者帳號或密碼錯誤');

    if (provider === PROVIDER.NATIVE) {
      const isValidPassword = await verify(user.token, password);
      if (!isValidPassword) throw new ValidationError('使用者帳號或密碼錯誤');
    }

    const token = await createToken(user.id, expiredIn);
    return res
      .cookie('jwt', token, cookieOptions)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: expiredIn,
          user: {
            id: user.id,
            email,
            name: user.name,
            photo: user.photo,
            provider,
          },
        },
      });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: '登入失敗' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const user = await userModel.selectUserById(userId);
    return res.status(200).json({
      data: {
        provider: user?.provider_name,
        name: user?.name,
        email: user?.email,
        photo: user?.photo,
      },
    });
  } catch (err) {
    if (err instanceof Error) return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: 'Get profile failed' });
  }
}
