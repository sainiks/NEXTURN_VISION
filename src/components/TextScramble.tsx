"use client";

import { useState, useEffect, useRef } from "react";

const CHARS = "!<>-_\\\\/[]{}—=+*^?#________";

export default function TextScramble({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const [text, setText] = useState(children);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrambleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const scramble = () => {
      let iteration = 0;

      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      intervalRef.current = setInterval(() => {
        setText(
          children
            .split("")
            .map((letter, index) => {
              if (index < iteration) return children[index];
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration >= children.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          timeoutRef.current = setTimeout(scramble, 1800);
        }

        iteration += 1 / 3;
      }, 30);
    };

    scrambleRef.current = scramble;
    scramble();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [children]);

  const handleMouseEnter = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (scrambleRef.current) scrambleRef.current();
  };

  return (
    <span
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {text}
    </span>
  );
}
