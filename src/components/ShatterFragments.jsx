import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MAX_START_DELAY = 0.08

/**
 * Lightweight stand-in for the PRD's Cannon.js rigid-body shatter: each
 * fragment gets a random outward direction/spin and is animated by hand
 * via useFrame rather than a full physics simulation. Visually equivalent
 * for a one-shot explode-and-fade, far cheaper on mobile.
 */
export default function ShatterFragments({ count = 60, radius = 1.4, active, jitter, onFinished }) {
  const groupRef = useRef()
  const startedAt = useRef(null)
  const finishedRef = useRef(false)

  const fragments = useMemo(() => {
    return Array.from({ length: count }, () => {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5 + 0.4
      ).normalize()
      return {
        dir,
        spin: new THREE.Vector3(
          Math.random() * 4 - 2,
          Math.random() * 4 - 2,
          Math.random() * 4 - 2
        ),
        origin: dir.clone().multiplyScalar(radius),
        scale: (0.08 + Math.random() * 0.16) * (radius / 1.4),
        colorEmber: Math.random() > 0.4,
        jitterPhase: Math.random() * Math.PI * 2,
        // Staggered per-fragment start so the shatter reads as a physical
        // cascade rather than every fragment popping in the same instant.
        startDelay: Math.random() * MAX_START_DELAY,
      }
    })
  }, [count, radius])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    if (jitter) {
      groupRef.current.children.forEach((mesh, i) => {
        const f = fragments[i]
        mesh.position.copy(f.origin)
        // Smooth band-limited noise (summed sines, per-fragment phase)
        // instead of a fresh Math.random() offset every frame — the old
        // version was indistinguishable from real stutter; this reads as
        // a tension-building tremor instead.
        mesh.position.x +=
          (Math.sin(time * 9 + f.jitterPhase) + Math.sin(time * 13.7 + f.jitterPhase * 1.3) * 0.5) * 0.012
        mesh.position.y +=
          (Math.sin(time * 10.5 + f.jitterPhase * 0.8) + Math.sin(time * 15 + f.jitterPhase * 1.7) * 0.5) * 0.012
      })
      return
    }

    if (!active) return
    if (startedAt.current === null) startedAt.current = time

    const elapsed = time - startedAt.current
    const duration = 1.4

    groupRef.current.children.forEach((mesh, i) => {
      const f = fragments[i]
      const t = Math.max(0, elapsed - f.startDelay)
      const travel = Math.min(t / duration, 1)
      const eased = 1 - Math.pow(1 - travel, 3)
      const distance = eased * 6
      mesh.position.copy(f.origin).addScaledVector(f.dir, distance)
      mesh.rotation.x += f.spin.x * delta
      mesh.rotation.y += f.spin.y * delta
      mesh.rotation.z += f.spin.z * delta
      mesh.material.opacity = 1 - travel
    })

    if (elapsed >= duration + MAX_START_DELAY && !finishedRef.current) {
      finishedRef.current = true
      onFinished?.()
    }
  })

  return (
    <group ref={groupRef}>
      {fragments.map((f, i) => (
        <mesh key={i} position={f.origin} scale={f.scale}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={f.colorEmber ? '#FF6B35' : '#3A3A4A'}
            emissive={f.colorEmber ? '#FF6B35' : '#000000'}
            emissiveIntensity={f.colorEmber ? 0.8 : 0}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  )
}
