import { ObjectId } from "mongodb";

export interface ISession {
    _id: ObjectId | string;
    userId: ObjectId | string;
    sessionToken: string;
    expiresAt: Date;
    createdAt: Date;
}