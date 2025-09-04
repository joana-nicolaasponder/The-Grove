export class AudioSystem {
  constructor() {
    this.audioContext = null
    this.masterGain = null
    this.ambientGain = null
    this.windGain = null
    this.harmonyGain = null

    this.ambientOscillators = []
    this.windNode = null
    this.harmonyOscillators = []

    this.initialized = false
    this.enabled = true

    this.crossfade = {
      targetAnxiety: 0,
      targetHarmony: 0,
    }

    this.ambientFreqs = [55, 82.5, 110, 165] 
    this.windFreqs = [200, 300, 450, 600] 

    this.chordPools = {
      bare: [[196.0, 261.63]], 
      budding: [[261.63, 329.63]], 
      sprouting: [
        [261.63, 329.63, 392.0],
        [349.23, 440.0, 523.25],
      ], 
      blooming: [[261.63, 329.63, 369.99, 392.0]], 
      flourishing: [[261.63, 329.63, 392.0, 440.0, 523.25]], 
      radiant: [[130.81, 261.63, 329.63, 392.0, 523.25, 659.25]], 
    }

    this.scheduler = {
      next: 0,
      interval: 7.0,
    }

    this.chimeScheduler = {
      next: 0,
      interval: 12.0,
    }

    this.currentAnxiety = 0
    this.currentRest = 0
    this.currentHarmonyStage = null
  }

  async init() {
    if (this.initialized) return

    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)()

      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      this.masterGain.connect(this.audioContext.destination)

      this.ambientGain = this.audioContext.createGain()
      this.windGain = this.audioContext.createGain()
      this.harmonyGain = this.audioContext.createGain()

      this.ambientGain.connect(this.masterGain)
      this.windGain.connect(this.masterGain)
      this.harmonyGain.connect(this.masterGain)

      this.windGain.gain.setValueAtTime(0.01, this.audioContext.currentTime)
      this.harmonyGain.gain.setValueAtTime(0.01, this.audioContext.currentTime)

      this.createSimpleVerb()

      this.createAmbientLoop()

      this.initialized = true
    } catch (error) {
      console.warn('Audio initialization failed:', error)
      this.enabled = false
    }
  }

  createAmbientLoop() {
    if (!this.enabled || !this.audioContext) return

    this.ambientFreqs.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator()
      const gain = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, this.audioContext.currentTime)
      filter.Q.setValueAtTime(0.5, this.audioContext.currentTime)

      gain.gain.setValueAtTime(
        0.1 + index * 0.02,
        this.audioContext.currentTime
      )

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ambientGain)

      osc.start()

      this.ambientOscillators.push({ osc, gain, filter })

      const lfo = this.audioContext.createOscillator()
      const lfoGain = this.audioContext.createGain()

      lfo.type = 'sine'
      lfo.frequency.setValueAtTime(
        0.1 + Math.random() * 0.2,
        this.audioContext.currentTime
      )
      lfoGain.gain.setValueAtTime(2, this.audioContext.currentTime)

      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start()
    })

    this.ambientGain.gain.setValueAtTime(0.6, this.audioContext.currentTime)
  }

  setSmooth(gainParam, value, timeConst = 0.4) {
    const t = this.audioContext.currentTime
    gainParam.setTargetAtTime(Math.max(0.001, value), t, timeConst)
  }

  createSimpleVerb() {
    if (!this.enabled || !this.audioContext) return

    const ctx = this.audioContext
    const inBus = ctx.createGain()
    const delay = ctx.createDelay(1.2)
    delay.delayTime.value = 0.22
    const fb = ctx.createGain()
    fb.gain.value = 0.25
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 2500

    inBus.connect(delay)
    delay.connect(tone)
    tone.connect(fb)
    fb.connect(delay)

    const outBus = ctx.createGain()
    outBus.gain.value = 0.25
    tone.connect(outBus)
    outBus.connect(this.masterGain)

    this.verbSend = inBus
    this.harmonyGain.connect(this.verbSend)
  }

  updateAnxiety(anxietyLevel, isResting = false) {
    if (!this.enabled || !this.audioContext) return

    this.currentAnxiety = anxietyLevel
    const fast = isResting ? 0.25 : 0.5

    const ambientVolume = Math.max(0.15, 0.6 - anxietyLevel * 0.45)
    this.setSmooth(this.ambientGain.gain, ambientVolume, 0.6)

    if (anxietyLevel > 0.1 && !isResting) {
      this.createWindSounds(anxietyLevel)
      const targetWind = Math.min(0.45, anxietyLevel * 0.45)
      this.setSmooth(this.windGain.gain, targetWind, fast)
    } else {
      this.fadeOutWindSounds(isResting ? 0.4 : 1.0)
    }
  }

  createWindSounds(intensity) {
    if (!this.enabled || !this.audioContext) return
    if (this.windNode) return 

    const ctx = this.audioContext

    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 500 
    bp.Q.value = 1.2

    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = 0.15 + Math.random() * 0.25
    lfoGain.gain.value = 220 

    lfo.connect(lfoGain)
    lfoGain.connect(bp.frequency)

    noise.connect(bp)
    bp.connect(this.windGain)

    noise.start()
    lfo.start()

    this.windNode = { noise, bp, lfo, lfoGain }
  }

  fadeOutWindSounds(fadeTime = 1.0) {
    if (!this.enabled || !this.audioContext) return

    const t = this.audioContext.currentTime
    this.setSmooth(this.windGain.gain, 0.01, fadeTime * 0.6)

    if (this.windNode) {
      const { noise, lfo } = this.windNode
      setTimeout(() => {
        try {
          noise.stop()
          lfo.stop()
        } catch (e) {}
        this.windNode = null
      }, fadeTime * 1000 + 120)
    }
  }

  updateRest(restLevel, deepRest = false, groveStage = 'bare') {
    if (!this.enabled || !this.audioContext) return

    this.currentRest = restLevel
    const slow = 1.6 
    const stageForHarmony = this.getRestHarmonyStage(restLevel, groveStage)

    const targetHarmony = deepRest
      ? Math.min(0.45, 0.12 + restLevel * 0.45)
      : 0.01
    this.setSmooth(this.harmonyGain.gain, targetHarmony, slow)

    if (deepRest) {
      const ambientTarget = Math.max(0.04, 0.35 * (1 - restLevel))
      this.setSmooth(this.ambientGain.gain, ambientTarget, 1.2)

      this.createHarmonyTones(restLevel, stageForHarmony)
      this.updateHarmonyLevels(restLevel)
    } else {
      this.setSmooth(this.ambientGain.gain, 0.6, 1.2)
      this.fadeOutHarmonyTones(1.2)
    }
  }

  createHarmonyTones(intensity, groveStage = 'bare') {
    if (!this.enabled || !this.audioContext) return

    const sourceStage =
      this.chordPools[groveStage] && this.chordPools[groveStage].length
        ? groveStage
        : 'budding'

    const chordPool = this.chordPools[sourceStage]

    if (this.currentHarmonyStage !== sourceStage) {
      this.fadeOutHarmonyTones(0.5)
      this.currentHarmonyStage = sourceStage

      setTimeout(() => {
        const chord = chordPool[Math.floor(Math.random() * chordPool.length)]
        this.buildHarmonyVoices(chord, sourceStage, intensity)
      }, 600)
      return
    }

    if (this.harmonyOscillators.length === 0) {
      const chord = chordPool[Math.floor(Math.random() * chordPool.length)]
      this.buildHarmonyVoices(chord, sourceStage, intensity)
    }
  }

  buildHarmonyVoices(freqs, stageName, intensity) {
    if (!this.enabled || !this.audioContext) return

    const ctx = this.audioContext
    const stageOrder = [
      'bare',
      'budding',
      'sprouting',
      'blooming',
      'flourishing',
      'radiant',
    ]
    const stageIndex = Math.max(0, stageOrder.indexOf(stageName))

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const lp = ctx.createBiquadFilter()

      lp.type = 'lowpass'
      lp.frequency.value = 900 + stageIndex * 250
      lp.Q.value = 0.5 + stageIndex * 0.1

      osc.type =
        stageIndex < 2 ? 'sine' : stageIndex < 4 ? 'triangle' : 'sawtooth'
      osc.frequency.value = f

      const vib = ctx.createOscillator()
      const vibGain = ctx.createGain()
      vib.type = 'sine'
      vib.frequency.value = 0.2 + Math.random() * 0.2
      vibGain.gain.value = 1.5 + stageIndex * 0.5
      vib.connect(vibGain)
      vibGain.connect(osc.frequency)
      vib.start()

      gain.gain.value = 0.001
      osc.connect(lp)
      lp.connect(gain)
      gain.connect(this.harmonyGain)
      osc.start()

      const t = ctx.currentTime + 0.6 + i * 0.35
      const targetGain = Math.min(0.08, (0.04 + i * 0.02) * intensity)
      gain.gain.setTargetAtTime(targetGain, t, 0.8)

      this.harmonyOscillators.push({ osc, gain, lp, vib })
    })
  }

  getRestHarmonyStage(restLevel, groveStage) {
    if (groveStage !== 'bare') return groveStage

    if (restLevel < 0.33) return 'budding'
    if (restLevel < 0.66) return 'sprouting'
    if (restLevel < 0.85) return 'blooming'
    return 'flourishing'
  }

  updateHarmonyLevels(intensity) {
    if (!this.enabled || !this.audioContext) return
    const ctx = this.audioContext
    this.harmonyOscillators.forEach((h, i) => {
      const base = 0.04 + i * 0.02 
      const target = Math.min(0.12, base * Math.max(0.35, intensity))
      h.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.8)
    })
  }

  setHarmonyChord(freqs, intensity, stageName) {
    if (!this.enabled || !this.audioContext) return

    this.fadeOutHarmonyTones(0.5)
    setTimeout(() => {
      this.buildHarmonyVoices(freqs, stageName, intensity)
    }, 520)
  }

  fadeOutHarmonyTones(fadeTime = 1.5) {
    if (!this.enabled || !this.audioContext) return

    const t = this.audioContext.currentTime
    this.harmonyOscillators.forEach((h) => {
      try {
        h.gain.gain.setTargetAtTime(0.001, t, Math.max(0.15, fadeTime * 0.5))
      } catch (e) {}
    })

    setTimeout(() => {
      this.harmonyOscillators.forEach((h) => {
        try {
          h.osc.stop()
          if (h.vib) h.vib.stop()
        } catch (e) {}
      })
      this.harmonyOscillators = []
    }, fadeTime * 1000 + 120)
  }

  playBloomChime(pitch = 523.25) {
    if (!this.enabled || !this.audioContext) return

    const ctx = this.audioContext
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    const hp = ctx.createBiquadFilter()

    hp.type = 'highpass'
    hp.frequency.value = 200

    o.type = 'sine'
    o.frequency.value = pitch
    g.gain.value = 0.001

    o.connect(hp)
    hp.connect(g)
    g.connect(this.masterGain)
    o.start()

    const t = ctx.currentTime
    g.gain.setTargetAtTime(0.25, t, 0.02) 
    g.gain.setTargetAtTime(0.001, t + 0.35, 0.25) 
    o.stop(t + 1.5)
  }

  playRestChime(pitch = 523.25, volume = 0.12) {
    if (!this.enabled || !this.audioContext) return

    const ctx = this.audioContext
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    const lp = ctx.createBiquadFilter()

    lp.type = 'lowpass'
    lp.frequency.value = 1200
    lp.Q.value = 0.3

    o.type = 'sine'
    o.frequency.value = pitch
    g.gain.value = 0.001

    o.connect(lp)
    lp.connect(g)
    g.connect(this.masterGain)
    o.start()

    const t = ctx.currentTime
    g.gain.setTargetAtTime(volume, t, 0.08) 
    g.gain.setTargetAtTime(0.001, t + 1.2, 0.6) 
    o.stop(t + 2.5)
  }

  setMasterVolume(volume) {
    if (!this.enabled || !this.audioContext) return

    this.masterGain.gain.exponentialRampToValueAtTime(
      Math.max(0.01, volume),
      this.audioContext.currentTime + 0.1
    )
  }

  toggle() {
    if (!this.audioContext) return

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
      this.enabled = true
    } else {
      this.audioContext.suspend()
      this.enabled = false
    }
  }
}