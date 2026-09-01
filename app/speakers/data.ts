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
    day: 2,
    label: "Day 2",
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
