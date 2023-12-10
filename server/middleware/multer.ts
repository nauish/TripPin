import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import path from 'path';

config({ path: './.env' });

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: process.env.AWS_REGION,
});

const s3storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME || '',
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `${nanoid(12)}.${path.extname(file.originalname)}`);
  },
});

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${nanoid(12)}.${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif'
  ) {
    cb(null, true);
  }
  return cb(null, false);
};

export default function uploadCommentPhotos(req: Request, res: Response, next: NextFunction) {
  const upload = multer({
    storage: process.env.NODE_ENV === 'production' ? s3storage : diskStorage,
    fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
  }).array('photos', 5);
  upload(req, res, (err: any) => {
    if (!err) return next();

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ error: 'File size is too large' });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ error: 'Too many files to upload' });
      default:
        return res.status(400).json({ error: err.message });
    }
  });
}
