import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { INewUser, IUser } from '../interfaces/UserInterface';
import { ObjectId } from 'mongodb';
import { ISession } from '../interfaces/SessionInterface';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';


// Public START

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const collection = await getCollection<IUser>('users'); 
    const users = await collection.find().toArray();
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Could not get users' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const usersCollection = await getCollection<IUser>('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      console.log('No user found with that email');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      console.log('Password does not match');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const sessionsCollection = await getCollection<ISession>('sessions');
    const sessionToken = uuidv4();

    const session: ISession = {
      _id: new ObjectId(),
      userId: user._id,
      sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 days
    };

    await sessionsCollection.insertOne(session);
    res.json({ message: 'Login successful', sessionToken });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { sessionToken } = req.body;

  if (!sessionToken) {
    res.status(400).json({ error: 'Session token required' });
    return;
  }

  try {
    const sessionsCollection = await getCollection<ISession>('sessions');
    await sessionsCollection.deleteOne({ sessionToken });
    res.json({ message: 'Logged out successfully' });
    
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Server error' });
  }

};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required'});
    return;
  }

  try {
    const usersCollection = await getCollection<INewUser>('users');
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: INewUser = {
      firstName: "",
      lastName: "",
      email,
      passwordHash,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),  
    };

    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({ message: 'User registered', id: result.insertedId });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Public END



// Private START 

export const getOneUserById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const collection = await getCollection<IUser>('users'); 
    const users = await collection.findOne({ _id: new ObjectId(id) });
    if (!users) {
      res.status(404).json({ message: 'could not find this user' });
      return; 
    } 
    res.json(users);
  } catch {
    res.status(500).json({ message: 'error' });
  }
};

export const getLoggedInUser = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user as IUser;

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({
            email: user.email,
            role: user.role,
        });

    } catch (err) {
        console.error('Error in /me route:', err);
        res.status(500).json({ message: 'Internal server error' });
        
    }
};

// Private END



// Admin START

export const updateUserRole = async (req: Request, res: Response): Promise <void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    res.status(400).json({ message: 'Invalid role. Must be "admin" or "user".'});
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

// Admin END