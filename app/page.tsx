'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
}

const PARTICLE_COLORS = ['#E8896A', '#2D3561']
const PARTICLE_COUNT = 80
const REPEL_DIST = 120
const CONNECT_DIST = 150

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)

  const [activeTab, setActiveTab] = useState(0)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Canvas particle effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 3,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 2 + Math.random() * 2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * 2)],
      alpha: 0.3 + Math.random() * 0.2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current
      const mouse = mouseRef.current
      const scrollY = window.scrollY

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse repulsion (mouse.y is viewport-relative, particles are document-relative)
        const dx = p.x - mouse.x
        const dy = p.y - (mouse.y + scrollY)
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_DIST && dist > 0) {
          const force = ((REPEL_DIST - dist) / REPEL_DIST) * 0.6
          p.x += (dx / dist) * force
          p.y += (dy / dist) * force
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) { p.x = 0; p.vx *= -1 }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1 }
        if (p.y < 0) { p.y = 0; p.vy *= -1 }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1 }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Connection lines only near cursor
        const mouseDocY = mouse.y + scrollY
        const mouseDist = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouseDocY) ** 2)
        if (mouseDist < CONNECT_DIST) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]
            const mouse2Dist = Math.sqrt((p2.x - mouse.x) ** 2 + (p2.y - mouseDocY) ** 2)
            if (mouse2Dist < CONNECT_DIST) {
              const ddx = p.x - p2.x
              const ddy = p.y - p2.y
              if (Math.sqrt(ddx * ddx + ddy * ddy) < CONNECT_DIST) {
                ctx.beginPath()
                ctx.moveTo(p.x, p.y)
                ctx.lineTo(p2.x, p2.y)
                ctx.strokeStyle = p.color
                ctx.globalAlpha = 0.15
                ctx.lineWidth = 1
                ctx.stroke()
              }
            }
          }
        }
      }

      ctx.globalAlpha = 1
      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // Pomodoro timer
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            setTimerRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [timerRunning])

  const resetTimer = useCallback(() => {
    setTimerRunning(false)
    setTimerSeconds(25 * 60)
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const tabs = ['什麼是 Vibe Coding？', '學員成果', 'Before / After', '現場體驗']

  const students = [
    {
      tag: '行政 → 產品設計',
      title: '旅伴揪團 App',
      desc: '快速發起行程、媒合想一起出遊的旅伴',
      img: '/students/togetherly.png',
      student: '林同學，行政助理5年，希望培養第二專長',
      quote: '原本以為自己完全不懂設計，沒想到透過課程一步一步拆解需求，最後真的把想法做成作品。最大的收穫是開始知道怎麼用設計解決問題，而不是只把畫面做漂亮。',
      initials: '林',
    },
    {
      tag: 'UI設計師 → 產品思維',
      title: '寵物健康管理平台',
      desc: '記錄毛小孩疫苗、看診與健康資訊',
      img: '/students/petcare.png',
      student: '陳同學，UI設計師3年，希望提升產品思維',
      quote: '以前做設計比較專注在畫面細節，這次從使用者需求開始思考，才發現產品規劃其實比畫圖更重要。現在提案時也更有邏輯了。',
      initials: '陳',
    },
    {
      tag: '餐飲店長 → 科技轉職',
      title: '排隊點餐系統',
      desc: '線上取號、查看等候進度，告別混亂',
      img: '/students/queue.png',
      student: '王同學，餐飲業店長，希望轉職進入科技業',
      quote: '以前覺得科技業離我很遠，但透過實際做出作品集，才發現自己的工作經驗也能轉化成產品想法。完成作品後對轉職更有信心了。',
      initials: '王',
    },
  ]

  const questions = [
    { q: '每天重複做一樣的事', a: '做一個自動化小工具，把你每天重複做的事，變成一個按鈕就搞定。' },
    { q: '記帳太麻煩總是忘記', a: '做一個語音記帳 App，說出花了多少，AI 幫你自動分類存起來。' },
    { q: '找不到適合的團體工具', a: '做一個小型協作平台，專為你的團隊設計，只有你們需要的功能。' },
    { q: '有很多想法卻沒地方記', a: '做一個靈感收集盒，隨時記錄想法，AI 幫你整理成可執行的計畫。' },
  ]

  return (
    <>
      {/* Particle canvas — fixed, behind all content */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Page wrapper */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', backgroundColor: '#FDF0E8' }}>

        {/* ── Hero ── */}
        <section style={{ padding: '64px 20px 48px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 20px',
            borderRadius: '999px',
            backgroundColor: '#E8896A',
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '24px',
            letterSpacing: '0.04em',
          }}>
            UIUX × Vibe Coding 實戰課程
          </span>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.3,
            color: '#2D3561',
            marginBottom: '20px',
          }}>
            提出好問題，<br />永遠比給出答案更有強度。
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: 1.9,
            color: '#777',
            maxWidth: '560px',
            margin: '0 auto 40px',
          }}>
            先學會思考，再善用工具。把想法化為有價值的產品，幫助更多人，創造更多影響力。
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '16px',
            maxWidth: '680px',
            margin: '0 auto',
          }}>
            {[
              { num: '3+', label: '真實學員案例' },
              { num: '100%', label: '從0完成產品' },
              { num: '0', label: '需要寫程式' },
              { num: '48h', label: '課程時數' },
            ].map((s, i) => (
              <div key={i} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px 12px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: '34px', fontWeight: 800, color: '#E8896A' }}>{s.num}</div>
                <div style={{ fontSize: '13px', color: '#2D3561', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tab Nav ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'rgba(253,240,232,0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(232,137,106,0.15)',
          padding: '12px 20px',
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none' as const,
          }}>
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '9px 20px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeTab === i ? 'none' : '1.5px solid #E8896A',
                  backgroundColor: activeTab === i ? '#E8896A' : 'white',
                  color: activeTab === i ? 'white' : '#2D3561',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 60px' }}>

          {/* Tab 0: 什麼是 Vibe Coding？ */}
          {activeTab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>💬</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2D3561', marginBottom: '10px' }}>你不需要會寫程式</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#777' }}>
                    Vibe Coding 是用自然語言和 AI 對話，讓 AI 幫你寫程式、做出工具或網站的方式。
                  </p>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎯</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2D3561', marginBottom: '10px' }}>你專注在想解決什麼問題</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#777' }}>
                    AI 幫你處理怎麼做出來。就像有一位很厲害的 AI 工程師助手。
                  </p>
                </div>
              </div>

              <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div style={{ backgroundColor: '#f3f4f6', padding: '28px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#9ca3af', marginBottom: '16px' }}>傳統寫程式</h3>
                    {['學語言', '寫程式碼', '測試除錯', '花很多時間還不一定做得出來'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#9ca3af', marginBottom: '10px' }}>
                        <span style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }}>✕</span>{item}
                      </div>
                    ))}
                  </div>
                  <div style={{ backgroundColor: '#FDF0E8', padding: '28px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#E8896A', marginBottom: '16px' }}>Vibe Coding</h3>
                    {['用說的像聊天一樣', 'AI 幫你寫程式', '快速看到成果', '持續優化越來越好用'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#2D3561', marginBottom: '10px' }}>
                        <span style={{ color: '#E8896A', flexShrink: 0, marginTop: '2px' }}>✓</span>{item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#2D3561', marginBottom: '24px', textAlign: 'center' }}>
                  四步驟，從想法到成果
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {['你有想法', '告訴AI需求', 'AI幫你寫', '得到成果'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          backgroundColor: '#E8896A', color: 'white',
                          fontWeight: 700, fontSize: '15px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{i + 1}</div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#2D3561', whiteSpace: 'nowrap' }}>{step}</span>
                      </div>
                      {i < 3 && <span style={{ color: '#E8896A', fontSize: '18px', marginBottom: '18px' }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#2D3561', marginBottom: '16px' }}>適合誰？</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['沒有程式基礎的設計師', '想快速實現想法的人', '想解決生活問題的人'].map((who, i) => (
                    <span key={i} style={{
                      padding: '8px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                      backgroundColor: '#FDF0E8', color: '#E8896A', border: '1.5px solid #E8896A',
                    }}>{who}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: 學員成果 */}
          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {students.map((s, i) => (
                <div key={i} style={{
                  backgroundColor: 'white', borderRadius: '20px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                    style={{
                      width: '100%', padding: '24px',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
                      cursor: 'pointer', backgroundColor: 'transparent', border: 'none', textAlign: 'left',
                    }}
                  >
                    <div>
                      <span style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: '999px',
                        fontSize: '12px', fontWeight: 600, backgroundColor: '#FDF0E8', color: '#E8896A', marginBottom: '8px',
                      }}>{s.tag}</span>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2D3561', marginBottom: '4px' }}>{s.title}</h3>
                      <p style={{ fontSize: '13px', color: '#aaa' }}>{s.desc}</p>
                    </div>
                    <span style={{
                      fontSize: '22px', color: '#E8896A',
                      transform: expandedCard === i ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s', marginTop: '6px', flexShrink: 0,
                    }}>▾</span>
                  </button>

                  {expandedCard === i && (
                    <div style={{ padding: '0 24px 24px' }}>
                      <div style={{
                        width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden',
                        backgroundColor: '#f3f4f6', marginBottom: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img
                          src={s.img}
                          alt={s.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            const el = e.currentTarget
                            el.style.display = 'none'
                            const parent = el.parentElement
                            if (parent) parent.innerHTML = `<span style="color:#ccc;font-size:13px">圖片即將放入</span>`
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          backgroundColor: '#E8896A', color: 'white',
                          fontWeight: 700, fontSize: '14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{s.initials}</div>
                        <span style={{ fontSize: '13px', color: '#999' }}>{s.student}</span>
                      </div>
                      <blockquote style={{
                        fontSize: '14px', lineHeight: 1.9, color: '#555',
                        borderLeft: '3px solid #E8896A', paddingLeft: '16px', margin: 0,
                      }}>
                        「{s.quote}」
                      </blockquote>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Before / After */}
          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

                {/* Before */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span style={{
                    display: 'inline-block', padding: '5px 14px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: 700, backgroundColor: '#e5e7eb', color: '#6b7280', alignSelf: 'flex-start',
                  }}>BEFORE — 素人 Vibe Coding</span>

                  <div style={{
                    backgroundColor: 'white', borderRadius: '24px', padding: '20px',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1.5px solid #e5e7eb',
                  }}>
                    <div style={{
                      backgroundColor: '#f3f4f6', borderRadius: '16px', padding: '20px 16px',
                      maxWidth: '240px', margin: '0 auto',
                    }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#d1d5db', margin: '0 auto 16px' }}></div>
                      <h4 style={{ fontWeight: 700, textAlign: 'center', marginBottom: '16px', color: '#374151', fontSize: '15px' }}>旅伴揪團</h4>
                      {['東京3天4夜', '台南美食之旅', '墾丁衝浪'].map((item, i) => (
                        <div key={i} style={{
                          backgroundColor: 'white', padding: '10px 12px', borderRadius: '8px',
                          fontSize: '13px', color: '#6b7280', marginBottom: '8px',
                        }}>{item}</div>
                      ))}
                      <button style={{
                        width: '100%', padding: '10px', backgroundColor: '#1f2937',
                        color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                      }}>加入行程</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['白底灰框無品牌感', '資訊堆疊視覺無層次', '列表排版看不出重點', '按鈕預設黑色無情感連結', '沒有品牌名稱沒有定位語', '用戶看不懂這個產品是什麼感覺'].map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                        <span style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }}>✕</span>{p}
                      </div>
                    ))}
                  </div>
                </div>

                {/* After */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span style={{
                    display: 'inline-block', padding: '5px 14px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: 700, backgroundColor: '#FDF0E8', color: '#E8896A', alignSelf: 'flex-start',
                  }}>AFTER — 設計思考 × Vibe Coding</span>

                  <div style={{
                    backgroundColor: 'white', borderRadius: '24px', padding: '20px',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1.5px solid #E8896A',
                  }}>
                    <div style={{
                      backgroundColor: '#FDF0E8', borderRadius: '16px', padding: '20px 16px',
                      maxWidth: '240px', margin: '0 auto',
                    }}>
                      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#2D3561' }}>一起走</div>
                        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: '#E8896A' }}>TOGETHERLY</div>
                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>找到同行的人，一起出發</div>
                      </div>
                      <div style={{
                        backgroundColor: 'white', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px',
                        fontSize: '12px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <span>🔍</span> 搜尋目的地...
                      </div>
                      {[
                        { place: '東京 × 賞楓', tag: '文化旅遊' },
                        { place: '台南 × 美食', tag: '美食探索' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          backgroundColor: 'white', borderRadius: '10px', padding: '10px',
                          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
                        }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(232,137,106,0.25)', flexShrink: 0 }}></div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#2D3561' }}>{item.place}</div>
                            <div style={{ fontSize: '11px', color: '#E8896A' }}>{item.tag}</div>
                          </div>
                        </div>
                      ))}
                      <button style={{
                        width: '100%', padding: '10px', backgroundColor: '#E8896A',
                        color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      }}>+ 發起旅程</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['品牌色系一致有識別感', '視覺層次清楚眼睛知道看哪裡', '卡片有圖有標籤決策更快', 'CTA按鈕有顏色引導行動', 'Logo品牌名定位語全到位', '用戶一眼就懂這是什麼產品'].map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#2D3561' }}>
                        <span style={{ color: '#E8896A', flexShrink: 0, marginTop: '2px' }}>✓</span>{p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insight block */}
              <div style={{ backgroundColor: '#2D3561', borderRadius: '20px', padding: '32px 28px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.9, fontSize: '15px' }}>
                  兩個產品的功能完全一樣——都可以發起旅程、加入旅程。<br />
                  差別在於：有沒有先想清楚用戶的感受是什麼。<br />
                  <span style={{ fontWeight: 800, color: '#E8896A' }}>這就是 UIUX 核心思維帶來的差距。</span>
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: 現場體驗 */}
          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Question selector */}
              <div style={{
                backgroundColor: 'white', borderRadius: '20px', padding: '32px 24px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#2D3561', marginBottom: '24px', textAlign: 'center' }}>
                  你現在最想解決生活中的哪個問題？
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAnswer(q.a)}
                      style={{
                        padding: '14px 16px', borderRadius: '14px',
                        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                        border: 'none', textAlign: 'left', transition: 'all 0.2s', outline: 'none',
                        backgroundColor: selectedAnswer === q.a ? '#E8896A' : '#FDF0E8',
                        color: selectedAnswer === q.a ? 'white' : '#2D3561',
                      }}
                    >
                      {q.q}
                    </button>
                  ))}
                </div>

                {selectedAnswer && (
                  <div style={{
                    marginTop: '20px', backgroundColor: '#FDF0E8',
                    borderRadius: '14px', padding: '18px 20px',
                  }}>
                    <p style={{ fontSize: '14px', lineHeight: 1.9, color: '#2D3561' }}>
                      <span style={{ fontWeight: 700, color: '#E8896A' }}>💡 AI 的建議：</span>
                      <br />{selectedAnswer}
                    </p>
                  </div>
                )}
              </div>

              {/* Pomodoro timer */}
              <div style={{
                backgroundColor: '#2D3561', borderRadius: '20px', padding: '40px 24px', textAlign: 'center',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                  現場示範：Vibe Coding 做出來的番茄計時器
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px' }}>
                  學員在課堂上用 AI 對話，25 分鐘內做出這個工具。
                </p>

                <div style={{
                  width: '180px', height: '180px', borderRadius: '50%',
                  border: '4px solid #E8896A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 32px',
                  boxShadow: '0 0 40px rgba(232,137,106,0.2)',
                }}>
                  <span style={{
                    fontSize: '44px', fontWeight: 800, color: 'white',
                    fontFamily: 'ui-monospace, "Courier New", monospace',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {formatTime(timerSeconds)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setTimerRunning(r => !r)}
                    style={{
                      padding: '12px 28px', borderRadius: '999px',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      border: 'none', backgroundColor: '#E8896A', color: 'white', outline: 'none',
                    }}
                  >
                    {timerRunning ? '暫停' : '開始'}
                  </button>
                  <button
                    onClick={resetTimer}
                    style={{
                      padding: '12px 28px', borderRadius: '999px',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      border: 'none', backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', outline: 'none',
                    }}
                  >
                    重設
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '32px 16px', fontSize: '12px', color: '#ccc' }}>
          UIUX × Vibe Coding 實戰課程 © 2025
        </footer>
      </div>
    </>
  )
}
