export interface CoverImageData {
  baseName: string;
  originalExt: string;
  widths: number[];
  path: string;
}

export interface IProductFrontend {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  platform: string;
  coverImage?: string | CoverImageData;
  isPublished: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPurchaseFrontend {
  _id: string;
  userId: string;
  productId: string;
  purchaseDate: string;
  stripePaymentId: string | null;
  amount: number;
  status: string;
  product: IProductFrontend | null;
}

export interface ISubscriptionStatus {
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'none';
  subscriptionPlan: 'monthly' | 'yearly' | null;
  subscriptionExpiresAt: string | null;
}
