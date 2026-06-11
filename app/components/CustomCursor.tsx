'use client'
import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
    }
    window.addEventListener('mousemove', move, { passive: true })

    let raf: number
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`
      }
      raf = requestAnimationFrame(animate)
    }
    animate()

    const onDown = () => {
      if (dotRef.current) dotRef.current.style.transform += ' scale(0.6)'
      if (ringRef.current) { ringRef.current.style.width = '48px'; ringRef.current.style.height = '48px' }
    }
    const onUp = () => {
      if (ringRef.current) { ringRef.current.style.width = '36px'; ringRef.current.style.height = '36px' }
    }

    const onEnterLink = () => {
      if (dotRef.current) { dotRef.current.style.width = '12px'; dotRef.current.style.height = '12px'; dotRef.current.style.background = '#E8896A' }
      if (ringRef.current) { ringRef.current.style.width = '52px'; ringRef.current.style.height = '52px'; ringRef.current.style.borderColor = '#E8896A' }
    }
    const onLeaveLink = () => {
      if (dotRef.current) { dotRef.current.style.width = '6px'; dotRef.current.style.height = '6px'; dotRef.current.style.background = '#2D3561' }
      if (ringRef.current) { ringRef.current.style.width = '36px'; ringRef.current.style.height = '36px'; ringRef.current.style.borderColor = '#E8896A' }
    }

    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onEnterLink)
      el.addEventListener('mouseleave', onLeaveLink)
    })

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none',
        width: '6px', height: '6px', borderRadius: '50%', background: '#2D3561',
        transform: 'translate(-100px,-100px)',
        marginLeft: '-3px', marginTop: '-3px',
        transition: 'width 0.15s, height 0.15s, background 0.15s',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99998, pointerEvents: 'none',
        width: '36px', height: '36px', borderRadius: '50%',
        border: '1.5px solid #E8896A',
        transform: 'translate(-100px,-100px)',
        marginLeft: '-18px', marginTop: '-18px',
        transition: 'width 0.2s, height 0.2s, border-color 0.2s',
      }} />
    </>
  )
}
