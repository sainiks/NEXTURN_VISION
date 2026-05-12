"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const links = [
  { title: "HOME", href: "/" },
  { title: "TEAM", href: "/team" },
  { title: "RECRUITERS", href: "/recruiters" },
  { title: "STUDENTS", href: "/students" },
  { title: "PIPELINE", href: "/pipeline" },
  { title: "CONTACT", href: "#contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-8 right-8 z-40 brutalist-btn p-4 mix-blend-difference"
      >
        <Menu size={32} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[var(--color-foreground)] text-[var(--color-background)] flex flex-col justify-center px-8 md:px-24 brutalist-border-b"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 md:right-24 p-4 border-4 border-[var(--color-background)] hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)] transition-colors duration-200"
            >
              <X size={32} />
            </button>

            <nav className="flex flex-col gap-4 md:gap-6">
              {links.map((link, i) => (
                <div key={i} className="overflow-hidden">
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="inline-block text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter hover:text-[var(--color-accent)] hover:translate-x-8 transition-transform duration-300"
                  >
                    <motion.span
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{
                        duration: 0.5,
                        delay: isOpen ? 0.2 + i * 0.1 : 0,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="inline-block"
                    >
                      {link.title}
                    </motion.span>
                  </Link>
                </div>
              ))}
            </nav>

            <div className="absolute bottom-8 left-8 right-8 md:left-24 md:right-24 flex justify-between uppercase font-bold tracking-widest text-sm border-t-4 border-[var(--color-background)] pt-4">
              <span>IITM • NEXTURN</span>
              <span>EST. 2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
