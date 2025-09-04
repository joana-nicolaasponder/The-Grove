import { AudioSystem } from './audio-system.js'
import { Player } from './player.js'
import { World } from './world.js'
import { Progression } from './progression.js'
import { Renderer } from './renderer.js'
import { InputHandler } from './input-handler.js'

class TheGrove {
  constructor() {
    this.canvas = document.getElementById('gameCanvas')
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = 512 
    this.canvas.height = 512

    this.audioSystem = new AudioSystem()
    this.player = new Player()
    this.world = new World()
    this.progression = new Progression()
    this.renderer = new Renderer(this.ctx)
    this.inputHandler = new InputHandler()

    this.scheduler = {
      next: 0,
      interval: 7.0,
    }

    this.lastAudioStageName = 'bare'

    this.init()
    this.initAudio()
    this.gameLoop()
  }

  init() {
    this.world.init()
    this.progression.initialize(this.world)

    this.canvas.addEventListener('click', () => {})
  }

  async initAudio() {
    const initAudioOnInteraction = async () => {
      await this.audioSystem.init()
      document.removeEventListener('keydown', initAudioOnInteraction)
      document.removeEventListener('click', initAudioOnInteraction)
    }

    document.addEventListener('keydown', initAudioOnInteraction)
    document.addEventListener('click', initAudioOnInteraction)
  }

  update() {
    const keys = this.inputHandler.getKeys()
    
    this.inputHandler.handleDebugKeys(this.progression, this.audioSystem, this.world)
    
    this.player.update(keys, this.world, (x, y) => this.world.checkTreeCollision(x, y))
    this.world.update(this.player, this.progression, this.player.ui.deepRestThreshold)
    this.progression.update(this.player, this.world, this.audioSystem)
    
    this.updateAudio()
    this.tickScheduler()
  }

  updateAudio() {
    if (!this.audioSystem.initialized) return

    const totalAnxiety = this.player.getTotalAnxiety()
    const restCalm = Math.min(1, this.player.restTime / 120)
    const deepRest = this.player.isInDeepRest()

    const currentStage = this.progression.getCurrentStage()
    const stageName = currentStage ? currentStage.name : 'bare'

    if (this.lastAudioStageName !== stageName) {
      this.lastAudioStageName = stageName
    }

    this.audioSystem.updateAnxiety(totalAnxiety, this.player.resting)
    this.audioSystem.updateRest(restCalm, deepRest, stageName)
  }

  tickScheduler() {
    if (!this.audioSystem.initialized) {
      return
    }

    const deepRest = this.player.isInDeepRest()
    const currentStage = this.progression.getCurrentStage()
    const stageName = currentStage ? currentStage.name : 'bare'
    const restIntensity = Math.min(1, this.player.ui.innerCritic.restingTime / 180)
    const restLevel = Math.min(1, this.player.restTime / 120)

    const stageForHarmony = this.audioSystem.getRestHarmonyStage(
      restLevel,
      stageName
    )

    if (!this.audioSystem.audioContext) {
      return
    }
    const ctx = this.audioSystem.audioContext
    const now = ctx.currentTime

    if (deepRest) {
      if (!this.scheduler.next) {
        this.scheduler.next = now + 2
      }

      if (now >= this.scheduler.next) {
        this.advanceChord(stageForHarmony, restIntensity)
        this.scheduler.interval = 6 + Math.random() * 4
        this.scheduler.next = now + this.scheduler.interval
      }
    } else {
      if (this.scheduler.next !== 0) {
        this.scheduler.next = 0
      }
    }

    if (deepRest) {
      if (!this.audioSystem.chimeScheduler.next) {
        this.audioSystem.chimeScheduler.next = now + 3 + Math.random() * 3 
      }

      if (now >= this.audioSystem.chimeScheduler.next) {
        this.playRestChimes(stageForHarmony)
        this.audioSystem.chimeScheduler.interval = 6 + Math.random() * 4
        this.audioSystem.chimeScheduler.next =
          now + this.audioSystem.chimeScheduler.interval
      }
    } else {
      if (this.audioSystem.chimeScheduler.next !== 0) {
        this.audioSystem.chimeScheduler.next = 0
      }
    }
  }

  advanceChord(stageName, intensity) {
    const pools = this.audioSystem.chordPools
    const set = pools[stageName] || []
    if (!set.length) return

    const choice = set[Math.floor(Math.random() * set.length)]
    this.audioSystem.setHarmonyChord(choice, intensity, stageName)
  }

  playRestChimes(stageName) {
    const chimePatterns = {
      bare: [523.25], 
      budding: [523.25], 
      sprouting: [523.25, 659.25], 
      blooming: [523.25, 659.25, 783.99], 
      flourishing: [523.25, 659.25, 880.0], 
      radiant: [523.25, 659.25, 783.99, 1046.5], 
    }

    const pattern = chimePatterns[stageName] || [523.25]
    const baseVolume = 0.08 

    pattern.forEach((pitch, index) => {
      setTimeout(() => {
        if (this.audioSystem && this.audioSystem.initialized) {
          this.audioSystem.playRestChime(pitch, baseVolume * (1 - index * 0.1))
        }
      }, index * 400 + Math.random() * 200) 
    })
  }

  draw() {
    this.renderer.draw(this.player, this.world, this.progression)
  }

  gameLoop() {
    this.update()
    this.draw()
    requestAnimationFrame(() => this.gameLoop())
  }
}

window.addEventListener('load', () => {
  new TheGrove()
})