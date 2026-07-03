import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSilhouettePoints } from '@/lib/silhouetteParticles'

/**
 * Particle system that converges from scattered positions into a
 * head-and-shoulders silhouette (Act 2's "face materialisation").
 */
export default function ParticleFace({ count = 800, progress = 0 }) {
  const pointsRef = useRef()

  const { scattered, target } = useMemo(() => {
    const scatteredArr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 2.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      scatteredArr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      scatteredArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      scatteredArr[i * 3 + 2] = r * Math.cos(phi) - 1.5
    }
    return { scattered: scatteredArr, target: getSilhouettePoints(count) }
  }, [count])

  const positions = useMemo(() => new Float32Array(scattered), [scattered])

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const ember = new THREE.Color('#FF6B35')
    const violet = new THREE.Color('#8B5CF6')
    for (let i = 0; i < count; i++) {
      const c = ember.clone().lerp(violet, Math.random() * 0.6)
      arr[i * 3] = c.r
      arr[i * 3 + 1] = c.g
      arr[i * 3 + 2] = c.b
    }
    return arr
  }, [count])

  const progressRef = useRef(0)
  useEffect(() => {
    progressRef.current = 0
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    // Exponential smoothing scaled by delta (not a flat per-frame factor)
    // so convergence takes the same wall-clock time regardless of frame
    // rate — a flat factor made low/uneven frame rates visibly slower or
    // juddery, since it was really a per-frame catch-up, not a per-second one.
    progressRef.current += (progress - progressRef.current) * (1 - Math.exp(-3.7 * delta))
    const p = progressRef.current
    const array = pointsRef.current.geometry.attributes.position.array
    const ease = p * p * (3 - 2 * p) // smoothstep
    for (let i = 0; i < count; i++) {
      array[i * 3] = THREE.MathUtils.lerp(scattered[i * 3], target[i * 3], ease)
      array[i * 3 + 1] = THREE.MathUtils.lerp(scattered[i * 3 + 1], target[i * 3 + 1], ease)
      array[i * 3 + 2] = THREE.MathUtils.lerp(scattered[i * 3 + 2], target[i * 3 + 2], ease)
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
