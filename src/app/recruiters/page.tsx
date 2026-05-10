"use client";

import { motion } from "framer-motion";
import TextScramble from "@/components/TextScramble";
import MagneticButton from "@/components/MagneticButton";

const timeline = [
  { phase: "01", title: "Pre-Placement Talk", desc: "Introduce your culture and roles to the student body." },
  { phase: "02", title: "Assessments", desc: "Conduct online coding rounds, aptitude tests, or design challenges." },
  { phase: "03", title: "Interviews", desc: "Technical, HR, and culture-fit rounds facilitated seamlessly." },
  { phase: "04", title: "Offers", desc: "Roll out final offers and begin the onboarding process." },
];

export default function Recruiters() {
  return (
    <main className="min-h-screen pt-32 px-8 pb-32">
      <div className="max-w-7xl mx-auto">
        <header className="mb-32">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-8">
            <TextScramble>Hire Talent</TextScramble>
          </h1>
          <p className="text-xl md:text-3xl max-w-3xl font-medium uppercase tracking-widest opacity-80 leading-relaxed">
            Partner with IITM to access a curated pipeline of exceptional engineers, designers, and problem solvers.
          </p>
        </header>

        <section className="mb-32">
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-16 brutalist-border-b pb-8">
            The Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {timeline.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="brutalist-border p-8 bg-[var(--color-background)] hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors duration-300 group"
              >
                <div className="text-6xl font-black mb-8 text-[var(--color-accent)] group-hover:text-[var(--color-background)] transition-colors duration-300">
                  {item.phase}
                </div>
                <h3 className="text-2xl font-black uppercase mb-4">{item.title}</h3>
                <p className="font-medium opacity-80">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-8">
              Register Drive
            </h2>
            <p className="text-xl opacity-80 mb-8 uppercase tracking-widest">
              Initiate your campus hiring pipeline by filling out the form. Our cell will contact you within 24 hours.
            </p>
          </div>
          
          <form className="brutalist-border p-8 bg-[var(--color-foreground)] text-[var(--color-background)] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="uppercase font-bold tracking-widest text-sm">Company Name</label>
              <input 
                type="text" 
                className="brutalist-border bg-[var(--color-background)] text-[var(--color-foreground)] p-4 text-xl font-bold uppercase focus:outline-none focus:border-[var(--color-accent)]"
                placeholder="E.G., ACME CORP"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="uppercase font-bold tracking-widest text-sm">Official Email</label>
              <input 
                type="email" 
                className="brutalist-border bg-[var(--color-background)] text-[var(--color-foreground)] p-4 text-xl font-bold uppercase focus:outline-none focus:border-[var(--color-accent)]"
                placeholder="HR@ACMECORP.COM"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="uppercase font-bold tracking-widest text-sm">Roles Offered</label>
              <textarea 
                rows={4}
                className="brutalist-border bg-[var(--color-background)] text-[var(--color-foreground)] p-4 text-xl font-bold uppercase focus:outline-none focus:border-[var(--color-accent)] resize-none"
                placeholder="SOFTWARE ENGINEER, PRODUCT MANAGER"
              />
            </div>

            <MagneticButton className="mt-4 bg-[var(--color-background)] !text-[var(--color-foreground)] border-4 border-[var(--color-background)] hover:bg-[var(--color-accent)] hover:!text-[var(--color-background)]">
              Submit Request
            </MagneticButton>
          </form>
        </section>
      </div>
    </main>
  );
}
