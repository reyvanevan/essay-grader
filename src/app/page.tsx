"use client";

import { motion } from 'framer-motion';
import { ArrowRight, BookOpenCheck, Scale, ScanSearch, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 sm:px-6 pt-4 sm:pt-6"
      >
        <div className="w-full max-w-[1200px] flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full backdrop-blur-2xl backdrop-saturate-150 bg-white/40 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Kromia Desk Logo" className="h-8 w-8 rounded-full shadow-sm" />
            <span className="text-[18px] font-semibold tracking-tight text-[#111]">
              Kromia Desk
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#444]">
            <a href="#features" className="hover:text-black transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-black transition-colors">
              How it Works
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden font-medium text-[14px] text-[#555] transition-colors hover:text-[#111] sm:inline-flex">
              Log in
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-full text-white font-medium text-[14px] bg-gradient-to-b from-[#333] to-[#000] border border-[#444] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:from-[#444] hover:to-[#111] hover:border-[#666] hover:scale-105 active:scale-95">
              Demo
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Sticky Background Video */}
      <div className="fixed top-0 left-0 right-0 bottom-0 z-0 w-full h-screen pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover [transform:scale(1.6)_scaleY(-1)]"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
      </div>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative w-full min-h-screen flex justify-center overflow-visible bg-transparent pt-20">

          <motion.div
            className="relative z-10 w-full max-w-[1200px] flex flex-col items-center pt-[80px] md:pt-[140px] px-6 gap-[24px] md:gap-[32px] text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="font-medium tracking-[-0.04em] text-[#111] text-[42px] sm:text-5xl md:text-[80px] leading-[1.1]"
            >
              Grading student essays <br className="hidden sm:block" />
              <span className="font-[family-name:var(--font-instrument)] italic font-normal text-[54px] sm:text-6xl md:text-[100px] leading-[1.1] text-indigo-600">
                objectively
              </span>{' '}
              at speed
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-[16px] md:text-[18px] text-[#555] max-w-[554px] leading-relaxed"
            >
              Stop doing manual work. We build high-performance assessment systems that automate scale for forward-thinking universities and lecturers.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <Link href="/dashboard" className="px-8 py-3.5 rounded-full text-white font-medium text-[15px] bg-gradient-to-b from-[#333] to-[#000] border border-[#444] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:from-[#444] hover:to-[#111] hover:border-[#666] hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-20 py-24 md:py-32 bg-zinc-50/50">
          <div className="container mx-auto px-6 max-w-[1200px]">
            <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <h2 className="text-[32px] md:text-[54px] font-medium tracking-tight text-[#111] leading-[1.1] max-w-xl">
                Built for <span className="font-[family-name:var(--font-instrument)] italic font-normal text-indigo-600">precision</span> & efficiency
              </h2>
              <p className="text-[#555] max-w-sm text-[16px] md:text-[18px]">
                Combining human-level understanding with machine-speed processing.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Semantic Analysis",
                  desc: "Leverages LLM to understand contextual meanings, not just keywords.",
                  icon: ScanSearch,
                },
                {
                  title: "OCR Integration",
                  desc: "Directly process handwritten essay submissions accurately.",
                  icon: BookOpenCheck,
                },
                {
                  title: "Custom Rubrics",
                  desc: "Dynamically adapt to specific lecturer criteria.",
                  icon: Scale,
                },
                {
                  title: "Objective",
                  desc: "Consistent evaluations free from subjective bias.",
                  icon: ShieldCheck,
                }
              ].map((feature, idx) => (
                <div key={idx} className="group flex flex-col gap-4 rounded-[24px] bg-white p-8 border border-black/[0.04] shadow-[0_2px_10px_0_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.06)] hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.03] text-[#111] transition-transform group-hover:scale-110">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-medium text-[#111]">{feature.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#555]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.05] bg-white py-12 md:py-16">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center text-center gap-6 max-w-[1200px]">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Kromia Desk" className="h-6 w-6 rounded-md" />
            <span className="text-lg font-medium tracking-tight text-[#111]">
              Kromia Desk
            </span>
          </div>
          <p className="max-w-md text-[#555] text-[14px]">
            A smart assessment orchestration system developed as a Bachelor Thesis Project. Proudly powering education through Generative AI.
          </p>
          <div className="text-[13px] text-[#888]">
            &copy; 2026 Kromiatech. Developed by M Reyvan Purnama.
          </div>
        </div>
      </footer>
    </div>
  );
}
