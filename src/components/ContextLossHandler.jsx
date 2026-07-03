import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Mount inside any <Canvas> to recover gracefully from a lost WebGL
 * context instead of staying permanently blank. By spec, a lost context
 * is only eligible for browser-driven restoration if the page calls
 * preventDefault() in the 'webglcontextlost' handler — without that, nothing
 * ever renders again until the page reloads.
 */
export default function ContextLossHandler() {
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const canvas = gl.domElement

    const handleLost = (event) => {
      event.preventDefault()
    }
    const handleRestored = () => {
      invalidate()
    }

    canvas.addEventListener('webglcontextlost', handleLost, false)
    canvas.addEventListener('webglcontextrestored', handleRestored, false)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost)
      canvas.removeEventListener('webglcontextrestored', handleRestored)
    }
  }, [gl, invalidate])

  return null
}
