"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UsersThree } from "@phosphor-icons/react";
import Marquee from "../components/Marquee";
import MarqueeCTA from "../components/MarqueeCTA";
import MemberCard from "./MemberCard";
import {
  ADVISORY_COMMITTEE,
  CHIEF_PATRON,
  CONVENORS,
  CO_PATRONS,
  FACULTY_ORGANISERS,
  PATRONS,
  SECTIONS,
  STUDENT_ORGANISERS,
  type Person,
  type TeamSection,
} from "./data";

gsap.registerPlugin(ScrollTrigger);

const CURTAIN_ITEMS = ["TechnoVIT'26"];

function tagFor(prefix: string, i: number): string {
  return `${prefix}_${String(i).padStart(3, "0")}.dat`;
}

function SectionHeading({ section }: { section: TeamSection }) {
  return (
    <div className="flex flex-col gap-3 mb-10 md:mb-12">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#84C87F]/15" />
        <span className="font-bold uppercase tracking-[0.3em] text-[#84C87F]/50 text-[10px] sm:text-xs whitespace-nowrap">
          {section.title}
        </span>
        <div className="h-px flex-1 bg-[#84C87F]/15" />
      </div>
      <p className="text-[#c2e0a5]/60 text-sm sm:text-base text-center max-w-lg mx-auto leading-relaxed">
        {section.description}
      </p>
    </div>
  );
}

function AnimatedGrid({
  members,
  prefix,
  size = "md",
  aspect,
  gridClassName,
  itemClassName,
}: {
  members: Person[];
  prefix: string;
  size?: "md" | "lg";
  aspect: string;
  gridClassName: string;
  itemClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!ref.current) return;
      const cards = ref.current.querySelectorAll(".member-card");
      gsap.fromTo(
        cards,
        { y: 36, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 88%" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={gridClassName}>
      {members.map((m, i) =>
        itemClassName ? (
          <div key={m.name} className={itemClassName}>
            <MemberCard
              member={m}
              tag={tagFor(prefix, i)}
              size={size}
              aspect={aspect}
            />
          </div>
        ) : (
          <MemberCard
            key={m.name}
            member={m}
            tag={tagFor(prefix, i)}
            size={size}
            aspect={aspect}
          />
        ),
      )}
    </div>
  );
}

export default function TeamContent() {
  const bigTitleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bigTitleRef.current,
        { y: 60, opacity: 0, filter: "blur(12px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power3.out",
        },
      );

      if (introRef.current) {
        gsap.fromTo(
          introRef.current,
          { y: 30, opacity: 0, filter: "blur(6px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: introRef.current, start: "top 85%" },
          },
        );
      }

      if (closingRef.current) {
        gsap.fromTo(
          closingRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: closingRef.current, start: "top 88%" },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative min-h-[100dvh] bg-[#064928] overflow-x-hidden">
      <section
        className="sticky top-0 z-0 min-h-[100dvh] flex items-center justify-center select-none
          bg-[#c2e0a5] px-5 sm:px-10 md:px-16 lg:px-24 overflow-hidden"
      >
        <h1
          ref={bigTitleRef}
          className="font-clash font-bold text-[#04331c] opacity-[0.22] leading-none
            text-[22vw] tracking-tight uppercase"
        >
          TEAM
        </h1>
      </section>

      <section
        className="relative z-10 min-h-[100dvh] flex flex-col justify-center gap-6 sm:gap-8
          bg-[#84C87F] text-[#04331c] py-16 overflow-hidden"
      >
        <Marquee items={CURTAIN_ITEMS} size="lg" />
        <Marquee reverse size="lg" />
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <div
          ref={introRef}
          className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4"
        >
          <UsersThree size={22} weight="bold" className="text-[#84C87F]/70" />
          <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
            The people behind TechnoVIT&apos;26.
          </p>
          <p className="text-[#c2e0a5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
            Two days, every discipline, one fest —
            <span className="text-[#84C87F] font-semibold">
              {" "}
              planned by university leadership, run department by department by
              faculty and student organisers.
            </span>
          </p>
        </div>
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <SectionHeading section={SECTIONS.chiefPatron} />
        <AnimatedGrid
          members={CHIEF_PATRON}
          prefix="CPAT"
          size="lg"
          aspect="aspect-[21/20]"
          gridClassName="grid grid-cols-1 max-w-xs mx-auto"
        />
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <SectionHeading section={SECTIONS.patrons} />
        <AnimatedGrid
          members={PATRONS}
          prefix="PAT"
          size="lg"
          aspect="aspect-[13/15]"
          gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto"
        />
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <SectionHeading section={SECTIONS.coPatrons} />
        <AnimatedGrid
          members={CO_PATRONS}
          prefix="COPAT"
          size="lg"
          aspect="aspect-[17/18]"
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto"
        />
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <SectionHeading section={SECTIONS.advisory} />
        <AnimatedGrid
          members={ADVISORY_COMMITTEE}
          prefix="ADV"
          size="lg"
          aspect="aspect-[3/4]"
          gridClassName="grid grid-cols-1 max-w-xs mx-auto"
        />
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <SectionHeading section={SECTIONS.convenors} />
        <AnimatedGrid
          members={CONVENORS}
          prefix="CONV"
          size="lg"
          aspect="aspect-[5/6]"
          gridClassName="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto"
        />
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <SectionHeading section={SECTIONS.facultyOrganisers} />
        <AnimatedGrid
          members={FACULTY_ORGANISERS}
          prefix="FAC"
          aspect="aspect-[5/6]"
          gridClassName="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-6xl mx-auto"
          itemClassName="flex-none basis-[calc(50%-0.5rem)] sm:basis-[calc(33.333%-1rem)] lg:basis-[calc(25%-1.125rem)]"
        />
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <SectionHeading section={SECTIONS.studentOrganisers} />
        <AnimatedGrid
          members={STUDENT_ORGANISERS}
          prefix="STU"
          aspect="aspect-[12/13]"
          gridClassName="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-6xl mx-auto"
          itemClassName="flex-none basis-[calc(50%-0.5rem)] sm:basis-[calc(33.333%-1rem)] lg:basis-[calc(25%-1.125rem)]"
        />
      </section>

      <section
        className="relative overflow-hidden bg-[#064928]
        px-5 sm:px-10 md:px-16 lg:px-24 py-20 sm:py-24 md:py-32"
      >
        <div
          className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none"
          aria-hidden
        >
          <span className="font-clash font-bold text-[35vw] leading-none text-white opacity-[0.035] pr-4 translate-x-8">
            26
          </span>
        </div>

        <div
          ref={closingRef}
          className="relative max-w-7xl mx-auto flex flex-col items-center text-center gap-6 sm:gap-8"
        >
          <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
            Come meet them at the fest.
          </p>
          <p className="text-white/55 text-xs sm:text-sm uppercase tracking-[0.3em] font-bold">
            3rd &amp; 4th September · VIT Chennai
          </p>

          <div className="w-16 sm:w-20 h-px bg-[#84C87F]/25" />

          <MarqueeCTA
            href="/events"
            label="Explore Events"
            dataCursor="Explore"
          />
        </div>
      </section>
    </main>
  );
}
