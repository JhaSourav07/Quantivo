'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token');

  // 'loading' | 'success' | 'error'
  const [status,  setStatus]  = useState('loading');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please use the link from your email.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get(`/auth/verify/${token}`);
        if (!cancelled) {
          setStatus('success');
          setMessage(data.message || 'Email verified! You can now log in.');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(
            err.response?.data?.message || 'Invalid or expired token. Please register again.'
          );
        }
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#05050d',
    fontFamily: 'Syne, sans-serif',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  };

  const glowStyle = {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: status === 'success'
      ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(52,211,153,0.06), transparent)'
      : status === 'error'
      ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(239,68,68,0.06), transparent)'
      : 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06), transparent)',
  };

  const cardStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: 420,
    padding: '48px 40px',
    borderRadius: 20,
    background: 'linear-gradient(155deg, rgba(255,255,255,0.042), rgba(255,255,255,0.014))',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(24px)',
    textAlign: 'center',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(24px)',
    transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      <div style={containerStyle}>
        {/* Background grid */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.018, backgroundImage:'linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)', backgroundSize:'44px 44px' }} />
        <div style={glowStyle} />

        <div style={cardStyle}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:36 }}>
            <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 22px rgba(99,102,241,0.55)' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span style={{ fontSize:18, fontWeight:900, color:'white', letterSpacing:'-0.02em' }}>
              Stock<span style={{ color:'#818cf8' }}>enza</span>
            </span>
          </div>

          {/* Status icon */}
          <div style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:28 }}>
            {status === 'loading' && (
              <div style={{ width:64, height:64, borderRadius:'50%', border:'3px solid rgba(99,102,241,0.15)', borderTopColor:'#818cf8', animation:'spin 0.8s linear infinite' }} />
            )}

            {status === 'success' && (
              <>
                {/* Pulse ring */}
                <div style={{ position:'absolute', width:64, height:64, borderRadius:'50%', border:'2px solid rgba(52,211,153,0.5)', animation:'pulse-ring 1.6s ease-out infinite' }} />
                <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', display:'flex', alignItems:'center', justifyContent:'center', animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </>
            )}

            {status === 'error' && (
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center', animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Heading */}
          <h1 style={{ fontSize:'1.65rem', fontWeight:900, letterSpacing:'-0.03em', margin:'0 0 10px', color: status === 'success' ? '#34d399' : status === 'error' ? '#f87171' : '#818cf8' }}>
            {status === 'loading' && 'Verifying…'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error'   && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p style={{ fontFamily:'DM Mono, monospace', fontSize:12, lineHeight:1.75, color:'rgba(255,255,255,0.38)', margin:'0 0 36px', letterSpacing:'0.01em' }}>
            {status === 'loading'
              ? 'Hang tight while we confirm your email address…'
              : message}
          </p>

          {/* CTA */}
          {status === 'success' && (
            <Link href="/login"
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'14px 24px', borderRadius:12, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#4338ca 0%,#6d28d9 55%,#4338ca 100%)', color:'white', fontSize:13, fontWeight:900, textDecoration:'none', letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'inherit', boxShadow:'0 0 28px rgba(99,102,241,0.4)', transition:'transform 0.15s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 40px rgba(99,102,241,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 28px rgba(99,102,241,0.4)'; }}
            >
              Go to Login
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}

          {status === 'error' && (
            <Link href="/register"
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'14px 24px', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', background:'transparent', color:'rgba(255,255,255,0.45)', fontSize:13, fontWeight:700, textDecoration:'none', letterSpacing:'0.04em', fontFamily:'inherit', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; e.currentTarget.style.background='rgba(99,102,241,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.75)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}
            >
              Back to Register
            </Link>
          )}

          {/* Footer note */}
          <p style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:'rgba(255,255,255,0.1)', letterSpacing:'0.18em', marginTop:32, textTransform:'uppercase' }}>
            STOCKENZA © 2025 — ALL DATA ENCRYPTED AT REST
          </p>
        </div>
      </div>
    </>
  );
}
