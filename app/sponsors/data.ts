export interface Sponsor {
  name: string;
  tagline?: string;
  logoUrl?: string;
}

export const SPONSORS: Sponsor[] = [
  { name: 'Temenos', logoUrl: '/temenos.webp' },
  { name: 'Stitch', logoUrl: '/stitch.webp' },
  { name: 'Indian Bank', logoUrl: '/indian-bank.webp' },
];
