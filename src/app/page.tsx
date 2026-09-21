"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";
import Marquee from "@/components/Marquee";
import TextScramble from "@/components/TextScramble";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

const InteractiveCube = dynamic(() => import("@/components/InteractiveCube"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { theme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [topTalents, setTopTalents] = useState<any[]>([
    { id: 1, full_name: "Aarav Sharma", course: "B.Tech CSE 2026", company: "GOOGLE", pic: "", role: "Software Engineer" },
    { id: 2, full_name: "Diya Patel", course: "BCA 2026", company: "MICROSOFT", pic: "", role: "Full Stack Developer" },
    { id: 3, full_name: "Rohan Verma", course: "B.Tech IT 2026", company: "ZOMATO", pic: "", role: "Data Systems Engineer" },
    { id: 4, full_name: "Ananya Iyer", course: "B.Tech CSE 2026", company: "ATLASSIAN", pic: "", role: "AI / ML Researcher" },
  ]);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.topTalents && data.data.topTalents.length > 0) {
          setTopTalents(data.data.topTalents.slice(0, 4));
        }
      })
      .catch((err) => console.error("Failed to load top talents", err));
  }, []);

  useEffect(() => {
    // 1. Hero Reveal Sequence
    const tl = gsap.timeline({
      onComplete: () => setIsGridVisible(true),
    });

    tl.fromTo(
      ".hero-text",
      { y: 200, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", stagger: 0.1 }
    ).to(".hero-mask", { height: 0, duration: 0.8, ease: "power3.inOut" }, "+=0.2");

    // 2. Data Tickers using ScrollTrigger
    const stats = gsap.utils.toArray<HTMLElement>(".stat-number");
    stats.forEach((stat) => {
      const target = parseInt(stat.getAttribute("data-target") || "0", 10);
      gsap.to(stat, {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
        },
        innerHTML: target,
        duration: 2,
        ease: "power2.out",
        snap: { innerHTML: 1 },
        onUpdate: function () {
          stat.innerHTML = Math.ceil(this.targets()[0].innerHTML).toString() + (stat.getAttribute("data-suffix") || "");
        },
      });
    });

    // 3. Parallax for Portfolio Cards
    gsap.utils.toArray<HTMLElement>(".parallax-card").forEach((card, i) => {
      gsap.to(card, {
        y: -100 + (i % 2) * 50,
        ease: "none",
        scrollTrigger: {
          trigger: card.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [theme]);

  return (
    <main className="min-h-screen">
      {/* --- HERO SECTION --- */}
      <section ref={heroRef} className="relative h-screen flex flex-col justify-center items-center overflow-hidden brutalist-border-b px-4">
        <div className="absolute inset-0 z-10 hero-mask bg-[var(--color-background)]" />

        <div className="group z-20 px-8 py-4 md:px-12 md:py-6 border-[3px] border-[var(--color-foreground)] bg-white/5 backdrop-blur-xl overflow-hidden flex justify-center items-center shadow-[8px_8px_0px_#000] hover:bg-black hover:shadow-[8px_8px_0px_var(--color-accent)] transition-all duration-300">
          <h1 className="text-[12vw] font-black tracking-tighter leading-none flex uppercase text-[var(--color-foreground)] group-hover:!text-white transition-colors duration-300">
            {["N", "E", "X", "T", "U", "R", "N"].map((letter, i) => (
              <span key={i} className="hero-text inline-block transform translate-y-[200px]">
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* INTERACTIVE 3D CUBE GRID */}
        {isGridVisible && <InteractiveCube />}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isGridVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-12 flex gap-6 z-20"
        >
          <MagneticButton className="!bg-[var(--color-foreground)] !text-[var(--color-background)] hover:!bg-black hover:!text-white shadow-[6px_6px_0px_#000]">
            Register Drive
          </MagneticButton>
          <Link href="/pipeline">
            <MagneticButton className="!bg-transparent !text-[var(--color-foreground)] border-2 border-[var(--color-foreground)] hover:!bg-black hover:!text-white shadow-[6px_6px_0px_#000]">
              View Pipeline
            </MagneticButton>
          </Link>
        </motion.div>
      </section>

      <Marquee />

      {/* --- STATISTICS SECTION --- */}
      <section ref={statsRef} className="py-32 px-8 border-b-[3px] border-[var(--color-foreground)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-bold uppercase mb-16 border-l-4 border-[var(--color-home-accent)] pl-6">
            <TextScramble>Cell Statistics</TextScramble>
          </h2>
          <div key={theme} className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white text-black border-[3px] border-[var(--color-foreground)] shadow-[8px_8px_0px_var(--color-home-accent)] transition-all duration-500">
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Placement Assistance</span>
              <span className="stat-number text-6xl md:text-8xl font-black" data-target="100" data-suffix="%">0%</span>
            </div>
            <div className="flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-black pt-8 md:pt-0 md:pl-8 transition-colors duration-500">
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Active Partners</span>
              <span className="stat-number text-6xl md:text-8xl font-black" data-target="155" data-suffix="+">0+</span>
            </div>
            <div className="flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-black pt-8 md:pt-0 md:pl-8 transition-colors duration-500">
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Avg. CTC (LPA)</span>
              <span className="stat-number text-6xl md:text-8xl font-black" data-target="6" data-suffix="L">0L</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- PORTFOLIO / ENTITIES --- */}
      <section className="py-32 px-8 bg-[var(--color-background)] text-[var(--color-foreground)] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-bold uppercase mb-16 text-right border-r-4 border-[var(--color-home-accent)] pr-6">
            <TextScramble>Top Talent</TextScramble>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {topTalents.map((talent, index) => (
              <div
                key={talent.id || index}
                className="parallax-card inverted-hover brutalist-border p-4 md:p-5 cursor-pointer flex flex-col justify-between min-h-[280px] relative group bg-[var(--color-background)] hover:border-[var(--color-home-accent)] transition-colors duration-200"
              >
                <div className="flex items-start gap-4 md:gap-5">
                  {/* Talent Profile Photo - Square Round & Bigger */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 aspect-square rounded-2xl md:rounded-3xl bg-[var(--color-surface)] border-2 md:border-3 border-[var(--color-foreground)] flex-shrink-0 relative overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_var(--color-border)] group-hover:border-[var(--color-background)] transition-colors">
                    {talent.pic ? (
                      <img
                        src={talent.pic}
                        alt={talent.full_name || "Top Talent"}
                        className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
                      />
                    ) : (
                      <span className="font-mono font-black text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-[var(--color-foreground)] group-hover:text-[var(--color-background)] transition-colors">
                        {talent.full_name
                          ? talent.full_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : `0${index + 1}`}
                      </span>
                    )}
                  </div>

                  {/* Talent Name, Course & Company */}
                  <div className="min-w-0 flex-1">
                    {talent.company && (
                      <div className="mb-2">
                        <span className="inline-block bg-[var(--color-foreground)] text-[var(--color-background)] px-2.5 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider group-hover:bg-[var(--color-background)] group-hover:text-[var(--color-foreground)] transition-colors">
                          @ {talent.company}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl md:text-2xl font-black uppercase mb-1 leading-tight break-words group-hover:text-[var(--color-background)] transition-colors duration-200">
                      {talent.full_name || "Top Talent"}
                    </h3>
                    <p className="font-mono text-xs md:text-sm font-bold uppercase tracking-wider text-[var(--color-home-accent)] group-hover:text-[var(--color-background)] transition-colors duration-200">
                      {talent.course || "B.Tech 2026"}
                    </p>
                    {talent.role && talent.role.trim().length > 0 && (
                      <p className="mt-2 text-xs font-mono opacity-75 uppercase group-hover:text-[var(--color-background)] transition-colors duration-200">
                        {talent.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-6">
                  <span className="text-4xl md:text-5xl font-black text-[var(--color-home-accent)] group-hover:text-[var(--color-background)] transition-colors duration-200">
                    0{index + 1}
                  </span>
                  <div className="w-12 h-12 brutalist-border rounded-full bg-[var(--color-home-accent)] group-hover:bg-[var(--color-background)] group-hover:border-[var(--color-background)] transform scale-0 group-hover:scale-100 transition-all origin-center ease-out duration-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MASSIVE FOOTER --- */}
      <footer className="pt-32 pb-8 px-8 brutalist-border-t bg-[var(--color-foreground)] text-[var(--color-background)] overflow-hidden relative transition-colors duration-500">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="flex flex-col gap-3">
            <h4 className="text-xl font-bold uppercase mb-2">Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/nexturn-iitm/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-3 border-2 border-[var(--color-background)] hover:border-[var(--color-home-accent)] hover:text-[var(--color-home-accent)] hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/nexturn.iitm/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-3 border-2 border-[var(--color-background)] hover:border-[var(--color-home-accent)] hover:text-[var(--color-home-accent)] hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold uppercase tracking-widest mb-2">IITM College of Engineering</p>
            <p className="opacity-80">Janakpuri, New Delhi</p>
            <p className="opacity-80">placement@iitmjp.ac.in</p>
          </div>
        </div>

        <h1 className="text-[15vw] font-black tracking-tighter leading-none text-center select-none uppercase">
          <TextScramble>NEXTURN</TextScramble>
        </h1>

        <div className="mt-8 pt-8 border-t-[3px] border-[var(--color-background)] flex justify-between text-sm font-bold uppercase tracking-widest">
          <span>© 2024 NEXTURN</span>
          <span>ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </main>
  );
}
