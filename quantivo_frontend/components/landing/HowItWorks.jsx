'use client';
import { useRef, useEffect, useState } from 'react';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const STEPS = [
  {
    num: '01',
    title: 'Add your products',
    body: 'Enter your inventory items — name, cost price, selling price, and stock level. Takes about 30 seconds per product, or import a spreadsheet.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'from-indigo-500 to-indigo-600',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
  },
  {
    num: '02',
    title: 'Record your sales',
    body: 'Log orders as they come in. Quantivo automatically decrements your stock and calculates your profit per transaction in real time.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'from-violet-500 to-violet-600',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
  },
  {
    num: '03',
    title: 'Watch your dashboard',
    body: 'Your analytics update instantly. See revenue trends, profit per product, inventory value, and alerts for low-stock items — all live.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'from-emerald-500 to-emerald-600',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
  },
  {
    num: '04',
    title: 'Make smarter decisions',
    body: 'Use real profit data — not guesswork — to decide what to restock, which products to push, and where to cut costs.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'from-amber-500 to-amber-600',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  },
];

export default function HowItWorks() {
  const [ref, inView] = useInView(0.1);

  return (
    <section id="how-it-works" className="py-32 relative">
      {/* Divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-4">
            How it works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-5">
            Up and running in
            <span className="gradient-text"> minutes.</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            No onboarding calls. No manual. Just four simple steps to full business visibility.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative group"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 120}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`,
              }}
            >
              {/* Connector line (hidden on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+28px)] right-[-calc(50%-28px)] h-px bg-gradient-to-r from-zinc-700 to-zinc-800 z-0" />
              )}

              <div className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-full hover:border-zinc-700 hover:-translate-y-1 transition-all duration-200 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {/* Step number */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} ${step.glow} flex items-center justify-center text-white`}>
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-zinc-800 leading-none select-none">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-semibold text-zinc-200 mb-2 text-base">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-700 hover:border-zinc-600 hover:-translate-y-px transition-all duration-200"
          >
            Get started — it's free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}