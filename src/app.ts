import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import redoc from 'redoc-express';
import path from 'path';

const app: Application = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger/Redoc if needed, or configure specifically
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Documentation
const swaggerDocument = yaml.load(path.join(__dirname, '../swagger.yml'));

// Swagger UI
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Redoc
app.get('/', redoc({
  title: 'API Docs',
  specUrl: '/doc-json'
}));

// Serve swagger spec for Redoc
app.get('/doc-json', (req, res) => {
  res.json(swaggerDocument);
});

// Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        message: 'Not Found',
    });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

export default app;
