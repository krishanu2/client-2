/**
 * Small Web Audio synthesizer for THE BECOMING's sound design — a low
 * ambient drone, a shatter impact, an anticipation riser, short UI micro-
 * sounds, and scroll-tied drone modulation. Fully synthesized (no audio
 * files to source/license). The AudioContext is only created on enable(),
 * which is always called from a real click (the sound toggle), satisfying
 * browser autoplay-gesture requirements.
 */

let ctx = null
let masterBus = null
let droneNodes = null
let enabled = false

function ensureContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (!masterBus) {
    // Everything routes through one compressor so layering UI ticks on
    // top of the drone doesn't clip.
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -24
    compressor.knee.value = 18
    compressor.ratio.value = 4
    compressor.attack.value = 0.01
    compressor.release.value = 0.25
    compressor.connect(ctx.destination)
    masterBus = compressor
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function startDrone() {
  if (droneNodes || !ctx) return

  const master = ctx.createGain()
  master.gain.value = 0.05
  master.connect(masterBus)

  const osc1 = ctx.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = 58

  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 87

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 220

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.02
  lfo.connect(lfoGain)
  lfoGain.connect(master.gain)

  osc1.connect(filter)
  osc2.connect(filter)
  filter.connect(master)

  osc1.start()
  osc2.start()
  lfo.start()

  droneNodes = { master, osc1, osc2, filter, lfo, baseGain: 0.05, baseCutoff: 220 }
}

function stopDrone() {
  if (!droneNodes) return
  const { master, osc1, osc2, lfo } = droneNodes
  const now = ctx.currentTime
  master.gain.setTargetAtTime(0, now, 0.3)
  ;[osc1, osc2, lfo].forEach((node) => node.stop(now + 1))
  droneNodes = null
}

export function enableSound() {
  enabled = true
  ensureContext()
  startDrone()
}

export function disableSound() {
  enabled = false
  stopDrone()
}

export function isSoundEnabled() {
  return enabled
}

/**
 * Feed a 0-1 progress value (e.g. overall page scroll fraction) in to
 * brighten the drone as the visitor approaches Act 6 — the "sonic
 * peak-end." Cheap: just retargets two existing params, no new nodes.
 */
export function setDroneIntensity(progress) {
  if (!droneNodes || !ctx) return
  const p = Math.min(Math.max(progress, 0), 1)
  const now = ctx.currentTime
  droneNodes.filter.frequency.setTargetAtTime(droneNodes.baseCutoff + p * 380, now, 0.4)
  droneNodes.master.gain.setTargetAtTime(droneNodes.baseGain + p * 0.035, now, 0.4)
}

/** A short, deep impact — noise burst + sub thump — for Act 2's shatter beat. */
export function playShatterImpact() {
  if (!enabled || !ctx) return
  const now = ctx.currentTime

  const bufferSize = ctx.sampleRate * 0.4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.setValueAtTime(1800, now)
  noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.35)
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.35, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(masterBus)

  const thump = ctx.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(80, now)
  thump.frequency.exponentialRampToValueAtTime(35, now + 0.3)
  const thumpGain = ctx.createGain()
  thumpGain.gain.setValueAtTime(0.6, now)
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

  thump.connect(thumpGain)
  thumpGain.connect(masterBus)

  noise.start(now)
  thump.start(now)
  thump.stop(now + 0.6)
}

/**
 * Filtered-noise sweep that rises in pitch/gain, meant to run under the
 * "jitter" beat right before the shatter — tension building toward the
 * existing impact rather than the shatter arriving with no lead-in.
 */
export function playAnticipationRiser(durationSec = 0.6) {
  if (!enabled || !ctx) return
  const now = ctx.currentTime

  const bufferSize = Math.floor(ctx.sampleRate * durationSec)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 0.8
  filter.frequency.setValueAtTime(300, now)
  filter.frequency.exponentialRampToValueAtTime(2600, now + durationSec)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.22, now + durationSec * 0.85)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(masterBus)

  noise.start(now)
  noise.stop(now + durationSec)
}

const TICK_PRESETS = {
  hover: { freq: 900, duration: 0.05, gain: 0.05 },
  click: { freq: 620, duration: 0.09, gain: 0.09 },
  flip: { freq: 480, duration: 0.14, gain: 0.08 },
  confirm: { freq: 740, duration: 0.22, gain: 0.11, chord: [740, 990] },
}

/** Short synthesized envelope blip for UI feedback (hover/click/flip/confirm). */
export function playUITick(type = 'hover') {
  if (!enabled || !ctx) return
  const preset = TICK_PRESETS[type] ?? TICK_PRESETS.hover
  const now = ctx.currentTime
  const freqs = preset.chord ?? [preset.freq]

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(preset.gain / freqs.length, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration)
    osc.connect(gain)
    gain.connect(masterBus)
    const start = now + i * 0.03
    osc.start(start)
    osc.stop(start + preset.duration + 0.02)
  })
}
