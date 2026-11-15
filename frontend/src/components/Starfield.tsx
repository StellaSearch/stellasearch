import { useEffect, useRef } from 'react'

type Star = { x: number; y: number; r: number; tw: number; ph: number; depth: number }
type Shot = { x: number; y: number; vx: number; vy: number; life: number }

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    let mx = 0
    let my = 0
    let px = 0
    let py = 0
    let stars: Star[] = []
    let shot: Shot | null = null
    let nextShot = performance.now() + 4000

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      cv.width = w * dpr
      cv.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round((w * h) / 9000)
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.3,
        tw: Math.random() * 1.5 + 0.5,
        ph: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.9 + 0.1,
      }))
      if (reduce) draw(performance.now())
    }

    const wrap = (v: number, max: number) => ((v % max) + max) % max

    function draw(now: number) {
      ctx!.clearRect(0, 0, w, h)
      px += (mx - px) * 0.05
      py += (my - py) * 0.05
      const t = now / 1000

      for (const s of stars) {
        const a = reduce ? 0.7 : 0.35 + 0.65 * Math.sin(t * s.tw + s.ph) ** 2
        const x = wrap(s.x + px * 14 * s.depth, w)
        const y = wrap(s.y + py * 14 * s.depth, h)
        ctx!.globalAlpha = a
        ctx!.fillStyle = '#fff'
        ctx!.beginPath()
        ctx!.arc(x, y, s.r, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1

      if (!reduce) {
        if (!shot && now > nextShot) {
          shot = {
            x: Math.random() * w * 0.7,
            y: Math.random() * h * 0.4,
            vx: 7 + Math.random() * 4,
            vy: 3 + Math.random() * 2,
            life: 1,
          }
          nextShot = now + 6000 + Math.random() * 9000
        }
        if (shot) {
          const g = ctx!.createLinearGradient(
            shot.x, shot.y, shot.x - shot.vx * 9, shot.y - shot.vy * 9,
          )
          g.addColorStop(0, `rgba(255,255,255,${shot.life})`)
          g.addColorStop(1, 'rgba(255,255,255,0)')
          ctx!.strokeStyle = g
          ctx!.lineWidth = 1.5
          ctx!.beginPath()
          ctx!.moveTo(shot.x, shot.y)
          ctx!.lineTo(shot.x - shot.vx * 9, shot.y - shot.vy * 9)
          ctx!.stroke()
          shot.x += shot.vx
          shot.y += shot.vy
          shot.life -= 0.018
          if (shot.life <= 0 || shot.x > w + 50 || shot.y > h + 50) shot = null
        }
      }
    }

    const loop = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (!reduce && !raf) raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const onVis = () => (document.hidden ? stop() : start())
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / w - 0.5
      my = e.clientY / h - 0.5
    }

    resize()
    start()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
