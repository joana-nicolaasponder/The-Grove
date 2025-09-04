export class InputHandler {
  constructor() {
    this.keys = {}
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.keys = {}

    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true
      this.keys[e.code] = true

      if (
        [
          ' ',
          'Space',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'x',
          'X',
          'w',
          'a',
          's',
          'd',
          'W',
          'A',
          'S',
          'D',
        ].includes(e.key)
      ) {
        e.preventDefault()
      }
    })

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false
      this.keys[e.code] = false
    })
  }

  handleDebugKeys(progression, audioSystem, world) {
    if (this.keys['r'] || this.keys['R'] || this.keys['KeyR']) {
      progression.resetProgression(world)
      this.keys['r'] = false
      this.keys['R'] = false
      this.keys['KeyR'] = false
    }

    if (this.keys['m'] || this.keys['M'] || this.keys['KeyM']) {
      audioSystem.toggle()
      this.keys['m'] = false
      this.keys['M'] = false
      this.keys['KeyM'] = false
    }

    if (this.keys['p'] || this.keys['P'] || this.keys['KeyP']) {
      progression.totalRestTime += 300
      progression.checkProgressionMilestones(world, audioSystem, { 
        resting: false, 
        restTime: 0,
        ui: { deepRestThreshold: 180, innerCritic: { restingTime: 0 } }
      })
      this.keys['p'] = false
      this.keys['P'] = false
      this.keys['KeyP'] = false
    }
  }

  getKeys() {
    return this.keys
  }
}