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
    id: 'chiefPatron',
    title: 'Chief Patron',
    description: 'The name TechnoVIT has run under since day one.',
  },
  patrons: {
    id: 'patrons',
    title: 'Patrons',
    description: "VIT's Vice-Presidents, backing the fest from the top.",
  },
  coPatrons: {
    id: 'coPatrons',
    title: 'Co-Patrons',
    description: 'Campus leadership overseeing TechnoVIT.',
  },
  advisory: {
    id: 'advisory',
    title: 'Advisory Committee',
    description: 'Overseeing student affairs across the Chennai campus.',
  },
  convenors: {
    id: 'convenors',
    title: 'TechnoVIT — Convenor & Co-Convenors',
    description: 'Steering the fest end to end, from planning to execution.',
  },
  facultyOrganisers: {
    id: 'facultyOrganisers',
    title: 'TechnoVIT — Faculty Organisers',
    description: 'One department each, guiding the student team behind it.',
  },
  studentOrganisers: {
    id: 'studentOrganisers',
    title: 'TechnoVIT — Student Organisers',
    description: 'Running each department on ground, department by department.',
  },
};

// Photos to be added via CDN links — photoUrl left undefined for now.

export const CHIEF_PATRON: Person[] = [
  { name: 'Dr. G. Viswanathan', role: 'Chancellor' },
];

export const PATRONS: Person[] = [
  { name: 'Dr. Sankar Viswanathan', role: 'Vice-President' },
  { name: 'Dr. Sekar Viswanathan', role: 'Vice-President' },
  { name: 'Dr. G.V. Selvam', role: 'Vice-President' },
];

export const CO_PATRONS: Person[] = [
  { name: 'Dr. Kanchana Bhaaskaran V.S', role: 'Vice-Chancellor' },
  { name: 'Dr. Thyagarajan T', role: 'Pro-Vice Chancellor, Chennai Campus' },
  { name: 'Dr. K. Sathiyanarayanan', role: 'Director, Chennai Campus' },
  { name: 'Dr. P.K. Manoharan', role: 'Additional Registrar, Chennai Campus' },
];

export const ADVISORY_COMMITTEE: Person[] = [
  { name: 'Dr. Sathiya Narayanan S', role: 'Director, SWF, Chennai Campus' },
  { name: 'Dr. Sankar Ganesh', role: 'Assistant Director, SWF, Chennai Campus' },
];

export const CONVENORS: Person[] = [
  { name: 'Dr. Jayasudha M', role: 'Convenor, TechnoVIT' },
  { name: 'Dr. Giridharan A', role: 'Co-Convenor, TechnoVIT' },
  { name: 'Dr. Bhuvaneswari M', role: 'Co-Convenor, TechnoVIT' },
  { name: 'Dr. Arjun Shaji', role: 'Co-Convenor, TechnoVIT' },
];

// Dr. Deepika Roselind J kept first per request (Web and Technical Team).
export const FACULTY_ORGANISERS: Person[] = [
  { name: 'Dr. Deepika Roselind J', role: 'Web and Technical Team' },
  { name: 'Dr. Lavanya V', role: 'Campus Decoration' },
  { name: 'Dr. S. Devi Yamini', role: 'Design and Printing' },
  { name: 'Dr. Uma Maheswari S', role: 'Documentation' },
  { name: 'Dr. Krithiga R', role: 'Events' },
  { name: 'Dr. Vasugi K', role: 'Finance' },
  { name: 'Dr. Saurav Gupta', role: 'Guest Care & Accommodation' },
  { name: 'Dr. Umadevi S', role: 'Press and Media' },
  { name: 'Dr. Jesica Roshima A', role: 'Purchase' },
  { name: 'Dr. Ranjeet Kumar', role: 'Publicity and Marketing' },
  { name: 'Prof. Shanthi Krishna', role: 'Registration & Reception' },
  { name: 'Dr. Pradeep N', role: 'Stalls and Expo' },
  { name: 'Dr. Praveen Joe I R', role: 'Sponsorship & MoU' },
  { name: 'Dr. Radha R', role: 'Stage Arrangements (Inaugural / Valedictory)' },
  { name: 'Dr. Senthil Pandian N', role: 'Venue Arrangements and Refreshments' },
];

// Karan Kumar leads Website Committee — kept first in this list per request.
export const STUDENT_ORGANISERS: Person[] = [
  { name: 'Karan Kumar', role: 'Website Committee' },
  { name: 'Arathi Manukumar', role: 'Campus Decoration' },
  { name: 'Yoha Yazhini G', role: 'Design and Printing' },
  { name: 'Samprikta Sarkar', role: 'Documentation' },
  { name: 'Sivani P Nathan', role: 'Events' },
  { name: 'Aman Brahma', role: 'Finance' },
  { name: 'Epparala Sri Medha', role: 'Guest Care & Accommodation' },
  { name: 'Atharva Anil Shukla', role: 'Press and Media' },
  { name: 'Shreyavarshini Subramanian', role: 'Purchase' },
  { name: 'Swathy Sree R', role: 'Publicity and Marketing' },
  { name: 'Ragoor Shashank Reddy', role: 'Registration & Reception' },
  { name: 'Kirankumar R', role: 'Stalls and Expo' },
  { name: 'Sharan K', role: 'Sponsorship & MoU' },
  { name: 'Vanshika Rathi', role: 'Stage Arrangements (Inaugural / Valedictory)' },
];
