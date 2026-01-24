import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { ISession } from '../interfaces/SessionInterface';
import { INewUser } from '../interfaces/UserInterface';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { env } from '../config/env';
import { setSessionCookie } from '../utils/sessionCookie';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleTokenAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ message: 'Missing idToken' });
    return;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      res.status(400).json({ message: 'Invalid token payload' });
      return;
    }

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name || '';
    const picture = payload.picture || '';

    const usersCollection = await getCollection<INewUser>('users');
    let user = await usersCollection.findOne({ email });

    if (!user) {
      const nameParts = name.split(' ');
      const newUser: INewUser = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        picture,
        googleId,
        email,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else if (!user.googleId) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { googleId, picture, updatedAt: new Date() } }
      );
    }

    if (!user) {
      res.status(500).json({ message: 'Failed to create user' });
      return;
    }

    const sessionToken = uuidv4();
    const sessionsCollection = await getCollection<ISession>('sessions');

    const session: ISession = {
      _id: new ObjectId(),
      userId: user._id,
      sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + env.SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
    };

    await sessionsCollection.insertOne(session);

    setSessionCookie(res, sessionToken);
    res.json({ message: 'Google login successful' });
  } catch (err) {
    console.error('Google login failed:', err);
    res.status(500).json({ message: 'Google login failed' });
  }
};
