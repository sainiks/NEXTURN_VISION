"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";
import Marquee from "@/components/Marquee";
import TextScramble from "@/components/TextScramble";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowUpRight, Sparkles } from "lucide-react";

const InteractiveCube = dynamic(() => import("@/components/InteractiveCube"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
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
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden brutalist-border-b px-4 py-20">
        <div className="absolute inset-0 z-10 hero-mask bg-[var(--color-background)]" />

        <div className="group z-20 px-4 py-3 sm:px-8 md:px-12 md:py-6 border-[3px] border-[var(--color-foreground)] bg-white/5 backdrop-blur-xl overflow-hidden flex justify-center items-center shadow-[6px_6px_0px_#000] md:shadow-[8px_8px_0px_#000] hover:bg-black hover:shadow-[8px_8px_0px_var(--color-accent)] transition-all duration-300">
          <h1 className="text-[17vw] sm:text-[14vw] md:text-[12vw] font-black tracking-tighter leading-none flex uppercase text-[var(--color-foreground)] group-hover:!text-white transition-colors duration-300">
            <TextScramble className="hero-text transform translate-y-[200px]">NEXTURN</TextScramble>
          </h1>
        </div>

        {/* INTERACTIVE 3D CUBE GRID */}
        {isGridVisible && <InteractiveCube />}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isGridVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 z-20 w-full sm:w-auto px-4 sm:px-0"
        >
          <Link href="/recruiters#register-drive" className="w-full sm:w-auto">
            <MagneticButton className="w-full sm:w-auto !bg-[var(--color-foreground)] !text-[var(--color-background)] hover:!bg-black hover:!text-white shadow-[6px_6px_0px_#000]">
              Register Drive
            </MagneticButton>
          </Link>
          <Link href="/pipeline">
            <MagneticButton className="w-full sm:w-auto !bg-transparent !text-[var(--color-foreground)] border-2 border-[var(--color-foreground)] hover:!bg-black hover:!text-white shadow-[6px_6px_0px_#000]">
              View Pipeline
            </MagneticButton>
          </Link>
        </motion.div>
      </section>

      <Marquee />

      {/* --- FUSION-X RETURN TEASER --- */}
      <section aria-labelledby="fusion-x-title" className="relative overflow-hidden border-b-[3px] border-[var(--color-foreground)] bg-[var(--color-accent)] text-black">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[43%] overflow-hidden border-l border-black/10 md:block">
          <div className="absolute inset-0 bg-[#101014] [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]" />
          <div className="absolute inset-y-0 right-0 w-[78%] opacity-30 [background-image:linear-gradient(rgba(255,255,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(90deg,transparent,black_45%)]" />
          <div className="absolute inset-y-[15%] left-[23%] w-px bg-white/15" />
          <div className="absolute inset-y-[15%] left-[28%] w-px bg-white/10" />
          <div className="absolute left-[34%] top-1/2 w-[58%] -translate-y-1/2">
            <motion.div className="relative aspect-square" animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}>
              <span className="absolute inset-0 flex items-center justify-center font-black text-[15rem] leading-none tracking-[-0.14em] text-white/[0.06]">X</span>
              <svg viewBox="0 0 240 240" className="absolute inset-[12%] h-[76%] w-[76%]">
                <defs><linearGradient id="fusion-x-editorial" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fff7ec" /><stop offset=".52" stopColor="var(--color-accent)" /><stop offset="1" stopColor="#a96024" /></linearGradient></defs>
                <path d="M44 38h40l112 164h-40zM156 38h40L84 202H44z" fill="url(#fusion-x-editorial)" />
                <motion.path d="M44 38L196 202" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 280" animate={prefersReducedMotion ? undefined : { strokeDashoffset: [0, -284] }} transition={{ duration: 4, ease: "linear", repeat: Infinity }} />
              </svg>
              <span className="absolute -bottom-4 right-0 font-mono text-[9px] font-black uppercase tracking-[0.25em] text-white/55">F / X &nbsp;—&nbsp; Edition returns</span>
            </motion.div>
          </div>
          <div className="absolute bottom-7 right-7 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Nº 02&nbsp;&nbsp; / &nbsp;&nbsp;Coming into focus</div>
        </div>
        <div className="relative z-10 mx-auto flex min-h-[28rem] max-w-7xl items-center px-5 py-16 sm:px-8 sm:py-20 md:min-h-[32rem] md:py-24">
          <div className="max-w-3xl">
            <div className="mb-8 flex flex-wrap items-center gap-3 font-mono text-xs font-black uppercase tracking-[0.18em] sm:text-sm">
              <span className="inline-flex items-center gap-2 border-2 border-black px-3 py-2"><Sparkles size={15} /> Up next</span>
              <span className="flex items-center gap-2">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute h-full w-full rounded-full border border-black motion-safe:animate-ping" />
                  <span className="relative h-2 w-2 rounded-full bg-black" />
                </span>
                <span className="relative inline-flex overflow-hidden border-2 border-black px-3 py-2">
                  <motion.span
                    aria-label="Coming soon"
                    initial={prefersReducedMotion ? false : { clipPath: "inset(0 100% 0 0)" }}
                    animate={{ clipPath: "inset(0 0% 0 0)" }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Coming soon
                  </motion.span>
                  {!prefersReducedMotion && (
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 z-10 w-[2px] bg-black"
                      initial={{ left: "0%", opacity: 1 }}
                      animate={{ left: "100%", opacity: 0 }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </span>
              </span>
            </div>
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18, letterSpacing: "0.32em" }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, letterSpacing: "0.2em" }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 font-mono text-sm font-bold uppercase"
            >
              The return
            </motion.p>
            <motion.h2
              id="fusion-x-title"
              aria-label="FUSION-X"
              animate={prefersReducedMotion ? undefined : { backgroundPosition: ["120% 50%", "-120% 50%"] }}
              transition={{ duration: 4.5, ease: "linear", repeat: Infinity }}
              style={{
                backgroundImage: "linear-gradient(105deg, #000 0%, #000 42%, rgba(255,255,255,0.95) 50%, #000 58%, #000 100%)",
                backgroundSize: "240% 100%",
              }}
              className="w-fit max-w-4xl bg-clip-text text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-transparent sm:text-7xl md:text-8xl"
            >
              FUSION-X
            </motion.h2>
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.6, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-lg font-bold uppercase leading-snug sm:text-2xl"
            >
              A new edition is on the horizon. Stay tuned.
            </motion.p>
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.55, delay: 0.82, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8"
            >
              <Link href="/pipeline" className="group inline-flex w-fit items-center gap-5 border-2 border-black bg-black px-6 py-5 font-mono text-sm font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
                Stay tuned
                <span className="transition-transform group-hover:translate-x-1"><ArrowUpRight size={20} /></span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATISTICS SECTION --- */}
      <section ref={statsRef} className="py-20 md:py-32 px-4 md:px-8 border-b-[3px] border-[var(--color-foreground)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-7xl font-bold uppercase mb-10 md:mb-16 border-l-4 border-[var(--color-home-accent)] pl-4 md:pl-6">
            <TextScramble>Cell Statistics</TextScramble>
          </h2>
          <div key={theme} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 p-4 md:p-8 bg-white text-black border-[3px] border-[var(--color-foreground)] shadow-[6px_6px_0px_var(--color-home-accent)] md:shadow-[8px_8px_0px_var(--color-home-accent)] transition-all duration-500">
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Placement Assistance</span>
              <span className="stat-number text-5xl sm:text-6xl md:text-8xl font-black" data-target="100" data-suffix="%">0%</span>
            </div>
            <div className="flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-black pt-8 md:pt-0 md:pl-8 transition-colors duration-500">
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Active Partners</span>
              <span className="stat-number text-5xl sm:text-6xl md:text-8xl font-black" data-target="155" data-suffix="+">0+</span>
            </div>
            <div className="flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-black pt-8 md:pt-0 md:pl-8 transition-colors duration-500">
              <span className="text-sm font-bold uppercase tracking-widest mb-2">Avg. CTC (LPA)</span>
              <span className="stat-number text-5xl sm:text-6xl md:text-8xl font-black" data-target="6" data-suffix="L">0L</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- PORTFOLIO / ENTITIES --- */}
      <section className="relative overflow-hidden bg-[var(--color-foreground)] px-4 py-20 text-[var(--color-background)] md:px-8 md:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-16 select-none font-black leading-none text-[28rem] opacity-[0.035]">N</div>
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-8 border-b border-[var(--color-background)]/25 pb-7 sm:mb-14 sm:flex-row sm:items-end md:pb-9">
            <div>
              <p className="mb-4 flex items-center gap-3 font-mono text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> Nexturn / Career outcomes
              </p>
              <h2 className="text-5xl font-black uppercase leading-[0.82] tracking-[-0.07em] sm:text-7xl md:text-8xl">
                Top<br /><span className="text-[var(--color-accent)]">Talent.</span>
              </h2>
            </div>
            <p className="max-w-xs font-mono text-xs font-bold uppercase leading-relaxed tracking-wider text-[var(--color-background)]/65 sm:text-right">
              Big ambition. Real people. The next chapter starts here.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
            {topTalents.map((talent, index) => (
              <div
                key={talent.id || index}
                className="group relative isolate aspect-[4/3] min-h-[330px] overflow-hidden border border-[var(--color-background)]/20 bg-black sm:aspect-[5/4] sm:min-h-[360px] lg:min-h-[420px]"
              >
                {talent.pic ? (
                  <>
                    <img aria-hidden="true" src={talent.pic} alt="" className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-45 blur-2xl" />
                    <img src={talent.pic} alt={talent.full_name || "Top Talent"} className="absolute inset-0 -z-10 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
                  </>
                ) : (
                  <div className="absolute inset-0 -z-20 flex items-center justify-center bg-[radial-gradient(circle_at_70%_30%,var(--color-accent),transparent_34%),linear-gradient(135deg,var(--color-surface),var(--color-background))]">
                    <span className="font-mono text-8xl font-black text-[var(--color-background)]/80">{talent.full_name ? talent.full_name.split(" ").map((name: string) => name[0]).join("").slice(0, 2).toUpperCase() : `0${index + 1}`}</span>
                  </div>
                )}
                <div aria-hidden="true" className="absolute inset-0 -z-0 bg-gradient-to-t from-black via-black/35 to-black/5" />
                <div className="absolute left-4 top-4 z-10 font-mono text-6xl font-black leading-none tracking-[-0.08em] text-white/45 sm:left-6 sm:top-6 sm:text-7xl">0{index + 1}</div>
                {talent.company && (
                  <div className="absolute right-4 top-4 z-10 max-w-[60%] border border-white/35 bg-black/45 px-3 py-2 text-right font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:right-6 sm:top-6 sm:text-xs">
                    Placed at <span className="text-[var(--color-accent)]">{talent.company}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 md:p-8">
                  <div className="mb-3 h-1 w-10 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-16" />
                  <h3 className="max-w-[90%] break-words text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">{talent.full_name || "Top Talent"}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/75 sm:text-xs">
                    <span>{talent.course || "B.Tech 2026"}</span>
                    {talent.role && talent.role.trim().length > 0 && <><span aria-hidden="true" className="text-[var(--color-accent)]">✳</span><span>{talent.role}</span></>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MASSIVE FOOTER --- */}
      <footer className="pt-20 md:pt-32 pb-8 px-4 md:px-8 brutalist-border-t bg-[var(--color-foreground)] text-[var(--color-background)] overflow-hidden relative transition-colors duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-8">
          <div className="flex flex-col gap-3">
            <h4 className="text-xl font-bold uppercase mb-2">
              <TextScramble>Connect</TextScramble>
            </h4>
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
          <div className="text-left md:text-right break-words">
            <p className="font-bold uppercase tracking-widest mb-2">IITM College of Engineering</p>
            <p className="opacity-80">Janakpuri, New Delhi</p>
            <p className="opacity-80">placement@iitmjp.ac.in</p>
          </div>
        </div>

        <h1 className="text-[18vw] md:text-[15vw] font-black tracking-tighter leading-none text-center select-none uppercase">
          <TextScramble>NEXTURN</TextScramble>
        </h1>

        <div className="mt-8 pt-8 border-t-[3px] border-[var(--color-background)] flex flex-col sm:flex-row justify-between gap-3 text-[10px] sm:text-sm font-bold uppercase tracking-widest">
          <span>© 2024 NEXTURN</span>
          <span>ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </main>
  );
}
