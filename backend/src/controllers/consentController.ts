import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { IConsent, INewConsent } from '../interfaces/ConsentInterface';
import { IUser } from '../interfaces/UserInterface';
import { ObjectId } from 'mongodb';



export const getUserConsents = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const collection = await getCollection<IConsent>('consents'); 
    const consent = await collection.findOne({ userId: new ObjectId(userId) });

    if (!consent) {
        res.status(404).json({ message: 'No consent found for this user' });
        return;
    }

    res.json(consent);
  } catch {
    res.status(500).json({ error: 'Could not get consents collection' });
  }
};

export const createUserConsent = async (req: Request, res: Response) => {
  const { analytics, marketing, dataSharing, userId } = req.body;

  try {
    const userObjectId = new ObjectId(userId); 
    const usersCollection = await getCollection<IUser>('users');

    const existingUser = await usersCollection.findOne({ _id: userObjectId });
    if (!existingUser) {
      res.status(400).json({ error: 'User does not exist.' });
      return;
    }

    const consentsCollection = await getCollection<INewConsent>('consents');

    const result = await consentsCollection.updateOne(
      { userId: userObjectId }, 
      {
        $set: {
          analytics,
          marketing,
          dataSharing,
          timestamp: new Date(),
        },
      },
      { upsert: true } 
    );

    res.status(result.upsertedCount ? 201 : 200).json({
      message: result.upsertedCount ? 'Consent created' : 'Consent updated',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};