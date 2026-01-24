import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { INewUser, IUser } from '../interfaces/UserInterface';
import { ObjectId } from 'mongodb';
import { ISession } from '../interfaces/SessionInterface';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { setSessionCookie, clearSessionCookie } from '../utils/sessionCookie';

// Public

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const collection = await getCollection<IUser>('users');
    const users = await collection.find(
      {},
      { projection: { passwordHash: 0, googleId: 0, email: 0, stripeCustomerId: 0 } }
    ).toArray();
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Could not get users' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const usersCollection = await getCollection<IUser>('users');
    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user || !user.passwordHash) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const sessionsCollection = await getCollection<ISession>('sessions');
    const sessionToken = uuidv4();

    const session: ISession = {
      _id: new ObjectId(),
      userId: user._id,
      sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + env.SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
    };

    await sessionsCollection.insertOne(session);
    setSessionCookie(res, sessionToken);
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const sessionToken = req.cookies?.session_token;

  if (!sessionToken) {
    res.status(400).json({ message: 'No active session' });
    return;
  }

  try {
    const sessionsCollection = await getCollection<ISession>('sessions');
    await sessionsCollection.deleteOne({ sessionToken });
    clearSessionCookie(res);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const usersCollection = await getCollection<INewUser>('users');
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: INewUser = {
      firstName: "",
      lastName: "",
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({ message: 'User registered', id: result.insertedId });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Private

export const getOneUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid user ID format' });
    return;
  }

  try {
    const collection = await getCollection<IUser>('users');
    const user = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { passwordHash: 0, googleId: 0 } }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

export const getLoggedInUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Error in /me route:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  if (!user?._id) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const { firstName, lastName, picture } = req.body;

  try {
    const usersCollection = await getCollection<IUser>('users');

    const updateFields: Partial<IUser> = {
      updatedAt: new Date(),
    };

    if (typeof firstName === 'string') updateFields.firstName = firstName.trim();
    if (typeof lastName === 'string') updateFields.lastName = lastName.trim();
    if (typeof picture === 'string') updateFields.picture = picture;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(user._id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      res.status(404).json({ message: 'User not found or nothing changed' });
      return;
    }

    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(user._id) },
      { projection: { passwordHash: 0, googleId: 0 } }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Admin

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid user ID format' });
    return;
  }

  try {
    const users = await getCollection<IUser>('users');
    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );

    if (result.modifiedCount === 0) {
      res.status(404).json({ message: 'User not found or role unchanged.' });
      return;
    }

    res.json({ message: `User role updated to ${role}` });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
