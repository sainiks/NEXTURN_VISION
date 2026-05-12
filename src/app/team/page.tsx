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
  { name: "Vanshika", role: "Founder - President", linkedin: "https://www.linkedin.com/in/vanshika-sharma-437704249/", initials: "VS", image: "/team/vanshika.png" },
  { name: "Aditya Sehrawat", role: "Founder - Vice President", linkedin: "https://www.linkedin.com/in/aditya-sehrawat18/", initials: "AS", image: "/team/aditya.png", imageStyle: { objectPosition: "15% top" } },
];

const coreMembers = [
  { name: "Aksh Gautam", role: "General Secretary", linkedin: "https://www.linkedin.com/in/aksh-gautam-963128222/", initials: "AG", image: "/team/aksh.png" },
  { name: "Piyush", role: "Assistant Secretary", linkedin: "https://www.linkedin.com/in/piyush-chalka-208bb7327/", initials: "P", image: "/team/piyush.png" },
  { name: "Harshita Thareja", role: "Marketing Head", linkedin: "https://www.linkedin.com/in/harshita-thareja/", initials: "HT", image: "/team/harshita.png" },
  { name: "Ishita Rana", role: "Marketing Co-Head", linkedin: "https://www.linkedin.com/in/ishita-rana-a95a04332/", initials: "IR", image: "/team/ishita.png" },
  { name: "Kunal Saini", role: "Technical Head", linkedin: "https://www.linkedin.com/in/kunal-saini-b392a0167/", initials: "KS", image: "/team/kunal.png", imageStyle: { objectPosition: "center 20%", transform: "scale(1)" } },
  { name: "Siddhartha Khanna", role: "Social Media Head", linkedin: "https://www.linkedin.com/in/siddhartha-khanna-603635336/", initials: "SK", image: "/team/siddhartha.png" },
  { name: "Mitashi Dogra", role: "Social Media Co-Head", linkedin: "https://www.linkedin.com/in/mitashi-dogra-a45511337/", initials: "MD", image: "/team/mitashi.png" },
  { name: "Pratham Sehdev", role: "Corporate Relation Head", linkedin: "https://www.linkedin.com/in/pratham-sehdev-7a527b31b/", initials: "PS", image: "/team/pratham.png" },
  { name: "Kamaljeet Kaur", role: "Corporate Relation Co-Head", linkedin: "https://www.linkedin.com/in/kamaljeet-kaur-98248a2b9/", initials: "KK", image: "/team/kamaljeet.png", imageStyle: { objectPosition: "center top", transform: "scale(1)" } },
  { name: "Aman Sangwan", role: "Management Head", linkedin: "https://www.linkedin.com/in/aman-sangwan-7838112a6/", initials: "AS", image: "/team/aman.png", imageStyle: { objectPosition: "center 15%" } },
];

type Member = {
  name: string;
  role: string;
  linkedin?: string;
  initials: string;
  image: string;
  imageStyle?: any;
};

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

/* ── Team Card (3D Tilt + 3D Flip) ── */
function TeamCard({ member, i, className, onClick, isFounder = false }: { member: Member; i: number; className?: string; onClick: () => void; isFounder?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => { 
    x.set(0); 
    y.set(0); 
    setIsFlipped(false);
  }, [x, y]);

  return (
    <div 
      className={`relative perspective-1000 group ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={ref}
        style={{ 
          rotateX, 
          rotateY, 
          rotateY: useSpring(useTransform(useMotionValue(isFlipped ? 1 : 0), [0, 1], [0, 180]), { stiffness: 200, damping: 25 }),
          transformStyle: "preserve-3d" 
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="w-full h-full relative"
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden z-10 border-[4px] border-[var(--color-foreground)] bg-[var(--color-background)] p-8 flex flex-col items-center text-center overflow-hidden">
          {/* Flip Trigger Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
            className="absolute top-4 right-4 w-10 h-10 bg-[var(--color-accent)] text-[var(--color-foreground)] flex items-center justify-center z-20 hover:scale-110 transition-transform active:scale-95 border-2 border-[var(--color-foreground)]"
            title="View Board ID"
          >
            <span className="font-black text-xs">ID</span>
          </button>

          {/* Animated corner accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[var(--color-accent)] opacity-40" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[var(--color-accent)] opacity-40" />
          
          {/* Sweep BG */}
          <div className="absolute inset-0 bg-[var(--color-foreground)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-0" />

          <div className="z-10 flex flex-col items-center w-full group-hover:text-[var(--color-background)] transition-colors duration-300">
             <span className="absolute top-4 left-4 text-sm font-black uppercase tracking-widest opacity-30 group-hover:opacity-60">
                {String(i + 1).padStart(2, "0")}
              </span>
            <HexAvatar member={member} size={isFounder ? "lg" : "sm"} className="mb-6 group-hover:scale-105 transition-transform duration-500" />
            <h3 className={`${isFounder ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'} font-black uppercase tracking-tighter mb-1`}>{member.name}</h3>
            <p className={`${isFounder ? 'text-lg md:text-xl' : 'text-sm md:text-base'} font-bold uppercase tracking-widest text-[var(--color-accent)] mb-6 transition-colors group-hover:text-[var(--color-foreground)] bg-clip-text`}>{member.role}</p>

            <div className="w-full border-t-4 border-[var(--color-foreground)] group-hover:border-[var(--color-background)] pt-4 flex flex-col gap-2 text-left transition-colors duration-300">
              {member.linkedin ? (
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1 group-hover:opacity-70">LinkedIn</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(member.linkedin, "_blank");
                    }}
                    className={`${isFounder ? 'text-3xl' : 'text-xl'} font-black tracking-widest text-[var(--color-accent)] group-hover:text-[var(--color-background)] text-left hover:translate-x-2 transition-transform duration-300`}
                  >
                    Connect ↗
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1 group-hover:opacity-70">Nexturn</span>
                  <span className="font-black tracking-widest text-lg">Core Member</span>
                </div>
              )}
            </div>
            <span className="mt-6 text-[10px] font-black uppercase tracking-widest opacity-40">Click Card for Info</span>
          </div>
        </div>

        {/* BACK SIDE (Stylish ID Design) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden border-[4px] border-[var(--color-accent)] bg-[var(--color-foreground)] text-[var(--color-background)] p-8 flex flex-col justify-between overflow-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          {/* Flip Back Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            className="absolute top-4 right-4 w-10 h-10 bg-[var(--color-accent)] text-[var(--color-foreground)] flex items-center justify-center z-20 hover:scale-110 transition-transform active:scale-95 border-2 border-[var(--color-background)]"
            title="View Info"
          >
            <span className="font-black text-xs">✕</span>
          </button>
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(var(--color-background) 1px, transparent 0)", backgroundSize: "20px 20px" }} />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 border-t-4 border-l-4 border-[var(--color-accent)]" />
               <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Nxt / Board</span>
            </div>

            {/* Massive Monogram */}
            <div className="flex-1 flex items-center justify-center relative">
              <span className="text-[12rem] font-black leading-none tracking-tighter opacity-10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {member.initials}
              </span>
              <span className="text-[10rem] font-black leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: "2px var(--color-accent)" }}>
                {member.initials}
              </span>
            </div>

            {/* Metadata Footer */}
            <div className="mt-auto border-t-4 border-[var(--color-accent)] pt-6 font-mono space-y-2">
              <p className="text-xl font-black uppercase tracking-tighter leading-none mb-4">Nexturn Core Board 2026</p>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div>
                  <span className="opacity-50 block mb-0.5">Access Level</span>
                  <span className="text-[var(--color-accent)]">Alpha-1</span>
                </div>
                <div>
                  <span className="opacity-50 block mb-0.5">Status</span>
                  <span className="text-[var(--color-accent)]">Active</span>
                </div>
                <div className="col-span-2">
                  <span className="opacity-50 block mb-0.5">Identification</span>
                  <span>NC-026-{member.initials}-{i+1}</span>
                </div>
              </div>
            </div>
            
            {/* Bottom Accent */}
            <div className="flex justify-end mt-4">
               <div className="w-12 h-12 border-b-4 border-r-4 border-[var(--color-accent)]" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
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
          {member.linkedin ? (
            <div>
              <span className="text-sm font-black uppercase tracking-widest opacity-50 block mb-2">LinkedIn</span>
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-3xl tracking-widest hover:text-[var(--color-accent)] transition-colors break-all">
                Connect ↗
              </a>
            </div>
          ) : (
            <div>
              <span className="text-sm font-black uppercase tracking-widest opacity-50 block mb-2">Status</span>
              <span className="font-bold text-2xl tracking-widest">Active Member</span>
            </div>
          )}
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
              <TeamCard
                key={i}
                member={f}
                i={i}
                isFounder
                className="w-full h-[600px] md:h-[700px] founder-card"
                onClick={() => setSelectedMember(f)}
              />
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
                <TeamCard
                  key={i}
                  member={member}
                  i={i}
                  className={`h-card flex-shrink-0 w-[320px] md:w-[400px] h-[550px] md:h-[600px] ${
                    i % 2 === 0 ? "self-start mt-8" : "self-end mb-8"
                  }`}
                  onClick={() => setSelectedMember(member)}
                />
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
