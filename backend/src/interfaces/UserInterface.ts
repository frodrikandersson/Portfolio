import { ObjectId } from "mongodb";

export interface IUser extends Document {
    _id: ObjectId | string;
    firstName: string;
    lastName: string;
    picture?: string;
    googleId?: string;
    email: string;
    passwordHash: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}

export interface INewUser {
    firstName: string;
    lastName: string;
    picture?: string;
    googleId?: string;
    email: string;
    passwordHash?: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}