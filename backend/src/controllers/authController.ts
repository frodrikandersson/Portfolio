import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { ISession } from '../interfaces/SessionInterface';
import { INewUser } from '../interfaces/UserInterface'; 
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const client = new OAuth2Client(CLIENT_ID);

export const googleTokenAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ err: 'Missing idToken' });
    return;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      res.status(400).json({ err: 'Invalid token payload' });
      return;
    }

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name || '';
    const picture = payload.picture || '';

    const usersCollection = await getCollection<INewUser>('users');
    let user = await usersCollection.findOne({ email });

  if (!user) {
    const newUser: INewUser = {
      firstName: name.split(' ')[0] || '',
      lastName: name.split(' ')[1] || '',
      picture,
      googleId,
      email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await usersCollection.insertOne(newUser);
    user = {
      ...newUser,
      _id: result.insertedId, 
    };
  } else {
    if (!user.googleId) {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            googleId,
            picture,
            updatedAt: new Date(),
          },
        }
      );
      user.googleId = googleId;
    }
  }

    if (!user) {
      res.status(500).json({ err: 'Failed to create user' });
      return;
    }

    const sessionToken = uuidv4();
    const sessionsCollection = await getCollection<ISession>('sessions');

    const session: ISession = {
      _id: new ObjectId(),
      userId: user._id,
      sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await sessionsCollection.insertOne(session);

    res.json({
      message: 'Google login successful',
      sessionToken,
    });

  } catch (err) {
    console.error('Google login failed:', err);
    res.status(500).json({ err: 'Google login failed' });
  }
};
