"use client";

import { motion } from "framer-motion";

const partners = [
  "GOOGLE",
  "MICROSOFT",
  "AMAZON",
  "GOLDMAN SACHS",
  "DE SHAW",
  "ZOMATO",
  "ATLASSIAN",
  "UBER",
];

export default function Marquee() {
  return (
    <div className="relative w-full overflow-hidden bg-[var(--color-foreground)] text-[var(--color-background)] py-4 flex border-y-[3px] border-[var(--color-foreground)]">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 20,
        }}
      >
        {/* We render the list twice to ensure seamless looping */}
        {[...partners, ...partners, ...partners, ...partners].map((partner, i) => (
          <div key={i} className="flex items-center mx-8">
            <span className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              {partner}
            </span>
            <span className="mx-8 text-2xl text-[var(--color-accent)]">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
