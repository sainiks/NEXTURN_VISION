"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={position}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={toggleTheme}
      className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-50 p-2.5 md:p-3 rounded-full border-[3px] border-[var(--color-foreground)] bg-[var(--color-foreground)] text-[var(--color-background)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)] transition-all duration-300 shadow-[4px_4px_0px_var(--color-accent)] flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  );
}
