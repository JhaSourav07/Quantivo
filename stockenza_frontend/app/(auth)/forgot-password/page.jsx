'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';

const EmailIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

function MagneticInput({ label, type = 'text', value, onChange, placeholder, required, IconSvg }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div style={{ position: 'relative' }}>
      <label style={{ position: 'absolute', left: 16, zIndex: 10, pointerEvents: 'none', fontFamily: 'DM Mono,monospace', fontWeight: 500, letterSpacing: lifted ? '0.12em' : '0.02em', textTransform: 'uppercase', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', ...(lifted ? { top: 10, fontSize: 9, color: '#818cf8' } : { top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.22)' }) }}>
        {label}
      </label>
      <input type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        required={required} placeholder={lifted ? placeholder : ''}
        style={{ width: '100%', paddingTop: 28, paddingBottom: 12, paddingLeft: 16, paddingRight: 44, fontSize: 14, fontWeight: 600, color: 'white', background: focused ? 'rgba(99,102,241,0.075)' : 'rgba(255,255,255,0.04)', border: focused ? '1px solid rgba(99,102,241,0.48)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 12, outline: 'none', boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1),inset 0 1px 0 rgba(255,255,255,0.05)' : 'none', transition: 'all 0.25s', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      {IconSvg && <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: focused ? '#818cf8' : 'rgba(255,255,255,0.15)', transition: 'all 0.25s' }}><IconSvg /></div>}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: `translateX(-50%) scaleX(${focused ? 1 : 0})`, width: '90%', height: 1.5, borderRadius: 999, background: 'linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)', transformOrigin: 'center', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [status,     setStatus]     = useState('idle'); // idle | loading | success | error
  const [message,    setMessage]    = useState('');
  const [notFound,   setNotFound]   = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setNotFound(false);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      const isNotFound = err.response?.status === 404;
      setNotFound(isNotFound);
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const cardStyle = {
    position: 'relative', width: '100%', maxWidth: 420,
    opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(28px)',
    transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 28px rgba(99,102,241,0.42); } 50% { box-shadow: 0 0 52px rgba(99,102,241,0.68); } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05050d', fontFamily: 'Syne, sans-serif', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Background effects */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(99,102,241,0.052), transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.018, backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />

        <div style={cardStyle}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,0.5)' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Stock<span style={{ color: '#818cf8' }}>enza</span></span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.035em', lineHeight: 1.1, margin: '0 0 8px' }}>Forgot password?</h1>
            <p style={{ fontFamily: 'DM Mono,monospace', color: 'rgba(255,255,255,0.22)', fontSize: 11, letterSpacing: '0.03em', margin: 0 }}>
              Enter your email and we'll send a reset link →
            </p>
          </div>

          {/* Success state */}
          {status === 'success' && (
            <div style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', marginBottom: 24, padding: '16px', borderRadius: 12, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: '#6ee7b7', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>✉️</span>
              <span>
                <strong style={{ display: 'block', marginBottom: 3 }}>Check your inbox</strong>
                {message}
              </span>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
              <span>
                {message}
                {notFound && (
                  <Link href="/register" style={{ display: 'block', marginTop: 6, color: '#818cf8', fontSize: 12, textDecoration: 'underline' }}>
                    Create an account →
                  </Link>
                )}
              </span>
            </div>
          )}

          {/* Form */}
          {status !== 'success' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <MagneticInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required IconSvg={EmailIcon} />

              <div style={{ paddingTop: 10 }}>
                <button type="submit" disabled={status === 'loading'}
                  style={{ position: 'relative', width: '100%', padding: '15px 24px', borderRadius: 12, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.65 : 1, background: 'linear-gradient(135deg,#4338ca 0%,#6d28d9 55%,#4338ca 100%)', color: 'white', fontSize: 13, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', overflow: 'hidden', fontFamily: 'inherit', animation: 'pulse-glow 2.5s ease-in-out infinite', transition: 'transform 0.15s, opacity 0.2s' }}
                  onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', transform: 'translateX(-100%)', animation: status === 'loading' ? 'none' : 'shimmer 2.5s ease infinite', pointerEvents: 'none' }} />
                  <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {status === 'loading' ? (
                      <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Sending…</>
                    ) : 'Send Reset Link'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Back to login */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/login" style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', letterSpacing: '0.08em', transition: 'color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}>
              ← BACK TO LOGIN
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
