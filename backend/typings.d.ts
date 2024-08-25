import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file: Multer.File;
      files: {
        [fieldname: string]: Multer.File[];
      };
    }
  }
}