/**
 * Timer Audio Utility
 * Web Audio API beep generation for circuit timer countdown alerts
 */

let audioContext = null

/**
 * Sound preset definitions for different beep types
 * Each preset defines oscillator parameters for a distinct sound
 */
export const SOUND_PRESETS = {
  classic: {
    name: 'Classic Beep',
    type: 'sine',
    frequency: 800,
    duration: 0.15
  },
  high: {
    name: 'High Tone',
    type: 'sine',
    frequency: 1200,
    duration: 0.12
  },
  low: {
    name: 'Low Tone',
    type: 'sine',
    frequency: 400,
    duration: 0.2
  },
  double: {
    name: 'Double Beep',
    type: 'sine',
    frequency: 800,
    duration: 0.08,
    pattern: 'double'
  },
  chirp: {
    name: 'Chirp',
    type: 'sine',
    frequencyStart: 600,
    frequencyEnd: 1200,
    duration: 0.15,
    pattern: 'sweep'
  },
  buzz: {
    name: 'Buzz',
    type: 'square',
    frequency: 600,
    duration: 0.12
  },
  soft: {
    name: 'Soft Chime',
    type: 'triangle',
    frequency: 1000,
    duration: 0.18
  },
  alert: {
    name: 'Alert',
    type: 'sawtooth',
    frequency: 700,
    duration: 0.15
  },
  funky: {
    name: 'Funky',
    type: 'sine',
    frequencyStart: 1000,
    frequencyEnd: 400,
    duration: 0.2,
    pattern: 'descend'
  },
  none: {
    name: 'Silent',
    type: null
  }
}

/**
 * Initialize the Web Audio API context
 * Must be called in response to a user gesture (click/tap)
 * @returns {AudioContext} The audio context instance
 */
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a single tone with specified parameters
 * @param {string} type - Oscillator type (sine, square, triangle, sawtooth)
 * @param {number} frequency - Tone frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume level from 0 to 1
 * @param {number} startTime - AudioContext time to start (default: now)
 */
function playTone(type, frequency, duration, volume, startTime = null) {
  const ctx = initAudio()
  const time = startTime ?? ctx.currentTime

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = type

  const scaledVolume = Math.min(1, Math.max(0, volume)) * 0.6
  gainNode.gain.setValueAtTime(scaledVolume, time)
  gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration)

  oscillator.start(time)
  oscillator.stop(time + duration)
}

/**
 * Play a frequency sweep (chirp) sound
 * @param {number} freqStart - Starting frequency in Hz
 * @param {number} freqEnd - Ending frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume level from 0 to 1
 */
function playChirp(freqStart, freqEnd, duration, volume) {
  const ctx = initAudio()
  const time = ctx.currentTime

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(freqStart, time)
  oscillator.frequency.linearRampToValueAtTime(freqEnd, time + duration)

  const scaledVolume = Math.min(1, Math.max(0, volume)) * 0.6
  gainNode.gain.setValueAtTime(scaledVolume, time)
  gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration)

  oscillator.start(time)
  oscillator.stop(time + duration)
}

/**
 * Play a sound based on preset key
 * @param {string} presetKey - Key from SOUND_PRESETS (e.g., 'classic', 'high', 'double')
 * @param {number} volume - Volume level from 0 to 1 (default: 0.5)
 */
export function playSound(presetKey, volume = 0.5) {
  const preset = SOUND_PRESETS[presetKey]

  // Invalid preset or silent
  if (!preset || preset.type === null) {
    return
  }

  // Skip if volume is 0 (muted)
  if (volume <= 0) {
    return
  }

  const ctx = initAudio()

  // Handle suspended state (browser requires user gesture)
  if (ctx.state === 'suspended') {
    ctx.resume()
  }

  // Handle different patterns
  if (preset.pattern === 'double') {
    // Double beep: two quick beeps with a short gap
    playTone(preset.type, preset.frequency, preset.duration, volume)
    playTone(preset.type, preset.frequency, preset.duration, volume, ctx.currentTime + preset.duration + 0.05)
  } else if (preset.pattern === 'sweep' || preset.pattern === 'descend') {
    // Frequency sweep (ascending or descending)
    playChirp(preset.frequencyStart, preset.frequencyEnd, preset.duration, volume)
  } else {
    // Standard single tone
    playTone(preset.type, preset.frequency, preset.duration, volume)
  }
}

/**
 * Play a beep sound using the Web Audio API oscillator
 * @param {number} frequency - Tone frequency in Hz (default: 800)
 * @param {number} duration - Beep duration in seconds (default: 0.15)
 * @param {number} volume - Volume level from 0 to 1 (default: 0.5)
 * @deprecated Use playSound() with preset keys instead
 */
export function playBeep(frequency = 800, duration = 0.15, volume = 0.5) {
  const ctx = initAudio()

  // Handle suspended state (browser requires user gesture)
  if (ctx.state === 'suspended') {
    ctx.resume()
  }

  // Skip if volume is 0 (muted)
  if (volume <= 0) {
    return
  }

  playTone('sine', frequency, duration, volume)
}
