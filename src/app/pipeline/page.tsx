"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";

const timelineEvents = [
  {
    id: 1,
    date: "JAN 30, 2025",
    status: "CLOSED",
    title: "IGNISIA - The Intern Fair",
    location: "Hall A",
    priority: "High",
  },
  {
    id: 2,
    date: "OCT 15, 2025",
    status: "CLOSED",
    title: "FUSION - X",
    location: "BASE 2",
    priority: "High",
  },
  {
    id: 3,
    date: "NOV 24, 2025",
    status: "CLOSED",
    title: "Blood Bank Camp",
    location: "IITM Reception area",
    priority: "High",
  },
  {
    id: 4,
    date: "MAY 02, 2026",
    status: "CLOSED",
    title: "NEXTera 1.0 - Internship Drive",
    location: "IITM Campus",
    priority: "High",
  }
];

export default function PipelinePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeEventId, setActiveEventId] = useState<number | null>(1);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <main className="relative min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] py-32 px-8 md:px-24 border-t-[3px] border-[var(--color-foreground)]">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-24 max-w-7xl mx-auto"
      >
        <div className="text-[#00FF41] uppercase tracking-widest font-bold mb-4">
          LOGISTICS // RSVP
        </div>
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
          MISSION TIMELINE
        </h1>
      </motion.div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto relative">
        
        {/* LEFT COLUMN: TIMELINE */}
        <div className="lg:col-span-8 relative flex justify-center">
          <div ref={containerRef} className="relative flex flex-col gap-24 w-full max-w-2xl">
            {/* Animated Background Line */}
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#111]" />
            <motion.div 
              className="absolute left-0 top-0 w-[1px] bg-[#444] origin-top z-0"
              style={{ height: "100%", scaleY: lineHeight }}
            />

            {timelineEvents.map((event, index) => {
              const isScheduled = event.status === 'SCHEDULED';
              const borderColor = isScheduled ? 'border-[#00FF41]' : 'border-[#333]';
              const textColor = isScheduled ? 'text-[#00FF41]' : 'text-[#888]';
              const statusColor = isScheduled ? 'text-[#00FF41]' : 'text-[#666]';
              const nodeBorder = isScheduled ? 'border-[#00FF41]' : 'border-[#666]';

              return (
                <motion.div 
                  id={`event-${event.id}`}
                  key={event.id} 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  onViewportEnter={() => setActiveEventId(event.id)}
                  viewport={{ once: false, margin: "-50% 0px -50% 0px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  className="relative pl-10 md:pl-16 group"
                >
                  {/* NODE (HOLLOW SQUARE) */}
                  <div className={`absolute left-[-7px] top-1.5 w-3.5 h-3.5 border-[1.5px] bg-[#050505] z-10 transition-transform duration-300 group-hover:scale-150 group-hover:rotate-45 ${nodeBorder} ${isScheduled ? 'animate-pulse' : ''}`} />
                  
                  {/* EVENT CONTENT */}
                  <div className="flex flex-col gap-4 max-w-2xl relative z-10">
                    {/* DATE & STATUS */}
                    <div className="flex items-center gap-4">
                      <div className={`border px-3 py-1 font-mono text-xs tracking-wider ${borderColor} ${textColor} transition-colors duration-300 group-hover:border-white group-hover:text-white`}>
                        {event.date}
                      </div>
                      <div className={`font-mono text-xs tracking-widest uppercase ${statusColor}`}>
                        STATUS: {event.status}
                      </div>
                    </div>

                    {/* TITLE */}
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">{event.title}</h2>

                    {/* LOCATION & PRIORITY */}
                    <p className="text-[#888] text-sm md:text-base mb-2">
                      Location: {event.location} // Priority: {event.priority}
                    </p>

                    {/* RSVP BOX */}
                    <div className="border border-[#222] p-6 md:p-8 bg-[#050505] max-w-xl transition-all duration-300 hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
                      <div className="text-[#555] text-xs font-mono mb-4 tracking-wider">RSVP_FORM_V1</div>
                      <input 
                        type="text" 
                        placeholder="ENTER_YOUR_NAME" 
                        className="w-full bg-[#0a0a0a] border-none text-[#fff] p-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#444] transition-all placeholder:text-[#444]"
                      />
                      <div className="mt-4">
                        <MagneticButton className="w-full !bg-white !text-black font-bold py-3.5 uppercase hover:!bg-[var(--color-accent)] hover:!text-black transition-colors text-sm tracking-wide !border-none">
                          CONFIRM ATTENDANCE
                        </MagneticButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: GLIMPSE SIDEBAR */}
        <div className="hidden lg:block lg:col-span-4 relative">
          <div className="sticky top-32 border border-[#222] bg-[#050505] p-8">
            <h3 className="text-[#00FF41] text-sm font-bold tracking-widest uppercase mb-8">Mission Overview</h3>
            <div className="flex flex-col gap-6 relative">
              {/* Subtle connecting line for overview */}
              <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-[#222] z-0" />
              
              {timelineEvents.map((event) => {
                const isActive = activeEventId === event.id;
                return (
                  <button 
                    key={`glimpse-${event.id}`}
                    onClick={() => {
                      document.getElementById(`event-${event.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="relative flex items-start gap-4 text-left group z-10"
                  >
                    <div className={`mt-1.5 w-2 h-2 border transition-colors duration-300 ${isActive ? 'bg-[#00FF41] border-[#00FF41]' : 'bg-[#050505] border-[#444] group-hover:border-[#00FF41]'}`} />
                    <div className="flex flex-col">
                      <span className={`font-mono text-xs tracking-wider transition-colors duration-300 ${isActive ? 'text-[#00FF41]' : 'text-[#666] group-hover:text-[#aaa]'}`}>
                        {event.date}
                      </span>
                      <span className={`text-sm font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#888] group-hover:text-white'}`}>
                        {event.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
