"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TextScramble from "@/components/TextScramble";

const jobs = [
  { id: 1, role: "Frontend Engineer", company: "ZOMATO", ctc: "24 LPA", deadline: "12 OCT" },
  { id: 2, role: "Backend Developer", company: "ATLASSIAN", ctc: "45 LPA", deadline: "15 OCT" },
  { id: 3, role: "Data Scientist", company: "UBER", ctc: "36 LPA", deadline: "20 OCT" },
  { id: 4, role: "Quantitative Analyst", company: "DE SHAW", ctc: "60 LPA", deadline: "22 OCT" },
];

const roadmaps = [
  {
    title: "Software Engineering (SDE)",
    content: "Master Data Structures & Algorithms, System Design (HLD & LLD), and one core backend framework (Spring Boot, Node.js, or Go).",
  },
  {
    title: "Data Science & ML",
    content: "Focus on Probability, Statistics, Linear Algebra, and Python libraries (Pandas, NumPy, PyTorch/TensorFlow).",
  },
  {
    title: "Product Management",
    content: "Understand product life cycles, wireframing (Figma), SQL for data analytics, and user psychology.",
  },
];

export default function Students() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  return (
    <main className="min-h-screen pt-32 px-8 pb-32">
      <div className="max-w-7xl mx-auto">
        <header className="mb-32">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-8">
            <TextScramble>Student Portal</TextScramble>
          </h1>
          <p className="text-xl md:text-3xl max-w-3xl font-medium uppercase tracking-widest opacity-80 leading-relaxed">
            Your centralized hub for active placement drives, skill roadmaps, and career resources.
          </p>
        </header>

        {/* JOB BOARD */}
        <section className="mb-32">
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-16 brutalist-border-b pb-8">
            Active Drives
          </h2>
          
          <div className="brutalist-border border-b-0">
            {/* Table Header */}
            <div className="grid grid-cols-4 border-b-4 border-[var(--color-foreground)] p-6 bg-[var(--color-foreground)] text-[var(--color-background)] uppercase font-black tracking-widest text-sm md:text-xl hidden md:grid">
              <div>Role</div>
              <div>Company</div>
              <div>CTC</div>
              <div>Deadline</div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="inverted-hover cursor-pointer border-b-4 border-[var(--color-foreground)] p-6 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 items-center transition-colors duration-200"
                >
                  <div className="font-bold text-2xl md:text-3xl uppercase">{job.role}</div>
                  <div className="font-medium text-xl opacity-80 uppercase">{job.company}</div>
                  <div className="font-black text-2xl text-[var(--color-accent)]">{job.ctc}</div>
                  <div className="font-bold uppercase tracking-widest">{job.deadline}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROADMAPS ACCORDION */}
        <section>
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-16 brutalist-border-b pb-8">
            Prep Roadmaps
          </h2>
          <div className="flex flex-col border-4 border-[var(--color-foreground)] border-b-0">
            {roadmaps.map((roadmap, index) => {
              const isOpen = activeAccordion === index;
              return (
                <div key={index} className="border-b-4 border-[var(--color-foreground)]">
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : index)}
                    className="w-full p-8 flex justify-between items-center bg-[var(--color-background)] hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors duration-200"
                  >
                    <span className="text-2xl md:text-4xl font-black uppercase text-left">{roadmap.title}</span>
                    <span className="text-4xl font-light">{isOpen ? "-" : "+"}</span>
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[var(--color-foreground)] text-[var(--color-background)]"
                      >
                        <div className="p-8 text-xl font-medium opacity-90 leading-relaxed">
                          {roadmap.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
