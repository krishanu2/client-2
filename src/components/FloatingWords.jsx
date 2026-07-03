import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { MathUtils } from 'three'

const WORDS = [
  { key: 'body', label: 'BODY.', position: [-2.4, 0.6, 0], floatSpeed: 0.9 },
  { key: 'mind', label: 'MIND.', position: [0, -0.3, -1], floatSpeed: 0.7 },
  { key: 'soul', label: 'SOUL.', position: [2.3, 0.4, -2], floatSpeed: 1.1 },
]

function FloatingWord({ word, mouse, flyingWord, onSelect }) {
  const ref = useRef()
  const isFlying = flyingWord === word.key
  const isOther = flyingWord && flyingWord !== word.key

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime

    if (isFlying) {
      ref.current.position.z = MathUtils.lerp(ref.current.position.z, 4, 0.08)
      ref.current.scale.setScalar(MathUtils.lerp(ref.current.scale.x, 2.4, 0.08))
      ref.current.fillOpacity = MathUtils.lerp(ref.current.fillOpacity ?? 1, 0, 0.05)
      return
    }

    const targetOpacity = isOther ? 0 : 1
    ref.current.fillOpacity = MathUtils.lerp(ref.current.fillOpacity ?? 1, targetOpacity, 0.08)

    ref.current.position.y = word.position[1] + Math.sin(t * word.floatSpeed) * 0.18
    ref.current.position.x =
      word.position[0] + (mouse.current.x * 0.4 * (word.position[2] + 3)) / 3
    ref.current.position.z = word.position[2] + mouse.current.y * 0.2
  })

  return (
    <Text
      ref={ref}
      position={word.position}
      fontSize={0.9}
      color="#FF6B35"
      anchorX="center"
      anchorY="middle"
      onClick={(e) => {
        e.stopPropagation()
        if (!flyingWord) onSelect(word.key)
      }}
    >
      {word.label}
    </Text>
  )
}

/**
 * The three floating BODY / MIND / SOUL 3D words (Act 3, desktop). Mouse
 * position drives a slight parallax; clicking a word "flies" it toward the
 * camera before the parent mounts the corresponding full-screen panel.
 */
export default function FloatingWords({ mouse, flyingWord, onSelect }) {
  return (
    <group>
      {WORDS.map((word) => (
        <FloatingWord
          key={word.key}
          word={word}
          mouse={mouse}
          flyingWord={flyingWord}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
