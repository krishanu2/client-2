import { useRef, useMemo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VERTEX = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    vPos = position;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Voronoi cell edges glowing ember orange through a dark stone base —
// the "cracked stone sphere" hero object (PRD section 5).
const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec3 vPos;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uPulse;

  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Returns (distance to nearest feature point, distance to second nearest)
  vec2 voronoi(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    float d1 = 8.0;
    float d2 = 8.0;
    for (int k = -1; k <= 1; k++) {
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec3 cell = vec3(float(i), float(j), float(k));
          vec3 point = cell + hash3(p + cell) * 0.5 - 0.25;
          float d = length(f - point);
          if (d < d1) { d2 = d1; d1 = d; }
          else if (d < d2) { d2 = d; }
        }
      }
    }
    return vec2(d1, d2);
  }

  void main() {
    vec3 stoneDark = vec3(0.03, 0.03, 0.075);
    vec3 stoneLight = vec3(0.145, 0.145, 0.176);
    vec3 ember = vec3(1.0, 0.42, 0.208);

    vec2 v = voronoi(vPos * 3.4);
    float edge = smoothstep(0.02, 0.09, v.y - v.x);

    float lighting = clamp(dot(normalize(vNormal), normalize(vec3(0.4, 0.6, 0.9))), 0.0, 1.0);
    vec3 base = mix(stoneDark, stoneLight, lighting * 0.6 + 0.1);

    float pulse = 0.55 + 0.45 * sin(uTime * 1.8) * uPulse;
    float glow = (1.0 - edge) * pulse;

    vec3 color = mix(ember * glow * 1.6, base, edge);
    color += ember * (1.0 - edge) * 0.3;

    gl_FragColor = vec4(color, uOpacity);
  }
`

/**
 * The cracked stone sphere — hero 3D object of Act 1, also reused as the
 * per-fragment material in Act 2's shatter. Ref exposes the underlying
 * mesh so parent components can drive position/rotation/jitter directly.
 */
const CrackedSphere = forwardRef(function CrackedSphere(
  { size = 1.4, opacity = 1, pulse = 1, autoRotate = true, detail = 3, geometryArgs },
  ref
) {
  const materialRef = useRef()
  const groupRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uPulse: { value: pulse },
    }),
    []
  )

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value,
        opacity,
        0.08
      )
    }
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
      groupRef.current.rotation.x += delta * 0.03
    }
  })

  return (
    <group ref={(node) => {
      groupRef.current = node
      if (ref) ref.current = node
    }}>
      <mesh>
        <icosahedronGeometry args={geometryArgs ?? [size, detail]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          uniforms={uniforms}
          transparent
        />
      </mesh>
    </group>
  )
})

export default CrackedSphere
