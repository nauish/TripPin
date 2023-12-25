import { Request, Response } from 'express';
import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/user.js';
import PROVIDER from '../constants/provider.js';
import { handleError, ValidationError } from '../utils/errorHandler.js';

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

    const token = await createToken(+userId, expiredIn);
    res.json({
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
    handleError(err, res);
  }
  return undefined;
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
    res.json({
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
    handleError(err, res);
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const user = await userModel.selectUserById(userId);
    res.json({
      data: {
        provider: user?.provider_name,
        name: user?.name,
        email: user?.email,
        photo: user?.photo,
      },
    });
  } catch (err) {
    handleError(err, res);
  }
}

export async function putAttendee(req: Request, res: Response) {
  try {
    const { userId, role } = req.body;
    const { tripId } = req.params;
    const count = await userModel.updateUserRole(+tripId, +userId, role);
    if (count === 0) throw new ValidationError('無法修改');
    res.json({ data: { message: '成功修改參加者！' } });
  } catch (err) {
    handleError(err, res);
  }
}

export async function deleteUserFromTrip(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    const { tripId } = req.params;
    const isDeleted = await userModel.deleteAttendeeFromTrip(+tripId, +userId);
    if (!isDeleted) throw new ValidationError('無法刪除');
    res.json({ data: { message: '成功刪除參加者！' } });
  } catch (err) {
    handleError(err, res);
  }
}
