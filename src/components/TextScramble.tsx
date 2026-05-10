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

  const handleMouseOver = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setText((prev) =>
        children
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return children[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= children.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      iteration += 1 / 3; // Controls speed of scramble resolution
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span
      className={`inline-block ${className}`}
      onMouseOver={handleMouseOver}
    >
      {text}
    </span>
  );
}
