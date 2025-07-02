import { NextFunction, Request, Response } from "express";
import { getCollection } from "../config/db";
import { IUser } from "../interfaces/UserInterface";
import { ISession } from "../interfaces/SessionInterface";

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const sessionsCollection = await getCollection<ISession>('sessions');
        const session = await sessionsCollection.findOne({ sessionToken: token });
        
        if (!session) {
            res.status(401).json({ message: 'Invalid session' });
            return;
        }

        const now = new Date();
        if (new Date(session.expiresAt) < now) {
            // Optional: remove expired session from DB
            await sessionsCollection.deleteOne({ sessionToken: token });
            res.status(401).json({ message: 'Session expired' });
            return;
        }

            // Attach user to req for use with stripe
            const usersCollection = await getCollection<IUser>('users');
            const user = await usersCollection.findOne({ _id: session.userId });

            if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
            }

            (req as any).user = user;

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ message: 'Internal server error' });
        
    }
}