import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { ISession } from '../interfaces/SessionInterface';



export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const collection = await getCollection<ISession>('sessions'); 
    const sessions = await collection.find().toArray();
    res.json(sessions);
  } catch {
    res.status(500).json({ error: 'Could not get sessions' });
  }
};

export const getOneSession = async (req: Request, res: Response) => {
  const { sessionToken } = req.params as { sessionToken: string };
  try {
    const collection = await getCollection<ISession>('sessions'); 
    const session = await collection.findOne({ sessionToken: sessionToken });
    if (!session) {
      res.status(404).json({ message: 'Could not find this session' });
      return; 
    } 
    res.json(session);
  } catch {
    res.status(500).json({ message: 'Error retrieving session' });
  }
}