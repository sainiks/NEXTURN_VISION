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
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Placement Rate</span>
              <span className="stat-number text-6xl md:text-8xl font-black" data-target="96" data-suffix="%">0%</span>
            </div>
            <div className="flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-black pt-8 md:pt-0 md:pl-8 transition-colors duration-500">
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Active Partners</span>
              <span className="stat-number text-6xl md:text-8xl font-black" data-target="150" data-suffix="+">0+</span>
            </div>
            <div className="flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-black pt-8 md:pt-0 md:pl-8 transition-colors duration-500">
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Avg. CTC (LPA)</span>
              <span className="stat-number text-6xl md:text-8xl font-black" data-target="12" data-suffix="L">0L</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-y-32">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="parallax-card inverted-hover brutalist-border p-8 cursor-pointer flex flex-col justify-between aspect-video relative group bg-[var(--color-background)] hover:border-[var(--color-home-accent)] transition-colors duration-200"
              >
                <div>
                  <h3 className="text-3xl font-black uppercase mb-2 group-hover:text-[var(--color-background)] transition-colors duration-200">Software Engineer</h3>
                  <p className="font-medium opacity-80 uppercase tracking-widest">B.Tech 2026</p>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-5xl font-black text-[var(--color-home-accent)] group-hover:text-[var(--color-background)] transition-colors duration-200">0{item}</span>
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
          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold uppercase mb-4">Connect</h4>
            <a href="https://www.linkedin.com/company/nexturn-iitm/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-home-accent)] hover:underline uppercase font-bold tracking-widest">LinkedIn</a>
            <a href="https://www.instagram.com/nexturn.iitm/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-home-accent)] hover:underline uppercase font-bold tracking-widest">Instagram</a>
          </div>
          <div className="text-right">
            <p className="font-bold uppercase tracking-widest mb-2">Institute of Innovation in Technology & Management</p>
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
