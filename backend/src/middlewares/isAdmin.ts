import { NextFunction, Request, Response } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

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
