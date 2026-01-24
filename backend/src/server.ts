import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { connectToDatabase } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/userRoutes';
import sessionRoutes from './routes/sessionRoutes';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';
import consentRoutes from './routes/consentRoutes';
import productRoutes from './routes/productRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import { handleStripeWebhook } from './controllers/stripeWebhookController';

const app = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com", "https://m.stripe.network"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://api.stripe.com", env.CORS_ORIGIN],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
    },
  },
}));

app.use(compression());
app.use(morgan('short'));

// Stripe webhook needs raw body for signature verification (must be before json parser)
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

app.get('/', (req: Request, res: Response) => {
  res.send("It's working!");
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/sessions', sessionRoutes);
app.use('/blogs', blogRoutes);
app.use('/consents', consentRoutes);
app.use('/products', productRoutes);
app.use('/subscriptions', subscriptionRoutes);

app.use(errorHandler);

connectToDatabase().then(() => {
  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });

  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})
.catch((err) => {
  console.error('Failed to connect to the database:', err);
  process.exit(1);
});
