export interface Speaker {
  name: string;
  role: 'Chief Guest' | 'Guest of Honour';
  designation: string;
  organization: string;
  extra?: string[];
  photoUrl?: string;
}

export interface Ceremony {
  id: string;
  title: string;
  date: string;
  time: string;
  speakers: Speaker[];
}

export const CEREMONIES: Ceremony[] = [
  {
    id: 'inaugural',
    title: 'Inaugural Ceremony',
    date: '3rd September 2026',
    time: '9:30 AM',
    speakers: [
      {
        name: 'Mr. Aleksandr Fomin',
        role: 'Chief Guest',
        designation: 'Deputy Consul General',
        organization: 'Consul General of the Russian Federation in Chennai',
      },
      {
        name: 'Mr. Arulselvam Harikrishnan',
        role: 'Guest of Honour',
        designation: 'Vice President – Operations & Logistics',
        organization: 'Daimler India Commercial Vehicles',
      },
    ],
  },
  {
    id: 'valedictory',
    title: 'Valedictory Ceremony',
    date: '4th September 2026',
    time: '3:30 PM',
    speakers: [
      {
        name: 'Dr. Lakshminarayanan K V',
        role: 'Chief Guest',
        designation: 'Vice President – HR',
        organization: 'Data Patterns',
      },
      {
        name: 'Mr. Charan R',
        role: 'Guest of Honour',
        designation: 'Data Scientist',
        organization: 'Google',
        extra: [
          'VIT-Chennai Alumnus',
          'B.Tech. Electronics & Communication Engineering (ECE)',
          'Gold Medalist – 2020–2024 Batch',
        ],
      },
    ],
  },
];
