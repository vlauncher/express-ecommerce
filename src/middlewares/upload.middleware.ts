import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any, // 'params' type definition in multer-storage-cloudinary can be strict/incomplete
});

export const upload = multer({ storage: storage });
