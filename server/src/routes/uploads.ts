import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Multer configuration (memory storage for Cloudinary upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload single file
router.post('/image', authenticate, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, error: 'No file provided' }); return; }

    // In production: upload to Cloudinary
    // const result = await cloudinary.uploader.upload_stream({ folder: 'influenceai' }, ...);
    
    // For now, return a placeholder URL
    const url = `https://storage.influenceai.com/uploads/${Date.now()}_${req.file.originalname}`;
    logger.info(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);

    res.json({ success: true, data: { url, filename: req.file.originalname, size: req.file.size } });
  } catch (err) { next(err); }
});

// Upload multiple files
router.post('/media', authenticate, upload.array('files', 5), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) { res.status(400).json({ success: false, error: 'No files provided' }); return; }

    const urls = files.map(f => ({
      url: `https://storage.influenceai.com/uploads/${Date.now()}_${f.originalname}`,
      filename: f.originalname,
      size: f.size,
    }));

    res.json({ success: true, data: urls });
  } catch (err) { next(err); }
});

export default router;
