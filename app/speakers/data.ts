export interface Speaker {
  name: string;
  honorific?: "Mr" | "Mrs" | "Ms" | "Dr" | "Prof" | string;
  role: "Chief Guest" | "Guest of Honour";
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

export interface EventSpeaker {
  name: string;
  honorific?: "Mr" | "Mrs" | "Ms" | "Dr" | "Prof" | string;
  designation: string;
  organization: string;
  photoUrl?: string;
}

export interface EventSpeakerSession {
  id: string;
  eventName: string;
  time: string;
  speakers: EventSpeaker[];
}

export interface EventSpeakerDay {
  day: number;
  label: string;
  date: string;
  sessions: EventSpeakerSession[];
}

export const CEREMONIES: Ceremony[] = [
  {
    id: "inaugural",
    title: "Inaugural Ceremony",
    date: "3rd September 2026",
    time: "9:30 AM",
    speakers: [
      {
        name: "Aleksandr Fomin",
        honorific: "Mr",
        role: "Chief Guest",
        designation: "Deputy Consul General",
        organization: "Consul General of the Russian Federation in Chennai",
        photoUrl: "/alexander-formin.webp",
      },
      {
        name: "Arulselvam Harikrishnan",
        honorific: "Mr",
        role: "Guest of Honour",
        designation: "Vice President – Operations & Logistics",
        organization: "Daimler India Commercial Vehicles",
        photoUrl: "/arun-selvam.webp",
      },
    ],
  },
  {
    id: "valedictory",
    title: "Valedictory Ceremony",
    date: "4th September 2026",
    time: "3:30 PM",
    speakers: [
      {
        name: "Lakshminarayanan K V",
        honorific: "Dr",
        role: "Chief Guest",
        designation: "Vice President – HR",
        organization: "Data Patterns",
        photoUrl:
          "https://techno.team.a2ys.dev/team/IMG-20260831-WA0014-optimized.webp",
      },
      {
        name: "Charan R",
        honorific: "Mr",
        role: "Guest of Honour",
        designation: "Data Scientist",
        organization: "Google",
        photoUrl: "/charan.webp",
        extra: [
          "VIT-Chennai Alumnus",
          "B.Tech. Electronics & Communication Engineering (ECE)",
          "Gold Medalist – 2020–2024 Batch",
        ],
      },
    ],
  },
];

export const EVENT_SPEAKER_DAYS: EventSpeakerDay[] = [
  {
    day: 1,
    label: "technoVIT Day 1",
    date: "3rd September 2026",
    sessions: [
      {
        id: "animatathon",
        eventName: "ANIMATATHON",
        time: "11:00 AM - 03:00 PM",
        speakers: [
          {
            name: "K.S Sangeetha",
            honorific: "Ms",
            designation: "Center Head",
            organization: "Arena Animation",
            photoUrl: "https://cdn.puang.in/images/photos/9cbdc3cb-bf4c-4cbb-9a73-fae1e6222cf1-sangeetha.webp"
          },
          {
            name: "Ragavender",
            honorific: "Mr",
            designation: "Academic Trainer",
            organization: "Arena Animation",
            photoUrl: "https://cdn.puang.in/images/photos/9a20e7c7-32d5-4bff-89e0-eb290c91cdd7-ragavendhar.webp"
          },
          {
            name: "M. Vinay Dakshin",
            honorific: "Mr",
            designation: "Student Coordinator",
            organization: "Arena Animation",
            photoUrl: "https://cdn.puang.in/images/photos/1a871485-a25d-4537-8706-b792dc61b8de-vinay.webp"
          },
          {
            name: "Yogesh U",
            honorific: "Mr",
            designation: "Regional Academic Head (Tamil Nadu & Kerala)",
            organization: "Arena Animation",
            photoUrl: "https://cdn.puang.in/images/photos/83358383-d481-48b8-b34f-17bf751d9644-yogesh.webp"
          },
        ],
      },
      {
        id: "cineforge-cinematography",
        eventName: "Cineforge Cinematography",
        time: "02:00 PM - 04:00 PM",
        speakers: [
          {
            name: "Arul Vincent",
            honorific: "Mr",
            designation: "Director of Photography",
            organization: "Tamil Film Industry",
            photoUrl: "https://cdn.puang.in/images/photos/b09e4608-1ea8-4250-b526-db5575f9cd65-arun-dop.webp"
          },
        ],
      },
      {
        id: "bridging-tech-and-people",
        eventName: "Bridging Tech and People",
        time: "11:00 AM - 12:30 PM",
        speakers: [
          {
            name: "Sravanthi T",
            honorific: "Ms",
            designation: "Technical Trainer",
            organization: "Zoho",
            photoUrl: "https://cdn.puang.in/images/photos/8758aea8-759c-46d2-9967-1a5b16e5e9d1-sravanthi.webp"
          },
        ],
      },
    ],
  },
  {
    day: 2,
    label: "Pre technoVIT Day 5",
    date: "2nd September 2026",
    sessions: [
      {
        id: "makers-market",
        eventName: "Makers Market",
        time: "09:00 AM – 05:00 PM",
        speakers: [
          {
            name: "Vivek D",
            honorific: "Mr",
            designation: "Co-founder",
            organization: "Little Joy Handmade Crafts",
            photoUrl: "https://cdn.puang.in/images/photos/236c1cb1-c0a5-4339-94bf-f38b328682de-vivek-d.jpeg",
          },
          {
            name: "Praveena C",
            honorific: "Ms",
            designation: "Co-founder",
            organization: "Little Joy Handmade Crafts",
            photoUrl: "https://cdn.puang.in/images/photos/4d575ea4-4810-479e-b05d-72b0ca8e6d97-praveena-c.jpeg",
          },
        ],
      },
      {
        id: "make-your-own-jarvis",
        eventName: "Make your Own Jarvis",
        time: "11:00 AM - 04:00 PM",
        speakers: [
          {
            name: "Venkatesh Santhana Krishnan",
            honorific: "Mr",
            designation: "VP – Technology Practice",
            organization: "Galent",
            photoUrl: "https://cdn.puang.in/images/photos/ef340d02-9ae9-4c16-84ad-59f693733340-19e064e6-b7ac-4393-9466-9026acd3b2d8.jpg",
          },
        ],
      },
    ],
  },
];
