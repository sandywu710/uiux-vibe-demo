'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Particle Canvas ─────────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 2 + Math.random(),
      col: Math.random() > 0.5 ? 'rgba(232,137,106,0.4)' : 'rgba(45,53,97,0.3)',
    }))

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { x: mx, y: my } = mouseRef.current

      for (const p of pts) {
        const dx = p.x - mx
        const dy = p.y - my
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 130 && d > 0) {
          const f = ((130 - d) / 130) * 0.8
          p.x += (dx / d) * f
          p.y += (dy / d) * f
        }
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy) }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.col
        ctx.fill()
      }

      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]
        if (Math.sqrt((a.x - mx) ** 2 + (a.y - my) ** 2) > 160) continue
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]
          if (Math.sqrt((b.x - mx) ** 2 + (b.y - my) ** 2) > 160) continue
          if (Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) < 160) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = 'rgba(232,137,106,0.12)'
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(tick)
    }

    tick()

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', setSize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STUDENTS = [
  {
    tag: '行政 → 產品設計', initials: '林',
    title: '旅伴揪團 App', desc: '快速發起行程、媒合想一起出遊的旅伴',
    img: '/students/togetherly.png',
    student: '林同學 • 行政助理 5 年，希望培養第二專長',
    quote: '原本以為自己完全不懂設計，沒想到透過課程一步一步拆解需求，最後真的把想法做成作品。最大的收穫是開始知道怎麼用設計解決問題，而不是只把畫面做漂亮。',
  },
  {
    tag: 'UI設計師 → 產品思維', initials: '陳',
    title: '寵物健康管理平台', desc: '記錄毛小孩疫苗、看診與健康資訊',
    img: '/students/petcare.png',
    student: '陳同學 • UI設計師 3 年，希望提升產品思維',
    quote: '以前做設計比較專注在畫面細節，這次從使用者需求開始思考，才發現產品規劃其實比畫圖更重要。現在提案時也更有邏輯了。',
  },
  {
    tag: '餐飲店長 → 科技轉職', initials: '王',
    title: '排隊點餐系統', desc: '線上取號、查看等候進度，告別混亂',
    img: '/students/queue.png',
    student: '王同學 • 餐飲業店長，希望轉職進入科技業',
    quote: '以前覺得科技業離我很遠，但透過實際做出作品集，才發現自己的工作經驗也能轉化成產品想法。完成作品後對轉職更有信心了。',
  },
]

const QUESTIONS = [
  { q: '每天重複做一樣的事', a: '做一個自動化小工具，把你每天重複做的事，變成一個按鈕就搞定。' },
  { q: '記帳太麻煩總是忘記', a: '做一個語音記帳 App，說出花了多少，AI 幫你自動分類存起來。' },
  { q: '找不到適合的團體工具', a: '做一個小型協作平台，專為你的團隊設計，只有你們需要的功能。' },
  { q: '有很多想法卻沒地方記', a: '做一個靈感收集盒，隨時記錄想法，AI 幫你整理成可執行的計畫。' },
]

const C = { orange: '#E8896A', blue: '#2D3561', cream: '#FDF0E8' }

const card: React.CSSProperties = {
  backgroundColor: 'white', borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '28px',
}

export default function Home() {
  const [tab, setTab] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [sec, setSec] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      ivRef.current = setInterval(() => setSec(s => { if (s <= 1) { setRunning(false); return 0 } return s - 1 }), 1000)
    } else {
      if (ivRef.current) clearInterval(ivRef.current)
    }
    return () => { if (ivRef.current) clearInterval(ivRef.current) }
  }, [running])

  const resetTimer = useCallback(() => { setRunning(false); setSec(25 * 60) }, [])
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const TABS = ['什麼是 Vibe Coding？', '學員成果', 'Before / After', '現場體驗']

  return (
    <>
      <ParticleCanvas />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', backgroundColor: C.cream }}>

        {/* ── Hero ── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '72px 24px 56px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', padding: '7px 22px', borderRadius: 999,
            background: `linear-gradient(135deg, ${C.orange}, #d4694a)`,
            color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 28,
            boxShadow: `0 4px 20px rgba(232,137,106,0.35)`,
          }}>
            UIUX × Vibe Coding 實戰課程
          </div>

          <h1 style={{
            fontSize: 'clamp(30px, 5.5vw, 52px)', fontWeight: 900, lineHeight: 1.25,
            color: C.blue, marginBottom: 20, letterSpacing: '-0.01em',
          }}>
            提出好問題，<br />永遠比給出答案更有強度。
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.9, color: '#888',
            maxWidth: 560, margin: '0 auto 48px',
          }}>
            先學會思考，再善用工具。把想法化為有價值的產品，幫助更多人，創造更多影響力。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 16, maxWidth: 680, margin: '0 auto' }}>
            {[
              { num: '3+', label: '真實學員案例' },
              { num: '100%', label: '從0完成產品' },
              { num: '0', label: '需要寫程式' },
              { num: '48h', label: '課程時數' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 16, padding: '22px 12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}>
                <div style={{ fontSize: 38, fontWeight: 900, color: C.orange, lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: C.blue, marginTop: 6, fontWeight: 600, opacity: 0.75 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tab Nav ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: `rgba(253,240,232,0.92)`, backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(232,137,106,0.15)', padding: '12px 24px',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                whiteSpace: 'nowrap', padding: '9px 22px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                background: tab === i ? `linear-gradient(135deg,${C.orange},#d4694a)` : 'white',
                color: tab === i ? 'white' : C.blue,
                border: tab === i ? 'none' : `1.5px solid ${C.orange}`,
                boxShadow: tab === i ? `0 4px 16px rgba(232,137,106,0.4)` : 'none',
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* ───── TAB 0 : 什麼是 Vibe Coding？ ───── */}
          {tab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* 兩欄說明 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
                <div style={card}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: C.blue, marginBottom: 10 }}>你不需要會寫程式</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: '#777' }}>
                    Vibe Coding 是用自然語言和 AI 對話，讓 AI 幫你寫程式、做出工具或網站的方式。
                  </p>
                </div>
                <div style={card}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: C.blue, marginBottom: 10 }}>你專注在想解決什麼問題</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: '#777' }}>
                    AI 幫你處理怎麼做出來。就像有一位很厲害的 AI 工程師助手，隨時待命。
                  </p>
                </div>
              </div>

              {/* 對比 */}
              <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
                  <div style={{ background: '#f3f4f6', padding: '28px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>傳統寫程式</div>
                    {['學語言', '寫程式碼', '測試除錯', '花很多時間還不一定做得出來'].map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#9ca3af', marginBottom: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: '#f87171', flexShrink: 0 }}>✕</span>{t}
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#FDF0E8', padding: '28px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Vibe Coding</div>
                    {['用說的像聊天一樣', 'AI 幫你寫程式', '快速看到成果', '持續優化越來越好用'].map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: C.blue, marginBottom: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: C.orange, flexShrink: 0 }}>✓</span>{t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 四步驟 */}
              <div style={{ ...card, padding: '32px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.blue, marginBottom: 28, textAlign: 'center' }}>四步驟，從想法到成果</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: 8 }}>
                  {['你有想法', '告訴AI需求', 'AI幫你寫', '得到成果'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 72 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: `linear-gradient(135deg,${C.orange},#d4694a)`,
                          boxShadow: `0 4px 14px rgba(232,137,106,0.4)`,
                          color: 'white', fontWeight: 800, fontSize: 16,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{i + 1}</div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, textAlign: 'center' }}>{s}</span>
                      </div>
                      {i < 3 && <span style={{ color: C.orange, fontSize: 20, marginTop: 12, opacity: 0.6 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 適合誰 */}
              <div style={{ ...card, padding: '24px 28px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.blue, marginBottom: 14 }}>✦ 適合誰？</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {['沒有程式基礎的設計師', '想快速實現想法的人', '想解決生活問題的人'].map((w, i) => (
                    <span key={i} style={{
                      padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                      background: C.cream, color: C.orange, border: `1.5px solid ${C.orange}`,
                    }}>{w}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ───── TAB 1 : 學員成果 ───── */}
          {tab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 3-column card grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, alignItems: 'start' }}>
                {STUDENTS.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    style={{
                      background: 'white', borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                      border: `2px solid ${expanded === i ? C.orange : 'transparent'}`,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  >
                    {/* Card header */}
                    <div style={{ padding: '24px 24px 20px' }}>
                      <span style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                        fontSize: 11, fontWeight: 700, background: C.cream, color: C.orange, marginBottom: 10,
                      }}>{s.tag}</span>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: C.blue, marginBottom: 4 }}>{s.title}</h3>
                      <p style={{ fontSize: 13, color: '#aaa' }}>{s.desc}</p>
                      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: C.orange, fontSize: 13, fontWeight: 600 }}>
                        <span>{expanded === i ? '▲ 收起' : '▼ 展開成果'}</span>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {expanded === i && (
                      <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${C.cream}` }}>
                        <div style={{
                          width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden',
                          background: '#f3f4f6', margin: '16px 0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <img
                            src={s.img} alt={s.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                            onError={e => {
                              const el = e.currentTarget
                              el.style.display = 'none'
                              const p = el.parentElement
                              if (p) p.innerHTML = `<span style="color:#ccc;font-size:12px">圖片即將放入</span>`
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: `linear-gradient(135deg,${C.orange},#d4694a)`,
                            color: 'white', fontWeight: 800, fontSize: 13,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>{s.initials}</div>
                          <span style={{ fontSize: 12, color: '#aaa' }}>{s.student}</span>
                        </div>
                        <blockquote style={{
                          margin: 0, padding: '12px 0 12px 16px',
                          borderLeft: `3px solid ${C.orange}`,
                          fontSize: 13, lineHeight: 1.9, color: '#666', fontStyle: 'italic',
                        }}>「{s.quote}」</blockquote>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───── TAB 2 : Before / After ───── */}
          {tab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28 }}>

                {/* BEFORE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#e5e7eb', borderRadius: 999, padding: '6px 16px',
                    fontSize: 12, fontWeight: 700, color: '#6b7280', alignSelf: 'flex-start',
                  }}>
                    <span style={{ fontSize: 14 }}>😐</span> BEFORE — 素人 Vibe Coding
                  </div>

                  {/* Phone mockup */}
                  <div style={{
                    background: '#1c1c1e', borderRadius: 36, padding: 12,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.25)', alignSelf: 'center', width: '100%', maxWidth: 260,
                  }}>
                    <div style={{ background: '#f3f4f6', borderRadius: 26, overflow: 'hidden', padding: '20px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🗺</div>
                      </div>
                      <h4 style={{ fontWeight: 700, textAlign: 'center', marginBottom: 16, color: '#374151', fontSize: 15 }}>旅伴揪團</h4>
                      {['東京3天4夜', '台南美食之旅', '墾丁衝浪'].map((t, i) => (
                        <div key={i} style={{
                          background: 'white', padding: '10px 12px', borderRadius: 8,
                          fontSize: 13, color: '#6b7280', marginBottom: 8, border: '1px solid #e5e7eb',
                        }}>{t}</div>
                      ))}
                      <button style={{
                        width: '100%', padding: 10, background: '#1f2937', color: 'white',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
                      }}>加入行程</button>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div style={{ ...card, padding: '20px 20px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>6 個問題</div>
                    {['白底灰框無品牌感', '資訊堆疊視覺無層次', '列表排版看不出重點', '按鈕預設黑色無情感連結', '沒有品牌名稱沒有定位語', '用戶看不懂這個產品是什麼'].map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#9ca3af', marginBottom: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: '#f87171', flexShrink: 0 }}>✕</span>{p}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AFTER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: C.cream, borderRadius: 999, padding: '6px 16px',
                    fontSize: 12, fontWeight: 700, color: C.orange, alignSelf: 'flex-start',
                    border: `1.5px solid ${C.orange}`,
                  }}>
                    <span style={{ fontSize: 14 }}>✨</span> AFTER — 設計思考 × Vibe Coding
                  </div>

                  {/* Phone mockup */}
                  <div style={{
                    background: '#1c1c1e', borderRadius: 36, padding: 12,
                    boxShadow: `0 16px 48px rgba(232,137,106,0.2)`, alignSelf: 'center', width: '100%', maxWidth: 260,
                  }}>
                    <div style={{ background: C.cream, borderRadius: 26, overflow: 'hidden', padding: '20px 16px' }}>
                      <div style={{ textAlign: 'center', marginBottom: 14 }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: C.blue }}>一起走</div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: C.orange }}>TOGETHERLY</div>
                        <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>找到同行的人，一起出發</div>
                      </div>
                      <div style={{
                        background: 'white', borderRadius: 10, padding: '8px 12px', marginBottom: 12,
                        fontSize: 12, color: '#bbb', display: 'flex', alignItems: 'center', gap: 6,
                      }}>🔍 搜尋目的地...</div>
                      {[
                        { place: '東京 × 賞楓', tag: '文化旅遊', emoji: '🏯' },
                        { place: '台南 × 美食', tag: '美食探索', emoji: '🍜' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          background: 'white', borderRadius: 10, padding: '10px 12px',
                          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: `rgba(232,137,106,0.15)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                          }}>{item.emoji}</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{item.place}</div>
                            <div style={{ fontSize: 11, color: C.orange }}>{item.tag}</div>
                          </div>
                        </div>
                      ))}
                      <button style={{
                        width: '100%', padding: 10, background: `linear-gradient(135deg,${C.orange},#d4694a)`,
                        color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', boxShadow: `0 4px 12px rgba(232,137,106,0.4)`,
                      }}>+ 發起旅程</button>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div style={{ ...card, padding: '20px 20px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>6 個優點</div>
                    {['品牌色系一致有識別感', '視覺層次清楚眼睛知道看哪裡', '卡片有圖有標籤決策更快', 'CTA按鈕有顏色引導行動', 'Logo品牌名定位語全到位', '用戶一眼就懂這是什麼產品'].map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: C.blue, marginBottom: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: C.orange, flexShrink: 0 }}>✓</span>{p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insight */}
              <div style={{
                background: `linear-gradient(135deg, ${C.blue}, #1e2547)`,
                borderRadius: 20, padding: '36px 32px', textAlign: 'center',
                boxShadow: '0 8px 32px rgba(45,53,97,0.3)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>💡</div>
                <p style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.9, fontSize: 15, margin: 0 }}>
                  兩個產品的功能完全一樣——都可以發起旅程、加入旅程。<br />
                  差別在於：有沒有先想清楚用戶的感受是什麼。<br />
                  <span style={{ fontWeight: 800, color: C.orange }}>這就是 UIUX 核心思維帶來的差距。</span>
                </p>
              </div>
            </div>
          )}

          {/* ───── TAB 3 : 現場體驗 ───── */}
          {tab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Question selector */}
              <div style={{ ...card, padding: '36px 28px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.blue, marginBottom: 8, textAlign: 'center' }}>
                  你現在最想解決生活中的哪個問題？
                </h3>
                <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 28 }}>選一個，AI 幫你想解法</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                  {QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => setAnswer(q.a)} style={{
                      padding: '14px 18px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', border: 'none', textAlign: 'left', outline: 'none',
                      transition: 'all 0.2s',
                      background: answer === q.a ? `linear-gradient(135deg,${C.orange},#d4694a)` : C.cream,
                      color: answer === q.a ? 'white' : C.blue,
                      boxShadow: answer === q.a ? `0 4px 16px rgba(232,137,106,0.4)` : 'none',
                    }}>{q.q}</button>
                  ))}
                </div>
                {answer && (
                  <div style={{
                    marginTop: 20, background: C.cream, borderRadius: 14, padding: '18px 20px',
                    borderLeft: `4px solid ${C.orange}`,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 6 }}>💡 AI 的建議</div>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: C.blue, margin: 0 }}>{answer}</p>
                  </div>
                )}
              </div>

              {/* Pomodoro timer */}
              <div style={{
                background: `linear-gradient(135deg, ${C.blue}, #1e2547)`,
                borderRadius: 20, padding: '44px 24px', textAlign: 'center',
                boxShadow: '0 8px 32px rgba(45,53,97,0.3)',
              }}>
                <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 16, letterSpacing: '0.08em' }}>
                  LIVE DEMO
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                  Vibe Coding 做出來的番茄計時器
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 40 }}>
                  學員在課堂上用 AI 對話，25 分鐘內做出這個工具。
                </p>

                {/* Timer circle */}
                <div style={{ position: 'relative', width: 196, height: 196, margin: '0 auto 36px' }}>
                  <svg width={196} height={196} style={{ position: 'absolute', top: 0, left: 0 }}>
                    <circle cx={98} cy={98} r={88} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
                    <circle
                      cx={98} cy={98} r={88} fill="none"
                      stroke={C.orange} strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - sec / (25 * 60))}`}
                      transform="rotate(-90 98 98)"
                      style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  }}>
                    <span style={{
                      fontSize: 44, fontWeight: 900, color: 'white', fontFamily: 'ui-monospace,"Courier New",monospace',
                      fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                    }}>{fmt(sec)}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: '0.1em' }}>
                      {running ? 'FOCUS' : sec === 25 * 60 ? 'READY' : 'PAUSED'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button onClick={() => setRunning(r => !r)} style={{
                    padding: '12px 32px', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    border: 'none', outline: 'none',
                    background: `linear-gradient(135deg,${C.orange},#d4694a)`,
                    color: 'white', boxShadow: `0 4px 16px rgba(232,137,106,0.5)`,
                    minWidth: 100,
                  }}>{running ? '暫停' : '開始'}</button>
                  <button onClick={resetTimer} style={{
                    padding: '12px 28px', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    border: '1.5px solid rgba(255,255,255,0.2)', outline: 'none',
                    background: 'transparent', color: 'rgba(255,255,255,0.7)',
                  }}>重設</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '32px 16px', fontSize: 12, color: '#ccc', borderTop: `1px solid rgba(0,0,0,0.05)` }}>
          UIUX × Vibe Coding 實戰課程 © 2025
        </footer>
      </div>
    </>
  )
}
