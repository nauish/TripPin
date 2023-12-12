import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
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
    cb(null, `${nanoid(12)}${path.extname(file.originalname)}`);
  },
});

export const uploadPhotos = multer({
  storage: process.env.NODE_ENV === 'production' ? s3storage : diskStorage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(new Error('只允許上傳圖片檔案'));
  },
});

export default uploadPhotos;
