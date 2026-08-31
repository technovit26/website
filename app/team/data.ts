export interface Person {
  name: string;
  role: string;
  photoUrl?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
  email?: string;
}

export interface TeamSection {
  id: string;
  title: string;
  description: string;
}

export const SECTIONS: Record<string, TeamSection> = {
  chiefPatron: {
    id: "chiefPatron",
    title: "Chief Patron",
    description: "The name TechnoVIT has run under since day one.",
  },
  patrons: {
    id: "patrons",
    title: "Patrons",
    description: "VIT's Vice-Presidents, backing the fest from the top.",
  },
  coPatrons: {
    id: "coPatrons",
    title: "Co-Patrons",
    description: "Campus leadership overseeing TechnoVIT.",
  },
  advisory: {
    id: "advisory",
    title: "Advisory Committee",
    description: "Overseeing student affairs across the Chennai campus.",
  },
  convenors: {
    id: "convenors",
    title: "TechnoVIT — Convenor & Co-Convenors",
    description: "Steering the fest end to end, from planning to execution.",
  },
  facultyOrganisers: {
    id: "facultyOrganisers",
    title: "TechnoVIT — Faculty Organisers",
    description: "One department each, guiding the student team behind it.",
  },
  studentOrganisers: {
    id: "studentOrganisers",
    title: "TechnoVIT — Student Organisers",
    description: "Running each department on ground, department by department.",
  },
};

// Photos are numbered in the order people appear in the source roster doc,
// skipping Dr. S. Devi Yamini, who is not in it (her photo is local) — image1 is G. Viswanathan,
// image42 is Karan Kumar, the last entry in that doc.
const TEAM_PHOTO_BASE = "https://techno.team.a2ys.dev/team";
function photo(n: number): string {
  return `${TEAM_PHOTO_BASE}/image${n}.webp`;
}

export const CHIEF_PATRON: Person[] = [
  {
    name: "Dr. G. Viswanathan",
    role: "Founder & Chancellor",
    photoUrl: photo(1),
  },
];

export const PATRONS: Person[] = [
  {
    name: "Dr. Sankar Viswanathan",
    role: "Vice-President",
    photoUrl: photo(2),
  },
  { name: "Dr. Sekar Viswanathan", role: "Vice-President", photoUrl: photo(3) },
  { name: "Dr. G.V. Selvam", role: "Vice-President", photoUrl: photo(4) },
];

export const CO_PATRONS: Person[] = [
  {
    name: "Dr. Kanchana Bhaaskaran V.S",
    role: "Vice-Chancellor",
    photoUrl: photo(5),
  },
  {
    name: "Dr. Thyagarajan T",
    role: "Pro-Vice Chancellor, Chennai Campus",
    photoUrl: photo(6),
  },
  {
    name: "Dr. K. Sathiyanarayanan",
    role: "Director, Chennai Campus",
    photoUrl: photo(7),
  },
  {
    name: "Dr. P.K. Manoharan",
    role: "Additional Registrar, Chennai Campus",
    photoUrl: photo(8),
  },
];

export const ADVISORY_COMMITTEE: Person[] = [
  {
    name: "Dr. Sathiya Narayanan S",
    role: "Director, SWF, Chennai Campus",
    photoUrl: photo(9),
  },
  // { name: 'Dr. Sankar Ganesh', role: 'Assistant Director, SWF, Chennai Campus', photoUrl: photo(10) },
];

export const CONVENORS: Person[] = [
  { name: "Dr. Jayasudha M", role: "Convenor, TechnoVIT", photoUrl: photo(11) },
  {
    name: "Dr. Giridharan A",
    role: "Co-Convenor, TechnoVIT",
    photoUrl: photo(12),
  },
  {
    name: "Dr. Bhuvaneswari M",
    role: "Co-Convenor, TechnoVIT",
    photoUrl: photo(13),
  },
  {
    name: "Dr. Arjun Shaji",
    role: "Co-Convenor, TechnoVIT",
    photoUrl: photo(14),
  },
];

// Dr. Deepika Roselind J kept first per request (Web and Technical Team).
export const FACULTY_ORGANISERS: Person[] = [
  {
    name: "Dr. Deepika Roselind J",
    role: "Web and Technical Team",
    photoUrl: photo(28),
  },
  {
    name: "Dr. Lavanya V",
    role: "Campus Decoration",
    photoUrl: photo(15),
  },
  {
    name: "Dr. S. Devi Yamini",
    role: "Design and Printing",
    photoUrl: "https://techno.team.a2ys.dev/team/IMG-20260831-WA0009.jpg",
  },
  { name: "Dr. Uma Maheswari S", role: "Documentation", photoUrl: photo(16) },
  { name: "Dr. Krithiga R", role: "Events", photoUrl: photo(17) },
  { name: "Dr. Vasugi K", role: "Finance", photoUrl: photo(18) },
  {
    name: "Dr. Saurav Gupta",
    role: "Guest Care & Accommodation",
    photoUrl: photo(19),
  },
  { name: "Dr. Umadevi S", role: "Press and Media", photoUrl: photo(20) },
  { name: "Dr. Jesica Roshima A", role: "Purchase", photoUrl: photo(21) },
  {
    name: "Dr. Ranjeet Kumar",
    role: "Publicity and Marketing",
    photoUrl: photo(22),
  },
  {
    name: "Prof. Shanthi Krishna",
    role: "Registration & Reception",
    photoUrl: photo(23),
  },
  { name: "Dr. Pradeep N", role: "Stalls and Expo", photoUrl: photo(24) },
  {
    name: "Dr. Praveen Joe I R",
    role: "Sponsorship & MoU",
    photoUrl: photo(25),
  },
  {
    name: "Dr. Radha R",
    role: "Stage Arrangements (Inaugural / Valedictory)",
    photoUrl: photo(26),
  },
  {
    name: "Dr. Senthil Pandian N",
    role: "Venue Arrangements and Refreshments",
    photoUrl: photo(27),
  },
];

// Karan Kumar leads Website Committee — kept first in this list per request.
export const STUDENT_ORGANISERS: Person[] = [
  { name: "Karan Kumar", role: "Website Committee", photoUrl: photo(42) },
  { name: "Arathi Manukumar", role: "Campus Decoration", photoUrl: photo(29) },
  { name: "Yoha Yazhini G", role: "Design and Printing", photoUrl: photo(30) },
  { name: "Samprikta Sarkar", role: "Documentation", photoUrl: photo(31) },
  { name: "Sivani P Nathan", role: "Events", photoUrl: photo(32) },
  { name: "Aman Brahma", role: "Finance", photoUrl: photo(33) },
  {
    name: "Epparala Sri Medha",
    role: "Guest Care & Accommodation",
    photoUrl: photo(34),
  },
  { name: "Atharva Anil Shukla", role: "Press and Media", photoUrl: photo(35) },
  { name: "Shreyavarshini Subramanian", role: "Purchase", photoUrl: photo(36) },
  {
    name: "Swathy Sree R",
    role: "Publicity and Marketing",
    photoUrl: photo(37),
  },
  {
    name: "Ragoor Shashank Reddy",
    role: "Registration & Reception",
    photoUrl: photo(38),
  },
  { name: "Kirankumar R", role: "Stalls and Expo", photoUrl: photo(39) },
  { name: "Sharan K", role: "Sponsorship & MoU", photoUrl: photo(40) },
  {
    name: "Vanshika Rathi",
    role: "Venue Arrangements & Refreshments",
    photoUrl: photo(41),
  },
];
