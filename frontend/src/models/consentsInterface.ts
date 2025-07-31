export interface ConsentModalProps {
  userId: string;
}

export type ConsentChoices = {
  analytics: boolean;
  marketing: boolean;
  dataSharing: boolean;
};