import { ObjectId } from "mongodb";

export interface IPurchase {
  _id?: ObjectId | string;
  userId: ObjectId | string;
  productId: ObjectId | string;
  purchaseDate: Date;
  stripePaymentId: string | null;
  stripeSessionId: string | null;
  amount: number;
  status: "completed" | "pending" | "failed";
}
