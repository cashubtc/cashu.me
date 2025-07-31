export interface TierMedia {
  url: string;
  type?: 'image' | 'video' | 'audio';
}

export interface Tier {
  id: string;
  name: string;
  price_sats: number;
  description: string;
  benefits?: string[];
  welcomeMessage?: string;
  media?: TierMedia[];
}
