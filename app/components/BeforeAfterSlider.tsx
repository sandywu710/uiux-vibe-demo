'use client'
import { useRef, useEffect } from 'react'

export default function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null)
  const beforeRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setPos = (clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    let pct = ((clientX - r.left) / r.width) * 100
    pct = Math.min(Math.max(pct, 1), 99)
    if (beforeRef.current) beforeRef.current.style.width = pct + '%'
    if (lineRef.current) lineRef.current.style.left = pct + '%'
    if (handleRef.current) handleRef.current.style.left = pct + '%'
  }

  useEffect(() => {
    const mm = (e: MouseEvent) => { if (dragging.current) setPos(e.clientX) }
    const mu = () => { dragging.current = false }
    const tm = (e: TouchEvent) => {
      if (dragging.current) { e.preventDefault(); setPos(e.touches[0].clientX) }
    }
    const tu = () => { dragging.current = false }
    window.addEventListener('mousemove', mm, { passive: true })
    window.addEventListener('mouseup', mu)
    window.addEventListener('touchmove', tm, { passive: false })
    window.addEventListener('touchend', tu)
    return () => {
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
      window.removeEventListener('touchmove', tm)
      window.removeEventListener('touchend', tu)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', height: '600px', borderRadius: '20px', overflow: 'hidden', cursor: 'col-resize', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', userSelect: 'none' }}
      onMouseDown={(e) => { dragging.current = true; setPos(e.clientX) }}
      onTouchStart={(e) => { dragging.current = true; setPos(e.touches[0].clientX) }}
    >
      {/* After 層（底層，全寬） */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img
          src="/after/after_2.png"
          alt="After"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', pointerEvents: 'none' }}
        />
        <div style={{ position: 'absolute', top: 16, right: 16, background: '#2D3561', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
          AFTER ✦ 設計思考 × Vibe Coding
        </div>
      </div>

      {/* Before 層（上層，寬度由 ref 控制） */}
      <div ref={beforeRef} style={{ position: 'absolute', inset: 0, width: '50%', overflow: 'hidden' }}>
        <img
          src="/before/before1.png"
          alt="Before"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', pointerEvents: 'none' }}
        />
        <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.92)', color: '#888', padding: '6px 16px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600 }}>
          BEFORE 素人 Vibe Coding
        </div>
      </div>

      {/* 分隔線 */}
      <div
        ref={lineRef}
        style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', background: 'white', boxShadow: '0 0 8px rgba(0,0,0,0.25)', pointerEvents: 'none' }}
      />

      {/* Handle */}
      <div
        ref={handleRef}
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '48px', height: '48px', borderRadius: '50%', background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: '4px' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 5l-4 5 4 5M13 5l4 5-4 5" stroke="#E8896A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}
