import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/logging.middleware.js';

dotenv.config();

/**
 * Express application configuration.
 * 
 * This API Gateway serves as a modern HTTPS-compatible intermediary
 * between the mobile app and the legacy IIS/ASP.NET backend.
 * 
 * Purpose:
 * - Solve TLS handshake failures on older Android devices
 * - Provide modern HTTPS endpoint for mobile app
 * - Proxy requests to legacy backend with SSL bypass
 * - Maintain identical request/response behavior
 */
const app = express();

// Security middleware
app.use(helmet());

// CORS - Allow all origins for mobile app
app.use(cors());

// Request logging
app.use(morgan('dev'));
app.use(requestLogger);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
