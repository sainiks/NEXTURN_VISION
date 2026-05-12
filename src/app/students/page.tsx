"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TextScramble from "@/components/TextScramble";
import { ExternalLink, FileText, Download, ChevronRight } from "lucide-react";

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
    url: "https://roadmap.sh/software-design-architecture",
    pdfUrl: "/roadmaps/software-design-architecture.pdf"
  },
  {
    title: "Data Science & ML",
    content: "Focus on Probability, Statistics, Linear Algebra, and Python libraries (Pandas, NumPy, PyTorch/TensorFlow).",
    url: "https://roadmap.sh/ai-ml",
    pdfUrl: "/roadmaps/ai-data-scientist.pdf"
  },
  {
    title: "Product Management",
    content: "Understand product life cycles, wireframing (Figma), SQL for data analytics, and user psychology.",
    url: "https://roadmap.sh/product-manager",
    pdfUrl: "/roadmaps/product-manager.pdf"
  },
];

export default function Students() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const trackClick = (type: string, title: string) => {
    console.log(`[ANALYTICS] Student clicked ${type}: ${title}`);
    // You can integrate Plausible, GA4, or PostHog here
  };

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
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 brutalist-border-b pb-8">
            <h2 className="text-4xl md:text-6xl font-black uppercase">
              Prep Roadmaps
            </h2>
            <p className="text-sm md:text-lg uppercase font-bold tracking-tighter opacity-60 mt-4 md:mt-0">
              Curated by NEX-Tech Division
            </p>
          </div>
          
          <div className="flex flex-col border-4 border-[var(--color-foreground)] border-b-0">
            {roadmaps.map((roadmap, index) => {
              const isOpen = activeAccordion === index;
              return (
                <div key={index} className="border-b-4 border-[var(--color-foreground)] group">
                  <button
                    onClick={() => {
                      setActiveAccordion(isOpen ? null : index);
                      if (!isOpen) trackClick("Accordion Expand", roadmap.title);
                    }}
                    className={`w-full p-8 flex justify-between items-center transition-all duration-300 ${
                      isOpen 
                        ? "bg-[var(--color-foreground)] text-[var(--color-background)]" 
                        : "bg-[var(--color-background)] hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]"
                    }`}
                  >
                    <span className="text-2xl md:text-5xl font-black uppercase text-left flex items-center gap-4">
                      {roadmap.title}
                      {!isOpen && <ExternalLink size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </span>
                    <motion.span 
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      className="text-4xl font-light"
                    >
                      <ChevronRight size={48} strokeWidth={3} />
                    </motion.span>
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                        className="overflow-hidden bg-[var(--color-background)] border-t-4 border-[var(--color-foreground)]"
                      >
                        <div className="p-8 md:p-12">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Side: Info & Actions */}
                            <div className="flex flex-col justify-between">
                              <div>
                                <h4 className="text-sm uppercase font-black tracking-widest mb-4 opacity-50">Overview</h4>
                                <p className="text-xl md:text-2xl font-medium leading-relaxed mb-12">
                                  {roadmap.content}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-4">
                                <a 
                                  href={roadmap.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={() => trackClick("Interactive Roadmap", roadmap.title)}
                                  className="brutalist-button flex items-center gap-3 bg-[var(--color-foreground)] text-[var(--color-background)] px-8 py-4 text-xl font-black uppercase hover:translate-x-2 hover:-translate-y-2 transition-transform shadow-[4px_4px_0px_var(--color-accent)]"
                                >
                                  Interactive Roadmap <ExternalLink size={20} />
                                </a>

                                {isMobile && (
                                  <a 
                                    href={roadmap.pdfUrl} 
                                    download
                                    onClick={() => trackClick("PDF Download", roadmap.title)}
                                    className="brutalist-button flex items-center gap-3 border-4 border-[var(--color-foreground)] px-8 py-4 text-xl font-black uppercase hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-all shadow-[4px_4px_0px_var(--color-foreground)]"
                                  >
                                    Download PDF <Download size={20} />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Right Side: PDF Preview (Desktop Only) */}
                            {!isMobile && (
                              <div className="relative border-4 border-[var(--color-foreground)] bg-white h-[600px] shadow-[12px_12px_0px_var(--color-foreground)]">
                                <div className="absolute inset-0 flex flex-col">
                                  <div className="bg-[var(--color-foreground)] text-[var(--color-background)] p-3 flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                      <FileText size={14} /> PDF Preview
                                    </span>
                                    <a 
                                      href={roadmap.pdfUrl} 
                                      download 
                                      onClick={() => trackClick("PDF Download", roadmap.title)}
                                      className="hover:scale-110 transition-transform"
                                    >
                                      <Download size={16} />
                                    </a>
                                  </div>
                                  <embed 
                                    src={`${roadmap.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                                    type="application/pdf" 
                                    width="100%" 
                                    height="100%" 
                                    className="flex-grow"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
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

      <style jsx>{`
        .brutalist-button {
          position: relative;
          z-index: 1;
        }
        .brutalist-border-b {
          border-bottom: 4px solid var(--color-foreground);
        }
      `}</style>
    </main>
  );
}
