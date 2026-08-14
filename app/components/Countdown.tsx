'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';


const FlipUnit = ({ value, label }: { value: string; label: string }) => {
  const numRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<string>(value);

  useEffect(() => {
    if (prevRef.current !== value && numRef.current) {

      gsap.fromTo(
        numRef.current,
        { y: 20, opacity: 0, filter: 'blur(4px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' }
      );
    }
    prevRef.current = value;
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1
      w-[50px] sm:w-[70px] md:w-[100px] lg:w-[120px] xl:w-[150px]">
      <span
        ref={numRef}
        className="font-bold font-clash leading-none tabular-nums
          text-3xl
          sm:text-4xl
          md:text-6xl
          lg:text-7xl
          xl:text-8xl
          w-full text-center"
      >
        {value}
      </span>
      <span className="font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-70
        text-[9px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">
        {label}
      </span>
    </div>
  );
};

const Countdown = ({ targetDate, className = 'text-[#08414a]' }: { targetDate: string; className?: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Days',    value: timeLeft.days },
    { label: 'Hours',   value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className={`flex justify-center items-end gap-1 sm:gap-2 md:gap-4 lg:gap-5 xl:gap-6 ${className}`}>
      {units.map(({ label, value }) => (
        <FlipUnit
          key={label}
          label={label}
          value={value.toString().padStart(2, '0')}
        />
      ))}
    </div>
  );
};

export default Countdown;
