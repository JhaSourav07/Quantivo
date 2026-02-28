'use client';
import { useRef, useEffect, useState } from 'react';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const FEATURES = [
  {
    title: 'Inventory Management',
    desc: 'Track every SKU in real time. Get low-stock alerts before you run out. Know your total inventory value at a glance.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    accent: 'indigo',
    tags: ['Stock levels', 'Low-stock alerts', 'Cost tracking'],
    visual: (
      <div className="space-y-2 mt-4">
        {[['Wireless Headset', 42, 80], ['Keyboard Pro', 8, 15], ['USB Hub X3', 97, 100]].map(([name, v, max]) => (
          <div key={name}>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{name}</span><span className={v < 15 ? 'text-red-400' : 'text-zinc-400'}>{v} units</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800">
              <div className={`h-full rounded-full transition-all ${v < 15 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${(v/max)*100}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Order Processing',
    desc: 'Log a sale in seconds. Stock auto-decrements. Profit auto-calculates. Your order history is always up to date.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    accent: 'violet',
    tags: ['Auto stock sync', 'Order history', 'Fast entry'],
    visual: (
      <div className="space-y-2 mt-4">
        {[['#4821', 'Keyboard Pro', '$189', '+$52'], ['#4820', 'Headset X', '$79', '+$28'], ['#4819', 'USB Hub', '$39', '+$14']].map(([id, name, rev, profit]) => (
          <div key={id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-zinc-800/50">
            <span className="text-zinc-600 font-mono">{id}</span>
            <span className="text-zinc-300">{name}</span>
            <span className="text-zinc-400">{rev}</span>
            <span className="text-emerald-400 font-semibold">{profit}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Profit Analytics',
    desc: 'See revenue vs profit over time. Break down performance by product. Know your margins with precision.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: 'emerald',
    tags: ['Revenue trends', 'Margin analysis', 'Product P&L'],
    visual: (
      <div className="mt-4 flex items-end gap-1 h-14">
        {[30, 55, 42, 70, 58, 85, 72, 90, 78, 95, 84, 100].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(34,197,94,${0.3 + (h/100)*0.5})` }} />
        ))}
      </div>
    ),
  },
  {
    title: 'Business Reports',
    desc: 'Instant summary of total revenue, net profit, and inventory value. The numbers you actually need to run your business.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    accent: 'amber',
    tags: ['Summary stats', 'Date filtering', 'Export ready'],
    visual: (
      <div className="mt-4 space-y-2">
        {[['Total Revenue', '$48,290', 'text-zinc-200'], ['Net Profit', '$12,840', 'text-emerald-400'], ['Inventory Value', '$31,500', 'text-indigo-400']].map(([label, val, color]) => (
          <div key={label} className="flex justify-between text-xs py-2 border-b border-zinc-800/60">
            <span className="text-zinc-500">{label}</span>
            <span className={`font-bold ${color}`}>{val}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const ACCENT_COLORS = {
  indigo:  { icon: 'bg-indigo-500/15 text-indigo-400',  tag: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',  glow: 'hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)]',  border: 'hover:border-indigo-500/30'  },
  violet:  { icon: 'bg-violet-500/15 text-violet-400',   tag: 'bg-violet-500/10 text-violet-400 border-violet-500/20',   glow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.15)]',  border: 'hover:border-violet-500/30'  },
  emerald: { icon: 'bg-emerald-500/15 text-emerald-400', tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', glow: 'hover:shadow-[0_8px_40px_rgba(34,197,94,0.15)]',   border: 'hover:border-emerald-500/30' },
  amber:   { icon: 'bg-amber-500/15 text-amber-400',     tag: 'bg-amber-500/10 text-amber-400 border-amber-500/20',     glow: 'hover:shadow-[0_8px_40px_rgba(245,158,11,0.15)]',  border: 'hover:border-amber-500/30'   },
};

export default function Features() {
  const [ref, inView] = useInView(0.1);

  return (
    <section id="features" className="py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-4">
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-5">
            Built for how businesses
            <span className="gradient-text"> actually work.</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            Four core modules. Infinite visibility. Zero learning curve.
          </p>
        </div>

        {/* Feature cards */}
        <div ref={ref} className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => {
            const c = ACCENT_COLORS[f.accent];
            return (
              <div
                key={f.title}
                className={[
                  'bg-zinc-900 border border-zinc-800 rounded-2xl p-6 group cursor-default',
                  'transition-all duration-300 hover:-translate-y-1',
                  c.glow, c.border,
                ].join(' ')}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-base mb-1">{f.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {f.tags.map((tag) => (
                    <span key={tag} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${c.tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Mini visual */}
                {f.visual}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}