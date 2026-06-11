'use client'

import { useEffect, useRef, useState } from 'react'
import BeforeAfterSlider from './components/BeforeAfterSlider'

// ─── Design tokens ────────────────────────────────────────────────────────────
const D = {
  coral: '#E8896A',
  navy: '#2D3561',
  bg: '#FAF7F2',
  card: '#FFFFFF',
  shadow: '0 2px 20px rgba(0,0,0,0.06)',
  cream: '#FDF0E8',
  gray: '#6B6B6B',
  light: '#9B9B9B',
  border: '#E0D8CE',
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -999, y: -999 })
  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let raf: number
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const pts = Array.from({ length: 120 }, (_, i) => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
      r: 2 + Math.random() * 2, col: i % 2 === 0 ? 'rgba(232,137,106,0.5)' : 'rgba(45,53,97,0.35)',
    }))
    const CONNECT_SQ = 180 * 180
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { x: mx, y: my } = mouse.current
      for (const p of pts) {
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy)
        if (d < 150 && d > 0) { const f = (150 - d) * 0.015; p.x += (dx / d) * f; p.y += (dy / d) * f }
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy) }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.col; ctx.fill()
      }
      ctx.beginPath(); ctx.strokeStyle = 'rgba(232,137,106,0.2)'; ctx.lineWidth = 0.8
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j]
          if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 < CONNECT_SQ) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y) }
        }
      ctx.stroke(); raf = requestAnimationFrame(tick)
    }
    tick()
    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove) }
  }, [])
  return <canvas ref={cvs} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
      <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: D.coral, fontWeight: 600, marginBottom: '12px' }}>{label}</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: D.navy, marginBottom: sub ? '12px' : 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: '0.9375rem', color: D.gray, lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>{sub}</p>}
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ idx, students, onClose, onPrev, onNext }: {
  idx: number; students: typeof STUDENTS; onClose: () => void; onPrev: () => void; onNext: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const s = students[idx]

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => { setFullscreen(false) }, [idx])

  return (
    <>
      {/* Main overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,5,3,0.96)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 48px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Close btn */}
        <button
          onClick={e => { e.stopPropagation(); onClose() }}
          className="lb-close"
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>

        {/* Content */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            maxWidth: '960px', width: '92vw',
            background: '#FAFAF8', borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            display: 'grid', gridTemplateColumns: '1.3fr 1fr',
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
            transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
            maxHeight: '88vh',
          }}
        >
          {/* Left: image */}
          <div style={{ background: '#111', position: 'relative', overflow: 'hidden', minHeight: '420px' }}>
            <img
              src={s.img}
              alt={s.title}
              className="lb-photo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { const el = e.currentTarget; el.style.display = 'none'; const p = el.parentElement; if (p) p.style.background = '#181818' }}
            />
            {/* Gradient overlay with title */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)', padding: '24px 28px', pointerEvents: 'none' }}>
              <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>{s.title}</div>
              <span style={{ background: 'rgba(232,137,106,0.85)', color: 'white', fontSize: '0.68rem', letterSpacing: '0.08em', padding: '3px 10px', borderRadius: '100px', fontWeight: 600, textTransform: 'uppercase' as const }}>{s.tag}</span>
            </div>
            {/* Magnify btn */}
            <button
              onClick={e => { e.stopPropagation(); setFullscreen(true) }}
              className="lb-magnify"
              style={{ position: 'absolute', bottom: '20px', right: '20px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6m-3-3h6"/>
              </svg>
            </button>
          </div>

          {/* Right: info */}
          <div style={{ background: '#FAFAF8', padding: '44px 36px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ flex: 1 }}>
              {/* Tag */}
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: D.coral, fontWeight: 600, textTransform: 'uppercase' as const, marginBottom: '6px' }}>{s.tag}</div>
              {/* Title */}
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.2, marginBottom: '12px' }}>{s.title}</h2>
              {/* Desc */}
              <p style={{ fontSize: '0.9375rem', color: '#6B6B6B', lineHeight: 1.7, margin: '0 0 28px' }}>{s.desc}</p>
              {/* Divider */}
              <div style={{ height: '1px', background: '#F0EBE3', marginBottom: '24px' }} />
              {/* Student */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #FDF0E8, #F5D5C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 700, color: D.coral, flexShrink: 0 }}>{s.init}</div>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#2D3561' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#9B9B9B', marginTop: '2px' }}>{s.bg}</div>
                </div>
              </div>
              {/* Quote */}
              <div style={{ background: '#FAF7F2', borderRadius: '16px', padding: '20px 22px', borderLeft: '4px solid #E8896A' }}>
                <span style={{ fontSize: '2.5rem', color: D.coral, opacity: 0.3, lineHeight: 0.5, marginBottom: '8px', display: 'block' }}>"</span>
                <p style={{ fontSize: '0.9375rem', color: '#4A4A4A', lineHeight: 1.8, fontStyle: 'italic', margin: 0 }}>{s.quote}</p>
              </div>
            </div>

            {/* Bottom nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #F0EBE3' }}>
              <button
                onClick={e => { e.stopPropagation(); onPrev() }}
                disabled={idx === 0}
                className="lb-nav-btn"
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1.5px solid ${D.border}`, background: 'white', cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none', opacity: idx === 0 ? 0.3 : 1 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5m0 0l7-7m-7 7l7 7"/>
                </svg>
              </button>
              <div style={{ display: 'flex', gap: '6px' }}>
                {students.map((_, i) => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === idx ? D.coral : D.border, transition: 'background 0.2s' }} />
                ))}
              </div>
              <button
                onClick={e => { e.stopPropagation(); onNext() }}
                disabled={idx === students.length - 1}
                className="lb-nav-btn"
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1.5px solid ${D.border}`, background: 'white', cursor: idx === students.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none', opacity: idx === students.length - 1 ? 0.3 : 1 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m0 0l-7-7m7 7l-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen image overlay */}
      {fullscreen && (
        <div
          onClick={() => setFullscreen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img src={s.img} alt={s.title} style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: '8px' }} />
          <button onClick={() => setFullscreen(false)} style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
          </button>
        </div>
      )}
    </>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STUDENTS = [
  {
    tag: '行政 → 產品設計', init: '林',
    title: '旅伴揪團 App', desc: '讓想找旅伴出遊的人快速媒合，發起屬於自己的行程。',
    img: '/students/togetherly.png', name: '林同學', bg: '行政助理 5 年，希望培養第二專長',
    quote: '原本以為自己完全不懂設計，沒想到透過課程一步一步拆解需求，最後真的把想法做成作品。最大的收穫是開始知道怎麼用設計解決問題，而不是只把畫面做漂亮。',
  },
  {
    tag: 'UI 設計師 → 產品思維', init: '陳',
    title: '寵物健康管理平台', desc: '協助飼主統一管理毛小孩的疫苗、看診與健康紀錄。',
    img: '/students/petcare.png', name: '陳同學', bg: 'UI 設計師 3 年，希望提升產品思維',
    quote: '以前做設計比較專注在畫面細節，這次從使用者需求開始思考，才發現產品規劃其實比畫圖更重要。現在提案時也更有邏輯了。',
  },
  {
    tag: '餐飲店長 → 科技轉職', init: '王',
    title: '排隊點餐系統', desc: '線上取號、即時查看等候進度，告別現場排隊混亂。',
    img: '/students/queue.png', name: '王同學', bg: '餐飲業店長，希望轉職進入科技業',
    quote: '以前覺得科技業離我很遠，但透過實際做出作品集，才發現自己的工作經驗也能轉化成產品想法。完成作品後對轉職更有信心了。',
  },
]

const STATS = [
  { label: '課程時數', target: 90, suffix: '+' },
  { label: '學員完成作品', target: 50, suffix: '+' },
  { label: '需要寫程式', target: 0, suffix: '' },
  { label: '課程影片', target: 48, suffix: 'h' },
]

const QUESTIONS = [
  { q: '每天重複做一樣的事', a: '做一個自動化小工具，把你每天重複做的事，變成一個按鈕就搞定。' },
  { q: '記帳太麻煩總是忘記', a: '做一個語音記帳 App，說出花了多少，AI 幫你自動分類存起來。' },
  { q: '找不到適合的團體工具', a: '做一個小型協作平台，專為你的團隊設計，只有你們需要的功能。' },
  { q: '有很多想法卻沒地方記', a: '做一個靈感收集盒，隨時記錄想法，AI 幫你整理成可執行的計畫。' },
]

const TABS = ['什麼是 Vibe Coding？', '學員成果', 'Before / After', '現場體驗']

// ─── SVG helpers ──────────────────────────────────────────────────────────────
const IconCode = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={D.coral} strokeWidth="1.5">
    <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
)
const IconTarget = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={D.coral} strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <circle cx="12" cy="12" r="7"/>
    <circle cx="12" cy="12" r="10.5" strokeDasharray="2 3"/>
  </svg>
)
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round">
    <path d="M2 2l10 10M12 2L2 12"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={D.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7l3.5 3.5L12 3"/>
  </svg>
)

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [selectedQ, setSelectedQ] = useState<string | null>(null)
  const [timerSec, setTimerSec] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  // Hero counting
  const [heroNums, setHeroNums] = useState([0, 0, 0, 0])

  // (slider logic moved to BeforeAfterSlider component)

  // Timer
  useEffect(() => {
    if (timerRunning) {
      ivRef.current = setInterval(() => {
        setTimerSec(s => { if (s <= 1) { setTimerRunning(false); return 0 } return s - 1 })
      }, 1000)
    } else {
      if (ivRef.current) clearInterval(ivRef.current)
    }
    return () => { if (ivRef.current) clearInterval(ivRef.current) }
  }, [timerRunning])

  // Hero counting
  useEffect(() => {
    const animate = (idx: number, target: number, duration: number) => {
      if (target === 0) return
      const start = Date.now()
      const step = () => {
        const t = Math.min((Date.now() - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setHeroNums(prev => { const n = [...prev]; n[idx] = Math.round(eased * target); return n })
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    animate(0, 90, 1200); animate(1, 50, 1500); animate(3, 48, 1000)
  }, [])

  // ESC closes lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxIdx(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])


  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const maxW = { maxWidth: '1000px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }

  return (
    <>
      <ParticleCanvas />

      {lightboxIdx !== null && (
        <Lightbox
          idx={lightboxIdx}
          students={STUDENTS}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() => setLightboxIdx(i => (i !== null && i < STUDENTS.length - 1 ? i + 1 : i))}
        />
      )}

      <style>{`
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover:not(.tab-active) { border-color: ${D.coral} !important; color: ${D.coral} !important; }
        .s-card { transition: border-color 0.2s; }
        .s-card:hover { border-color: ${D.coral} !important; }
        .opt-btn { transition: all 0.2s; }
        .opt-btn:hover:not(.opt-active) { border-color: ${D.coral} !important; color: ${D.coral} !important; }
        .lb-photo { transition: transform 0.4s ease; }
        .lb-photo:hover { transform: scale(1.03); }
        .lb-close:hover { background: rgba(255,255,255,0.22) !important; }
        .lb-magnify:hover { background: rgba(255,255,255,0.28) !important; }
        .lb-nav-btn:hover:not(:disabled) { border-color: ${D.coral} !important; color: ${D.coral} !important; }
        .lb-trigger:hover { text-decoration: underline; }

        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(232,137,106,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(232,137,106,0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(8px); }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══════════ HERO ══════════ */}
        <section style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 2rem', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #FAF7F2 0%, #FDF0E8 40%, #F5EDE0 100%)',
          backgroundSize: '400% 400%', animation: 'gradientShift 8s ease infinite',
        }}>
          <div style={{ position: 'absolute', top: '-60px', left: '-80px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,137,106,0.12) 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,137,106,0.12) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite reverse', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '30%', right: '5%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,137,106,0.10) 0%, transparent 70%)', animation: 'float 5s ease-in-out 2s infinite', pointerEvents: 'none' }} />

          <div style={{ textAlign: 'center', width: '100%', maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', background: D.coral, color: 'white', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 18px', borderRadius: '100px', marginBottom: '2rem', fontWeight: 600, animation: 'pulse 2.5s ease infinite' }}>
              UIUX × Vibe Coding 實戰課程
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, color: D.navy, lineHeight: 1.25 }}>
              提出好問題，<br />永遠比給出答案更有強度。
            </h1>
            <p style={{ maxWidth: '560px', margin: '1.5rem auto 0', color: D.gray, fontSize: '0.9375rem', lineHeight: 1.7 }}>
              先學會思考，再善用工具。把想法化為有價值的產品，幫助更多人，創造更多影響力。
            </p>
            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
              {STATS.map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '16px', padding: '24px 16px', boxShadow: D.shadow }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: D.coral, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{heroNums[i]}{s.suffix}</div>
                  <div style={{ fontSize: '0.8rem', color: D.light, marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '3rem' }}>
              <span style={{ display: 'inline-block', fontSize: '1.5rem', color: D.coral, animation: 'bounce 1.5s ease-in-out infinite' }}>↓</span>
            </div>
          </div>
        </section>

        {/* ══════════ TAB NAV ══════════ */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '1rem 0' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 1rem' }}>
            {TABS.map((t, i) => (
              <button key={i} className={`tab-btn${tab === i ? ' tab-active' : ''}`} onClick={() => setTab(i)} style={{ padding: '10px 24px', borderRadius: '100px', border: `1.5px solid ${tab === i ? D.coral : D.border}`, background: tab === i ? D.coral : 'transparent', color: tab === i ? 'white' : D.gray, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', outline: 'none' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* ══════════ TAB 0 : Vibe Coding ══════════ */}
        {tab === 0 && (
          <div style={{ padding: '80px 0', ...maxW }}>
            <SectionHeader label="WHAT IS VIBE CODING" title="不需要會寫程式，用說的就能做出產品" sub="用自然語言和 AI 對話，讓 AI 幫你把想法變成真實可用的工具。" />

            {/* Feature cards with SVG icons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px', marginBottom: '20px' }}>
              {[
                { Icon: IconCode, title: '你不需要會寫程式', body: 'Vibe Coding 是用自然語言和 AI 對話，讓 AI 幫你寫程式、做出工具或網站的方式。你只需要說清楚你想要什麼。' },
                { Icon: IconTarget, title: '你專注在想解決什麼問題', body: 'AI 幫你處理怎麼做出來。就像有一位很厲害的 AI 工程師助手，隨時待命，零加班費。' },
              ].map(({ Icon, title, body }, i) => (
                <div key={i} style={{ background: D.card, borderRadius: '16px', padding: '32px', boxShadow: D.shadow }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FDF0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Icon />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: D.navy, marginBottom: '10px' }}>{title}</h3>
                  <p style={{ fontSize: '0.9375rem', color: D.gray, lineHeight: 1.7, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>

            {/* Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: '#F5F4F0', borderRadius: '16px', padding: '32px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#888', letterSpacing: '0.05em', marginBottom: '20px' }}>傳統寫程式</div>
                {['學語言', '寫程式碼', '測試除錯', '花很多時間還不一定做得出來'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', fontSize: '0.9375rem', color: '#999' }}>
                    <span style={{ flexShrink: 0 }}><XIcon /></span>{t}
                  </div>
                ))}
              </div>
              <div style={{ background: '#FDF0E8', borderRadius: '16px', padding: '32px', border: '1.5px solid rgba(232,137,106,0.3)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: D.coral, letterSpacing: '0.05em', marginBottom: '20px' }}>Vibe Coding ✦</div>
                {['用說的像聊天一樣', 'AI 幫你寫程式', '快速看到成果', '持續優化越來越好用'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', fontSize: '0.9375rem', color: D.navy }}>
                    <span style={{ flexShrink: 0 }}><CheckIcon /></span>{t}
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', borderRadius: '16px', overflow: 'hidden', boxShadow: D.shadow, flexWrap: 'wrap' }}>
              {['你有想法', '告訴AI需求', 'AI幫你寫', '得到成果'].map((s, i, arr) => (
                <div key={i} style={{ flex: '1 1 120px', textAlign: 'center', padding: '24px 16px', background: D.card, borderRight: i < arr.length - 1 ? '1px solid #F0EBE3' : 'none' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: D.coral, color: 'white', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{i + 1}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: D.navy }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {['沒有程式基礎的設計師', '想快速實現想法的人', '想解決生活問題的人'].map((w, i) => (
                <span key={i} style={{ border: `1.5px solid ${D.coral}`, color: D.coral, borderRadius: '100px', padding: '8px 20px', fontSize: '0.875rem' }}>{w}</span>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ TAB 1 : 學員成果 ══════════ */}
        {tab === 1 && (
          <div style={{ padding: '80px 0', ...maxW }}>
            <SectionHeader label="STUDENT SHOWCASE" title="素人也能做出真實產品" sub="三位學員從零開始，用設計思考 × Vibe Coding 完成真實可用的產品。" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px', alignItems: 'start' }}>
              {STUDENTS.map((s, i) => (
                <div key={i} className="s-card" style={{ background: D.card, borderRadius: '16px', overflow: 'hidden', boxShadow: D.shadow, border: '1.5px solid transparent' }}>
                  <div style={{ background: '#FDF0E8', padding: '10px 20px', fontSize: '0.75rem', color: D.coral, fontWeight: 600, letterSpacing: '0.05em' }}>{s.tag}</div>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: D.navy, marginBottom: '6px' }}>{s.title}</h3>
                    <p style={{ fontSize: '0.9375rem', color: D.gray, lineHeight: 1.7, marginBottom: '16px' }}>{s.desc}</p>
                    <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ color: D.coral, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', padding: 0, outline: 'none' }}>
                      {expanded === i ? '收起 ▲' : '展開成果 ▼'}
                    </button>

                    {expanded === i && (
                      <div style={{ borderTop: '1px solid #F0EBE3', paddingTop: '20px', marginTop: '16px' }}>
                        {/* CTA button */}
                        <button
                          onClick={() => setLightboxIdx(i)}
                          className="lb-trigger"
                          style={{ color: D.coral, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: '0 0 16px', outline: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          查看完整作品 →
                        </button>

                        {/* Preview image */}
                        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img
                            src={s.img}
                            alt={s.title}
                            className="lb-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => setLightboxIdx(i)}
                            onError={e => { const el = e.currentTarget; el.style.display = 'none'; const p = el.parentElement; if (p) p.innerHTML = '<span style="color:#ccc;font-size:12px">圖片即將放入</span>' }}
                          />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: D.light, textAlign: 'center', marginBottom: '16px' }}>點擊圖片可放大</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FDF0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: D.coral, fontSize: '1rem', flexShrink: 0 }}>{s.init}</div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: D.navy }}>{s.name}</div>
                            <div style={{ fontSize: '0.8125rem', color: D.light }}>{s.bg}</div>
                          </div>
                        </div>
                        <blockquote style={{ borderLeft: `3px solid ${D.coral}`, padding: '12px 16px', background: '#FDF0E8', borderRadius: '0 8px 8px 0', fontSize: '0.9rem', color: '#5C5C5C', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                          「{s.quote}」
                        </blockquote>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ TAB 2 : Before / After Slider ══════════ */}
        {tab === 2 && (
          <div style={{ padding: '80px 0', ...maxW }}>
            <SectionHeader label="BEFORE / AFTER" title="同一個產品，差在哪裡？" sub="左邊：沒有 UIUX 核心，直接 Vibe Coding 的結果。右邊：先有設計思考，再用 Vibe Coding 做出來的版本。" />

            <BeforeAfterSlider />

            <div style={{ textAlign: 'center', color: D.light, fontSize: '0.875rem', marginTop: '16px' }}>
              ← 左右拖曳，感受設計思考帶來的差距 →
            </div>

            <div style={{ marginTop: '40px', background: D.navy, color: 'white', borderRadius: '16px', padding: '32px 40px', textAlign: 'center', boxShadow: '0 8px 40px rgba(45,53,97,0.2)' }}>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                兩個產品的功能完全一樣——都可以發起旅程、加入旅程。<br />
                差別在於：有沒有先想清楚<strong style={{ color: D.coral, fontWeight: 700 }}>「用戶的感受是什麼」</strong>。<br />
                這就是 UIUX 核心思維帶來的差距。
              </p>
            </div>
          </div>
        )}

        {/* ══════════ TAB 3 : 現場體驗 ══════════ */}
        {tab === 3 && (
          <div style={{ padding: '80px 0', ...maxW }}>
            <SectionHeader label="LIVE EXPERIENCE" title="現在就體驗 Vibe Coding 的威力" />
            <div style={{ background: D.card, borderRadius: '16px', padding: '40px', boxShadow: D.shadow, textAlign: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: D.navy, marginBottom: '8px' }}>你現在最想解決生活中的哪個問題？</h3>
              <p style={{ color: D.light, fontSize: '0.9375rem', marginBottom: '28px' }}>選一個，AI 幫你想解法</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', maxWidth: '560px', margin: '0 auto' }}>
                {QUESTIONS.map((q, i) => (
                  <button key={i} className={`opt-btn${selectedQ === q.a ? ' opt-active' : ''}`} onClick={() => setSelectedQ(q.a)} style={{ border: `1.5px solid ${selectedQ === q.a ? D.coral : D.border}`, background: selectedQ === q.a ? D.coral : 'white', borderRadius: '100px', padding: '12px 24px', fontSize: '0.9375rem', color: selectedQ === q.a ? 'white' : '#4B4B4B', cursor: 'pointer', outline: 'none' }}>{q.q}</button>
                ))}
              </div>
              {selectedQ && (
                <div style={{ marginTop: '24px', background: '#FDF0E8', borderRadius: '12px', padding: '20px 24px', textAlign: 'left', borderLeft: `4px solid ${D.coral}`, maxWidth: '560px', margin: '24px auto 0' }}>
                  <div style={{ fontSize: '0.75rem', color: D.coral, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>如果你會 Vibe Coding →</div>
                  <p style={{ fontSize: '1rem', color: '#3D3D3D', lineHeight: 1.7, margin: 0 }}>{selectedQ}</p>
                </div>
              )}
            </div>
            <div style={{ background: D.navy, borderRadius: '24px', padding: '48px 40px', textAlign: 'center', boxShadow: '0 8px 40px rgba(45,53,97,0.25)' }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>LIVE DEMO</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Vibe Coding 做出來的番茄計時器</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>學員在課堂上用 AI 對話，25 分鐘內做出這個工具。</p>
              <div style={{ fontSize: '5rem', fontWeight: 700, color: 'white', letterSpacing: '0.05em', fontVariantNumeric: 'tabular-nums', fontFamily: 'ui-monospace,"Courier New",monospace', marginBottom: '32px', lineHeight: 1 }}>{fmt(timerSec)}</div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setTimerRunning(true)} disabled={timerRunning || timerSec === 0} style={{ background: D.coral, color: 'white', border: 'none', borderRadius: '100px', padding: '12px 32px', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', outline: 'none', opacity: timerRunning || timerSec === 0 ? 0.4 : 1 }}>開始</button>
                <button onClick={() => setTimerRunning(false)} disabled={!timerRunning} style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '100px', padding: '12px 32px', fontSize: '0.9375rem', cursor: 'pointer', outline: 'none', opacity: !timerRunning ? 0.4 : 1 }}>暫停</button>
                <button onClick={() => { setTimerRunning(false); setTimerSec(25 * 60) }} style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '12px 32px', fontSize: '0.9375rem', cursor: 'pointer', outline: 'none' }}>重設</button>
              </div>
            </div>
          </div>
        )}

        <footer style={{ background: D.navy, padding: '40px 2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem' }}>
          UIUX × Vibe Coding 實戰課程 © 2025
        </footer>
      </div>
    </>
  )
}
