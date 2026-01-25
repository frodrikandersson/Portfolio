import multer from 'multer';
import path from 'path';
import fs from 'fs';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

function createImageUpload(subDir: string, prefix: string) {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', subDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG and WebP images are allowed'));
      }
    },
  });
}

export const blogCoverUpload = createImageUpload('blogs', 'blog-cover');
export const avatarUpload = createImageUpload('avatars', 'avatar');
export const mediaUpload = createImageUpload('media', 'media');

export function getUploadDir(subDir: string): string {
  return path.join(__dirname, '..', '..', 'uploads', subDir);
}
