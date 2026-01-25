import { ObjectId } from "mongodb";
import { CoverImageData } from "../utils/imageVariants";

export interface IUser extends Document {
    _id: ObjectId | string;
    firstName: string;
    lastName: string;
    picture?: string | CoverImageData;
    googleId?: string;
    email: string;
    passwordHash: string;
    role: "user" | "admin";
    stripeCustomerId?: string;
    subscriptionStatus?: "active" | "cancelled" | "past_due" | "none";
    subscriptionPlan?: "monthly" | "yearly" | null;
    subscriptionExpiresAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface INewUser {
    firstName: string;
    lastName: string;
    picture?: string | CoverImageData;
    googleId?: string;
    email: string;
    passwordHash?: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}