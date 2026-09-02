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
      "https://cdn.puang.in/images/photos/12f6bf89-00b7-42d9-856a-0e6971736da2-13f95ab7-72be-46d1-b938-be91fd258d39.jpeg",
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
