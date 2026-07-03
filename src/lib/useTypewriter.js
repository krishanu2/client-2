import { useEffect, useState, useRef } from 'react'

/**
 * Reveals `text` one character at a time starting after `startDelay` ms.
 * Calls onDone once fully revealed. If `instant` is true (reduced-motion
 * preference), the full text appears immediately with no per-character delay.
 * Per-character timing has small random variance (±`jitter` ms) — a
 * perfectly constant interval reads as mechanical; real typing doesn't
 * land on exact multiples of one speed.
 */
export default function useTypewriter(
  text,
  { startDelay = 0, speed = 45, jitter = 8, instant = false, onDone } = {}
) {
  const [revealed, setRevealed] = useState(instant ? text : '')
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (instant) {
      setRevealed(text)
      onDoneRef.current?.()
      return undefined
    }

    setRevealed('')
    let i = 0
    let timeoutId

    const step = () => {
      i += 1
      setRevealed(text.slice(0, i))
      if (i >= text.length) {
        onDoneRef.current?.()
        return
      }
      const delay = speed + (Math.random() * 2 - 1) * jitter
      timeoutId = setTimeout(step, Math.max(10, delay))
    }

    const startId = setTimeout(step, startDelay)

    return () => {
      clearTimeout(startId)
      clearTimeout(timeoutId)
    }
  }, [text, startDelay, speed, jitter, instant])

  return revealed
}
