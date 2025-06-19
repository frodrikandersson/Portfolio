import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectToDatabase } from './config/db';
import userRoutes from './routes/userRoutes';


const app = express();
const port = 4000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send("It's working!");
});

app.use('/users', userRoutes);

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})
.catch((err) => {
  console.error('Failed to connect to the database:', err);
  process.exit(1);
});
 
