export interface Sponsor {
  name: string;
  tagline?: string;
  logoUrl?: string;
}

export const SPONSORS: Sponsor[] = [
  { name: "Temenos", logoUrl: "/temenos.webp" },
  { name: "Stitch", logoUrl: "/stitch.webp" },
  { name: "Indian Bank", logoUrl: "/indian-bank.webp" },
];

export const PARTNERS: Sponsor[] = [
  {
    name: "HelloFM",
    tagline: "Media Partner",
    logoUrl:
      "https://techno.team.a2ys.dev/sponsors/sponsors_IMG-20260831-WA0012-optimized%20(1).webp",
  },
  {
    name: "College Rivals",
    tagline: "Gaming Partner",
    logoUrl:
      "https://techno.team.a2ys.dev/sponsors/sponsors_IMG-20260831-WA0011-optimized.webp",
  },
  {
    name: "Dinamalar",
    tagline: "Digital Partner",
    logoUrl:
      "https://techno.team.a2ys.dev/sponsors/sponsors_DMR%2075-optimized.webp",
  },
];
