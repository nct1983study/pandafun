import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import pdfRoutes from './routes/pdfRoutes.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // EJS Setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(process.cwd(), 'views'));

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', muhammara: typeof muhammara !== 'undefined' });
  });
  app.use('/', pdfRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom', // Use 'custom' for EJS apps
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  }

  // Static Files - Serve public directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Error Handling Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', err);
    res.status(500).send('Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.');
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    // Optional: Log to file for debugging
    const logFile = path.join(process.cwd(), 'server.log');
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);
    
    process.stdout.write = (chunk) => {
      logStream.write(chunk);
      return originalStdoutWrite(chunk);
    };
    process.stderr.write = (chunk) => {
      logStream.write(chunk);
      return originalStderrWrite(chunk);
    };
  });
}

startServer();
