import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes/api.ts';
import { seedDatabase } from './server/db.ts';
import { config } from './server/config.ts';
import { connectMongo, isMongoActive } from './server/mongo.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic security and parsing middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Required for Monaco editor & iframe dev environment
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: '*',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Initialize MongoDB connection if MONGODB_URI is provided
  await connectMongo();

  // Seed database with algorithmic problems, achievements, and admin user
  await seedDatabase();

  // Mount CodeArena REST API
  app.use('/api', apiRouter);

  // Health check route with database status indicator
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'CodeArena Full-Stack API',
      database: isMongoActive() ? 'MongoDB Live Cluster' : 'In-Memory / JSON Engine (Fallback)',
      timestamp: new Date().toISOString(),
    });
  });

  // Mongoose / MongoDB Error Resilience Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (
      err.name === 'MongooseError' ||
      err.name === 'MongoNetworkError' ||
      (err.message && err.message.includes('buffering timed out'))
    ) {
      console.warn('[AI Studio] Database offline or unreachable — returning safe fallback');
      if (req.method === 'GET') {
        return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
      }
      return res.status(503).json({ error: 'Database temporarily unavailable' });
    }
    next(err);
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      error: config.isProduction ? undefined : String(err),
    });
  });

  // In development, hook up Vite middleware
  if (!config.isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = config.port;
  app.listen(port, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`  CODEARENA — "Code. Compete. Conquer."       `);
    console.log(`  Full-Stack MEAN Platform Active             `);
    console.log(`  Server listening on http://0.0.0.0:${port}  `);
    console.log(`  REST API available at /api/*                `);
    console.log(`===============================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
