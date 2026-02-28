'use client';
import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const STATS = [
  { value: 500,  suffix: '+',  label: 'Businesses',    desc: 'trust Quantivo daily' },
  { value: 2.4,  suffix: 'M+', label: 'Orders tracked', desc: 'and counting' },
  { value: 99.9, suffix: '%',  label: 'Uptime',         desc: 'guaranteed SLA' },
  { value: 3,    suffix: 'min',label: 'Setup time',     desc: 'to your first insight' },
];

function AnimatedStat({ value, suffix, label, desc, inView }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const isDecimal = value % 1 !== 0;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const current = isDecimal
        ? parseFloat((value * ease).toFixed(1))
        : Math.round(value * ease);
      setDisplay(current);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-zinc-100 tabular-nums tracking-tight">
        {display}{suffix}
      </p>
      <p className="text-sm font-semibold text-indigo-400 mt-1">{label}</p>
      <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
    </div>
  );
}

export default function About() {
  const [ref, inView] = useInView(0.2);

  return (
    <section id="about" className="py-32 relative overflow-hidden">
      {/* bg accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-4">
            What is Quantivo?
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-5">
            Everything your business needs,
            <br />
            <span className="gradient-text">nothing it doesn't.</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Quantivo is a unified business intelligence platform for product-based businesses.
            It connects your inventory, sales, and finances into one real-time view —
            so you always know exactly where you stand.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          {/* Left: text */}
          <div className="space-y-6">
            {[
              {
                icon: '📦',
                title: 'Live inventory intelligence',
                body: 'Always know what you have, what\'s running low, and what\'s tying up capital. Quantivo tracks every unit in real time so you never oversell or over-order.',
              },
              {
                icon: '💸',
                title: 'Profit, not just revenue',
                body: 'Most tools show you revenue. We show you profit. For every product, every order, every day — so you know which products actually make you money.',
              },
              {
                icon: '⚡',
                title: 'Instant setup, zero friction',
                body: 'No spreadsheets to migrate. No consultants. Sign up, add your products, and your dashboard is live in under 3 minutes. Seriously.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                style={{ animation: `fadeIn 0.5s ${i * 120}ms both` }}
              >
                <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-zinc-200 mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: visual card stack */}
          <div className="relative h-80 flex items-center justify-center">
            {/* Glow */}
            <div className="absolute w-64 h-64 rounded-full bg-indigo-500/10 blur-[60px]" />

            {/* Cards stacked */}
            <div className="relative w-full max-w-sm space-y-3">
              {[
                { label: 'Gross Margin', value: '68%',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Avg Order Value', value: '$142', color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Items in Stock', value: '1,204', color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className={`flex items-center justify-between px-5 py-4 rounded-xl border ${card.bg} backdrop-blur-sm`}
                  style={{ transform: `translateX(${i * 8}px)`, animation: `slideInRight 0.5s ${i * 120 + 200}ms both` }}
                >
                  <span className="text-sm text-zinc-400">{card.label}</span>
                  <span className={`text-xl font-bold ${card.color}`}>{card.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-zinc-800/60"
        >
          {STATS.map((s) => (
            <AnimatedStat key={s.label} {...s} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}