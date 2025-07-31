import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { connectToDatabase } from './config/db';
import userRoutes from './routes/userRoutes';
import sessionRoutes from './routes/sessionRoutes';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';
import consentRoutes from './routes/consentRoutes';

const app = express();
const port = 4000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://js.stripe.com https://m.stripe.network; " +
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
    "font-src https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self' https://api.stripe.com http://localhost:4000; " +
    "frame-src https://js.stripe.com https://hooks.stripe.com;" 
  );
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send("It's working!");
});

app.use('/auth', authRoutes)
app.use('/users', userRoutes);
app.use('/sessions', sessionRoutes)
app.use('/blogs', blogRoutes)
app.use('/consents', consentRoutes)

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})
.catch((err) => {
  console.error('Failed to connect to the database:', err);
  process.exit(1);
});
 
