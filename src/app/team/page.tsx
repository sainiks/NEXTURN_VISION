"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import TextScramble from "@/components/TextScramble";

gsap.registerPlugin(ScrollTrigger);

/*
 * IMAGE SETUP: Place photos in /public/team/ with the filenames below.
 * Recommended: square or portrait, min 400x400px.
 */
const founders = [
  { name: "Vanshika", role: "Founder - President", phone: "9716689446", email: "vanshika255sharma@gmail.com", initials: "VS", image: "/team/vanshika.png" },
  { name: "Aditya Sehrawat", role: "Founder - Vice President", phone: "8882333608", email: "sehrawataditya120@gmail.com", initials: "AS", image: "/team/aditya.png", imageStyle: { objectPosition: "15% top" } },
];

const coreMembers = [
  { name: "Aksh Gautam", role: "General Secretary", phone: "9315735714", email: "akshgautam1605@gmail.com", initials: "AG", image: "/team/aksh.png" },
  { name: "Piyush", role: "Assistant Secretary", phone: "9466831821", email: "11piyush05@gmail.com", initials: "P", image: "/team/piyush.png" },
  { name: "Harshita Thareja", role: "Marketing Head", phone: "8377831878", email: "harshitathareja@gmail.com", initials: "HT", image: "/team/harshita.png" },
  { name: "Ishita Rana", role: "Marketing Co-Head", phone: "8882071150", email: "ranaishita04@gmail.com", initials: "IR", image: "/team/ishita.png" },
  { name: "Kunal Saini", role: "Technical Head", phone: "7428530125", email: "kunalsaini20090360@gmail.com", initials: "KS", image: "/team/kunal.png", imageStyle: { objectPosition: "center 20%", transform: "scale(1)" } },
  { name: "Siddhartha Khanna", role: "Social Media Head", phone: "9213651199", email: "khannasiddhartha15@gmail.com", initials: "SK", image: "/team/siddhartha.png" },
  { name: "Mitashi Dogra", role: "Social Media Co-Head", phone: "9953863900", email: "mitashidogra@gmail.com", initials: "MD", image: "/team/mitashi.png" },
  { name: "Pratham Sehdev", role: "Corporate Relation Head", phone: "9205188717", email: "sehdevpratham94@gmail.com", initials: "PS", image: "/team/pratham.png" },
  { name: "Kamaljeet Kaur", role: "Corporate Relation Co-Head", phone: "9811529947", email: "info.kamaljeet2024@gmail.com", initials: "KK", image: "/team/kamaljeet.png", imageStyle: { objectPosition: "center top", transform: "scale(1)" } },
  { name: "Aman Sangwan", role: "Management Head", phone: "9729392966", email: "amansangwan055@gmail.com", initials: "AS", image: "/team/aman.png", imageStyle: { objectPosition: "center 15%" } },
];

type Member = typeof coreMembers[0];

/* ── Hexagon Avatar (image with initials fallback) ── */
function HexAvatar({ member, size = "md", className = "" }: { member: Member; size?: "sm" | "md" | "lg"; className?: string }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = { sm: "w-36 h-36 md:w-44 md:h-44", md: "w-40 h-40", lg: "w-52 h-52 md:w-64 md:h-64" };
  const textSizes = { sm: "text-5xl md:text-6xl", md: "text-5xl", lg: "text-7xl md:text-8xl" };
  return (
    <div
      className={`${sizeClasses[size]} bg-[var(--color-foreground)] text-[var(--color-background)] flex items-center justify-center relative overflow-hidden ${className}`}
      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
    >
      {member.image && !imgError ? (
        <Image src={member.image} alt={member.name} fill className={`object-cover object-top ${(member as any).imageStyle ? '' : 'scale-125'}`} style={(member as any).imageStyle || {}} sizes="(max-width: 768px) 200px, 300px" onError={() => setImgError(true)} />
      ) : (
        <span className={`${textSizes[size]} font-black`}>{member.initials}</span>
      )}
    </div>
  );
}

/* ── 3D Tilt Card ── */
function TiltCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 30 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Modal ── */
function MemberModal({ member, onClose }: { member: Member | null; onClose: () => void }) {
  if (!member) return null;
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="relative border-[4px] border-[var(--color-foreground)] bg-[var(--color-background)] p-12 max-w-lg w-full mx-4 cursor-default"
        initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 10 }}
        transition={{ type: "spring", damping: 20, stiffness: 250 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 border-[3px] border-[var(--color-foreground)] flex items-center justify-center font-black text-xl hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors">✕</button>
        <div className="flex justify-center mb-8">
          <HexAvatar member={member} size="md" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-center mb-2">{member.name}</h2>
        <p className="text-center text-lg font-bold uppercase tracking-widest text-[var(--color-accent)] mb-10">{member.role}</p>
        <div className="border-t-4 border-[var(--color-foreground)] pt-6 flex flex-col gap-4">
          <div><span className="text-xs font-black uppercase tracking-widest opacity-50 block mb-1">Phone</span><a href={`tel:${member.phone}`} className="font-bold text-xl tracking-widest hover:text-[var(--color-accent)] transition-colors">{member.phone}</a></div>
          <div><span className="text-xs font-black uppercase tracking-widest opacity-50 block mb-1">Email</span><a href={`mailto:${member.email}`} className="font-bold tracking-widest hover:text-[var(--color-accent)] transition-colors break-all">{member.email}</a></div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main ── */
export default function Team() {
  const horizontalRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const foundersRef = useRef<HTMLDivElement>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    /* ── Sync Lenis with ScrollTrigger ── */
    ScrollTrigger.defaults({ toggleActions: "play none none reverse" });

    /* Wait for fonts + layout to settle */
    const initTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    const ctx = gsap.context(() => {
      /* ── Founders: staggered clip-path reveal ── */
      gsap.utils.toArray<HTMLElement>(".founder-card").forEach((card, i) => {
        gsap.fromTo(card,
          { clipPath: "inset(100% 0% 0% 0%)", opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)", opacity: 1,
            duration: 1.4, ease: "power4.inOut", delay: i * 0.3,
            scrollTrigger: { trigger: foundersRef.current, start: "top 60%" },
          }
        );
      });


      /* ── Core Team: horizontal scroll ── */
      const track = trackRef.current;
      const container = horizontalRef.current;
      if (!track || !container) return;

      /* Force layout read after render */
      const getScrollAmount = () => track.scrollWidth - container.offsetWidth;

      const hTween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * coreMembers.length),
              coreMembers.length - 1
            );
            setActiveIndex(idx);
          },
        },
      });

      /* ── Card entrances — dramatic varied origins ── */
      gsap.utils.toArray<HTMLElement>(".h-card").forEach((card, i) => {
        const origins = [
          { y: 250, x: -80, rotation: 25, scale: 0.3, skewX: 15 },
          { y: -280, x: 60, rotation: -30, scale: 0.2, skewX: -10 },
          { y: 0, x: 200, rotation: 45, scale: 0.1, skewX: 20 },
          { y: 300, x: -40, rotation: -20, scale: 0.4, skewX: -15 },
          { y: -200, x: -100, rotation: 35, scale: 0.15, skewX: 8 },
          { y: 180, x: 120, rotation: -40, scale: 0.25, skewX: -20 },
        ];
        const origin = origins[i % origins.length];

        gsap.fromTo(card, { ...origin, opacity: 0 }, {
          y: 0, x: 0, rotation: 0, scale: 1, opacity: 1, skewX: 0,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: {
            trigger: card, containerAnimation: hTween,
            start: "left 100%", end: "left 55%", scrub: true,
          },
        });
      });
    });

    return () => {
      clearTimeout(initTimer);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
        {/* ═══ HEADER ═══ */}
        <section className="pt-40 pb-16 px-8">
          <div className="max-w-7xl mx-auto relative">
            <motion.div
              className="absolute -top-8 right-0 text-[20vw] font-black text-[var(--color-foreground)] opacity-[0.03] leading-none select-none pointer-events-none"
              initial={{ x: 200 }} animate={{ x: 0 }} transition={{ duration: 1.5, ease: [0.22,1,0.36,1] }}
            >12</motion.div>

            <motion.h1
              className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] relative z-10"
              initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22,1,0.36,1] }}
            >
              <TextScramble>The Team</TextScramble>
            </motion.h1>

            <motion.div className="flex items-center gap-6 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <motion.div className="h-[4px] bg-[var(--color-accent)] flex-1" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.6 }} style={{ transformOrigin: "left" }} />
              <span className="text-sm font-black uppercase tracking-widest opacity-60 flex-shrink-0">2 Founders • 10 Core</span>
            </motion.div>
          </div>
        </section>

        {/* ═══ FOUNDERS — CLIP-PATH CURTAIN REVEAL ═══ */}
        <section ref={foundersRef} className="py-24 md:py-40 px-8 border-t-[3px] border-[var(--color-foreground)] overflow-hidden">
          <div className="max-w-7xl mx-auto mb-20">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
              <TextScramble>Founders</TextScramble>
            </h2>
            <p className="mt-4 text-lg md:text-2xl font-medium uppercase tracking-widest opacity-60 border-l-4 border-[var(--color-accent)] pl-6">
              The visionaries who started it all.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {founders.map((f, i) => (
              <TiltCard
                key={i}
                className="founder-card group relative border-[4px] border-[var(--color-foreground)] p-10 md:p-14 flex flex-col items-center text-center cursor-pointer overflow-hidden"
                onClick={() => setSelectedMember(f)}
              >
                {/* Animated corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Pulsing glow on hover */}
                <div className="absolute inset-0 bg-[var(--color-accent)] opacity-0 group-hover:opacity-[0.04] transition-opacity duration-700" />

                <HexAvatar member={f} size="lg" className="founder-hex mb-10 group-hover:scale-105 transition-transform duration-500" />

                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">{f.name}</h3>
                <p className="text-lg md:text-xl font-bold uppercase tracking-widest text-[var(--color-accent)] mb-6">{f.role}</p>

                <div className="w-full border-t-4 border-[var(--color-foreground)] pt-6 flex flex-col gap-3 text-left">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Phone</span>
                    <span className="font-bold tracking-widest">{f.phone}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Email</span>
                    <span className="font-bold tracking-widest text-sm break-all">{f.email}</span>
                  </div>
                </div>

                <span className="mt-8 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-60 transition-opacity duration-300">Click to Expand ↗</span>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ═══ CORE TEAM — HORIZONTAL SCROLL + 3D TILT + WILD ENTRANCES ═══ */}
        <section className="border-t-[3px] border-[var(--color-foreground)]">
          <div className="py-20 px-8 max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
              <TextScramble>Core Team</TextScramble>
            </h2>
            <p className="mt-4 text-lg md:text-2xl font-medium uppercase tracking-widest opacity-60 border-l-4 border-[var(--color-accent)] pl-6">
              Scroll to meet the executive board →
            </p>
          </div>

          {/* Pinned horizontal scroll container */}
          <div ref={horizontalRef} className="relative h-screen overflow-hidden">
            {/* Indicator overlay — lives inside the pinned area */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-[var(--color-background)]/90 backdrop-blur-sm border-b-[3px] border-[var(--color-foreground)]">
              <div className="px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black text-[var(--color-accent)] transition-all duration-300">{String(activeIndex + 1).padStart(2, "0")}</span>
                  <span className="text-xs font-black uppercase tracking-widest opacity-50">/ {coreMembers.length}</span>
                </div>
                <span className="text-sm md:text-lg font-black uppercase tracking-tighter truncate max-w-[200px] md:max-w-none">
                  {coreMembers[activeIndex]?.name}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] hidden md:block">
                  {coreMembers[activeIndex]?.role}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-[3px] bg-[var(--color-foreground)] opacity-10">
                <div className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out" style={{ width: `${((activeIndex + 1) / coreMembers.length) * 100}%` }} />
              </div>
            </div>

            {/* Scrolling track */}
            <div ref={trackRef} className="flex items-center gap-10 h-full px-8 pt-24 pb-8" style={{ width: "max-content" }}>
              {coreMembers.map((member, i) => (
                <TiltCard
                  key={i}
                  className={`h-card flex-shrink-0 w-[320px] md:w-[380px] border-[4px] border-[var(--color-foreground)] p-8 flex flex-col items-center text-center cursor-pointer group relative overflow-hidden transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-[8px_8px_0_var(--color-accent)] ${
                    i % 2 === 0 ? "self-start mt-8" : "self-end mb-8"
                  }`}
                  onClick={() => setSelectedMember(member)}
                >
                  {/* Sweep BG */}
                  <div className="absolute inset-0 bg-[var(--color-foreground)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-0" />

                  <div className="z-10 flex flex-col items-center w-full group-hover:text-[var(--color-background)] transition-colors duration-300">
                    {/* Index */}
                    <span className="absolute top-4 left-4 text-sm font-black uppercase tracking-widest opacity-30">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Hexagon */}
                    <HexAvatar member={member} size="sm" className="mb-6 group-hover:scale-105 transition-transform duration-300" />

                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-1">{member.name}</h3>
                    <p className="text-sm md:text-base font-bold uppercase tracking-widest text-[var(--color-accent)] group-hover:text-[var(--color-background)] mb-6 transition-colors">{member.role}</p>

                    <div className="w-full border-t-4 border-[var(--color-foreground)] group-hover:border-[var(--color-background)] pt-4 flex flex-col gap-2 text-left transition-colors duration-300">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">Phone</span>
                        <span className="font-bold tracking-widest text-sm">{member.phone}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">Email</span>
                        <span className="font-bold tracking-widest text-xs break-all">{member.email}</span>
                      </div>
                    </div>

                    <span className="mt-6 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-60 transition-opacity">Click ↗</span>
                  </div>
                </TiltCard>
              ))}

              {/* End marker */}
              <div className="flex-shrink-0 w-[300px] h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">12</p>
                  <p className="text-sm font-black uppercase tracking-widest mt-4 opacity-60">Members Strong</p>
                  <div className="mt-6 w-16 h-[4px] bg-[var(--color-accent)] mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER STRIP ═══ */}
        <section className="py-16 px-8 border-t-[3px] border-[var(--color-foreground)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-black uppercase tracking-widest opacity-60">IITM • Nexturn — The Internship Cell</p>
            <p className="text-sm font-black uppercase tracking-widest opacity-60">Est. 2026</p>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      </AnimatePresence>
    </>
  );
}
