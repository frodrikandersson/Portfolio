import express, { Request, Response } from 'express';
import { getAllUsers, getOneUserById, updateUserRole } from '../controllers/userController';
import { isAuthenticated } from '../middlewares/auth';
import { IUser } from '../interfaces/UserInterface';
import { isAdmin } from '../middlewares/isAdmin';

const router = express.Router();

// JCTODO: set public routes
// router.post('/register', registerUser);

// JCTODO: Get current logged-in user info
router.get('/me', isAuthenticated, async (req: Request, res: Response): Promise<void> => {

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
});

//JCTODO: Update user role: admin only
router.patch('/:id/role', isAuthenticated, isAdmin, updateUserRole);



// JCTODO: set protected routes
router.get('/', isAuthenticated, getAllUsers);
router.get('/:id', isAuthenticated, getOneUserById);

export default router;
