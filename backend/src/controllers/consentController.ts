import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { IConsent, INewConsent } from '../interfaces/ConsentInterface';
import { ObjectId } from 'mongodb';

export const getUserConsents = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const authenticatedUser = req.user;

  if (!ObjectId.isValid(userId)) {
    res.status(400).json({ message: 'Invalid user ID format' });
    return;
  }

  if (!authenticatedUser || authenticatedUser._id.toString() !== userId) {
    res.status(403).json({ message: 'Forbidden: Cannot access other users consent' });
    return;
  }

  try {
    const collection = await getCollection<IConsent>('consents');
    const consent = await collection.findOne({ userId: new ObjectId(userId) });

    if (!consent) {
      res.status(404).json({ message: 'No consent found for this user' });
      return;
    }

    res.json(consent);
  } catch {
    res.status(500).json({ message: 'Could not get consent data' });
  }
};

export const createUserConsent = async (req: Request, res: Response) => {
  const { analytics, marketing, dataSharing } = req.body;
  const authenticatedUser = req.user;

  if (!authenticatedUser) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (typeof analytics !== 'boolean' || typeof marketing !== 'boolean' || typeof dataSharing !== 'boolean') {
    res.status(400).json({ message: 'analytics, marketing, and dataSharing must be booleans' });
    return;
  }

  try {
    const userObjectId = new ObjectId(authenticatedUser._id);
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
    console.error('Consent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
