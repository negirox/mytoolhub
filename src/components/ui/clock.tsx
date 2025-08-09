
'use client';

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

export function Clock() {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();
      setTime({
        hours: (hours % 12) + minutes / 60,
        minutes: minutes + seconds / 60,
        seconds: seconds,
      });
    };

    updateClock(); // Initial call
    const timerId = setInterval(updateClock, 1000);

    return () => clearInterval(timerId);
  }, []);

  const hourDeg = time.hours * 30;
  const minuteDeg = time.minutes * 6;
  const secondDeg = time.seconds * 6;

  return (
    <div className="clock-container relative w-48 h-48 rounded-full border-4 border-primary bg-background shadow-lg flex items-center justify-center">
      <div className="clock-face absolute w-full h-full">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="clock-number"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <span style={{ transform: `rotate(-${i * 30}deg)` }}>
              {i === 0 ? 12 : i}
            </span>
          </div>
        ))}
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "clock-tick",
              i % 5 === 0 ? "clock-tick-large" : "clock-tick-small"
            )}
            style={{ transform: `rotate(${i * 6}deg)` }}
          />
        ))}
      </div>
      <div
        className="clock-hand clock-hand-hour"
        style={{ transform: `rotate(${hourDeg}deg)` }}
      />
      <div
        className="clock-hand clock-hand-minute"
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      />
      <div
        className="clock-hand clock-hand-second"
        style={{ transform: `rotate(${secondDeg}deg)` }}
      />
      <div className="clock-center-dot" />
    </div>
  );
}
