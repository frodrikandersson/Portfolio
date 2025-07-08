import { NextFunction, Request, Response } from "express";
import { IUser } from "../interfaces/UserInterface";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as IUser;

  if (!user) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({ message: "Forbidden: Admins only" });
    return;
  }

  next();
};
