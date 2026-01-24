import { ObjectId } from "mongodb";

export interface IConsent {
  _id: ObjectId;
  userId: ObjectId;
  analytics: boolean;
  marketing: boolean;
  dataSharing: boolean;
  timestamp: Date;
}

export interface INewConsent {
  userId: ObjectId;
  analytics: boolean;
  marketing: boolean;
  dataSharing: boolean;
  timestamp: Date;
}
