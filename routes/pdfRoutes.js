import express from 'express';
import * as pdfController from '../controllers/pdfController.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/health', pdfController.getHealth);
router.get('/', pdfController.getIndex);
router.post('/merge', upload.array('pdfs'), pdfController.postMerge);
router.post('/split', upload.single('pdf'), pdfController.postSplit);
router.post('/compress', upload.array('pdfs'), pdfController.postCompress);
router.post('/lock', upload.single('pdf'), pdfController.postLock);
router.post('/word', upload.single('pdf'), pdfController.postWord);
router.post('/unlock', upload.single('pdf'), pdfController.postUnlock);
router.post('/rotate', upload.single('pdf'), pdfController.postRotate);

export default router;
