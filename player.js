export class Player {
  constructor() {
    this.x = 256 
    this.y = 400 
    this.resting = false 
    this.restTime = 0 
    this.actuallyMoved = false 

    this.guilt = {
      level: 0, 
      max: 100, 
      increaseRate: 0.3, 
      decreaseRate: 0.8, 
    }

    this.collectibles = {
      count: 0, 
      lastCollected: null, 
    }

    this.ui = {
      affirmation: '', 
      affirmationTimer: 0, 
      deepRestThreshold: 180, 
      innerCritic: {
        message: '',
        timer: 0,
        position: { x: 0, y: 0 },
        opacity: 0,
        lastMovementTime: 0,
        restingTime: 0,
      },
    }

    this.affirmations = [
      'rest is not earned, it is needed',
      'your worth is not your productivity',
      'stillness is a form of strength',
      'you are enough, just as you are',
      'healing happens in the quiet moments',
      'it\'s okay to simply exist today',
      'the soil rests before it blooms again',
      'pausing is part of the journey',
      'you don\'t have to be more than this moment',
      'quiet is also a kind of growth',
      'slowing down is not falling behind',
      'you are allowed to take up space, even in stillness',
      'even the trees stand bare for a season',
      'gentleness is a form of power',
      'doing nothing can be deeply necessary',
      'you are safe to let go for a while',
    ]
  }

  update(keys, world, checkTreeCollision) {
    let wasMoving = false

    const oldX = this.x
    const oldY = this.y

    this.actuallyMoved = false

    if (!this.resting) {
      if (
        keys['ArrowLeft'] ||
        keys['KeyA'] ||
        keys['a'] ||
        keys['A']
      ) {
        this.x = Math.max(32, this.x - 2)
        wasMoving = true
      }

      if (
        keys['ArrowRight'] ||
        keys['KeyD'] ||
        keys['d'] ||
        keys['D']
      ) {
        this.x = Math.min(480, this.x + 2)
        wasMoving = true
      }

      if (
        keys['ArrowUp'] ||
        keys['KeyW'] ||
        keys['w'] ||
        keys['W']
      ) {
        this.y = Math.max(160, this.y - 2)
        wasMoving = true
      }

      if (
        keys['ArrowDown'] ||
        keys['KeyS'] ||
        keys['s'] ||
        keys['S']
      ) {
        this.y = Math.min(440, this.y + 2)
        wasMoving = true
      }
    }

    if (checkTreeCollision(this.x, this.y)) {
      this.x = oldX
      this.y = oldY
      wasMoving = false 
    }

    this.actuallyMoved = this.x !== oldX || this.y !== oldY

    this.checkUrgeConsumption(world.urges)

    const restKeyPressed = !!(
      keys[' '] ||
      keys['Space'] ||
      keys['Spacebar'] || 
      keys['x'] ||
      keys['X'] ||
      keys['KeyX']
    )

    if (restKeyPressed) {
      this.resting = true
      this.restTime++
    } else {
      this.resting = false
      this.restTime = 0
    }

    if (wasMoving && !this.resting) {
      this.guilt.level = Math.min(
        this.guilt.max,
        this.guilt.level + this.guilt.increaseRate
      )
    }

    this.updateGuilt()
    this.updateInnerCritic(keys)
    this.updateUI()
  }

  updateGuilt() {
    if (this.resting) {
      this.guilt.level = Math.max(0, this.guilt.level - this.guilt.decreaseRate)
    } else if (!this.actuallyMoved) {
      this.guilt.level = Math.max(0, this.guilt.level - (this.guilt.decreaseRate * 0.3))
    }
  }

  updateInnerCritic(keys) {
    const critic = this.ui.innerCritic

    const movementKeysPressed = !!(
      keys['ArrowLeft'] ||
      keys['KeyA'] ||
      keys['a'] ||
      keys['A'] ||
      keys['ArrowRight'] ||
      keys['KeyD'] ||
      keys['d'] ||
      keys['D'] ||
      keys['ArrowUp'] ||
      keys['KeyW'] ||
      keys['w'] ||
      keys['W'] ||
      keys['ArrowDown'] ||
      keys['KeyS'] ||
      keys['s'] ||
      keys['S']
    )

    if (this.resting) {
      critic.restingTime++
      critic.lastMovementTime = Math.max(0, critic.lastMovementTime - 0.5)
    } else if (movementKeysPressed) {
      critic.restingTime = 0
      critic.lastMovementTime++
    } else {
      critic.restingTime = 0
      critic.lastMovementTime = Math.max(0, critic.lastMovementTime - 0.8)
    }
  }

  updateUI() {
    if (this.restTime === this.ui.deepRestThreshold) {
      this.ui.affirmation =
        this.affirmations[Math.floor(Math.random() * this.affirmations.length)]
      this.ui.affirmationTimer = 300 
    }

    if (this.ui.affirmationTimer > 0) {
      this.ui.affirmationTimer--
      if (this.ui.affirmationTimer === 0) {
        this.ui.affirmation = ''
      }
    }
  }

  checkUrgeConsumption(urges) {
    for (const urge of urges) {
      if (!urge.consumed && !urge.transforming) {
        const distance = Math.sqrt(
          Math.pow(this.x - urge.x, 2) +
            Math.pow(this.y - urge.y, 2)
        )

        if (distance < 20) {
          urge.consumed = true

          if (!this.resting) {
            this.collectibles.count++
            this.collectibles.lastCollected = urge.type

            this.guilt.level = Math.min(this.guilt.max, this.guilt.level + 8)
          }
        }
      }
    }
  }

  getMovementAnxiety() {
    return Math.min(1, this.ui.innerCritic.lastMovementTime / 300)
  }

  getGuiltRatio() {
    return this.guilt.level / this.guilt.max
  }

  getTotalAnxiety() {
    const movementAnxiety = this.getMovementAnxiety()
    const urgeAnxiety = this.getGuiltRatio()
    return Math.min(1, (movementAnxiety + urgeAnxiety) / 2)
  }

  getRestCalm() {
    return Math.min(1, this.ui.innerCritic.restingTime / 120)
  }

  isInDeepRest() {
    return this.restTime > this.ui.deepRestThreshold
  }
}