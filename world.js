export class World {
  constructor() {
    this.treeX = 256 
    this.treeY = 160 
    this.leaves = [] 
    this.fireflies = [] 
    this.groundTiles = [] 
    this.urges = [] 
    this.permissionPetals = [] 
    this.blossoms = [] 

    this.motivation = {
      messages: [
        "You're not going fast enough",
        'Be more productive',
        'Others are achieving more',
        'You should be doing something',
        'Time is running out',
        "You're falling behind",
        'Push yourself harder',
        'Rest is for the weak',
        'Success requires sacrifice',
        "You're wasting potential",
      ],
      currentMessage: '',
      timer: 0,
      displayDuration: 180, 
      interval: 300, 
    }
  }

  init() {
    for (let i = 0; i < 12; i++) {
      this.groundTiles.push({
        x: Math.random() * 512,
        y: 440 + Math.random() * 40,
        type: Math.floor(Math.random() * 4),
      })
    }

    for (let i = 0; i < 6; i++) {
      this.leaves.push(this.createLeaf())
    }

    this.createUrges()
  }

  createLeaf() {
    return {
      x: Math.random() * 512,
      y: -32,
      speed: 0.8 + Math.random() * 1.6,
      sway: Math.random() * 2,
      type: Math.floor(Math.random() * 4),
      life: 0,
    }
  }

  createFirefly() {
    return {
      x: 80 + Math.random() * 352,
      y: 240 + Math.random() * 160,
      dx: -0.8 + Math.random() * 1.6,
      dy: -0.8 + Math.random() * 1.6,
      type: Math.floor(Math.random() * 4),
      life: 0,
      glowTimer: 0,
    }
  }

  createUrges() {
    const urgeTypes = [
      { name: 'productivity', color: '#ff004d', size: 5 },
      { name: 'achievement', color: '#ffa300', size: 6 },
      { name: 'perfection', color: '#ffec27', size: 4 },
      { name: 'comparison', color: '#83769c', size: 5 },
    ]

    const numUrges = 6 + Math.floor(Math.random() * 5)

    for (let i = 0; i < numUrges; i++) {
      let x, y
      let attempts = 0

      do {
        x = 50 + Math.random() * 412
        y = 200 + Math.random() * 220
        attempts++
      } while (this.checkTreeCollision(x, y) && attempts < 20)

      const type = urgeTypes[Math.floor(Math.random() * urgeTypes.length)]

      this.urges.push({
        x: x,
        y: y,
        type: type.name,
        color: type.color,
        size: type.size,
        consumed: false,
        pulseTimer: Math.random() * 60,
        bobOffset: Math.random() * Math.PI * 2,
        restTimer: 0, 
        transforming: false,
      })
    }
  }

  respawnUrges() {
    this.urges = []

    this.createUrges()
  }

  checkTreeCollision(playerX, playerY) {
    const treeX = this.treeX
    const treeY = this.treeY

    const trunkLeft = treeX - 8
    const trunkRight = treeX + 8
    const trunkTop = treeY + 80
    const trunkBottom = treeY + 140

    const playerLeft = playerX - 6
    const playerRight = playerX + 6
    const playerTop = playerY - 16
    const playerBottom = playerY

    if (
      playerRight > trunkLeft &&
      playerLeft < trunkRight &&
      playerBottom > trunkTop &&
      playerTop < trunkBottom
    ) {
      return true
    }

    const branches = [
      { x: treeX - 40, y: treeY + 20, w: 30, h: 10 }, 
      { x: treeX + 10, y: treeY + 30, w: 30, h: 10 }, 
      { x: treeX - 20, y: treeY, w: 15, h: 10 }, 
      { x: treeX + 5, y: treeY + 10, w: 25, h: 10 }, 
    ]

    for (const branch of branches) {
      if (
        playerRight > branch.x &&
        playerLeft < branch.x + branch.w &&
        playerBottom > branch.y &&
        playerTop < branch.y + branch.h
      ) {
        return true
      }
    }

    return false
  }

  update(player, progression, deepRestThreshold) {
    this.updateLeaves()
    this.updateFireflies(player, deepRestThreshold)
    this.updateUrges(player)
    this.updatePermissionPetals(player)
    this.updateBlossoms()
    this.updateMotivation(player)
  }

  updateLeaves() {
    for (let i = this.leaves.length - 1; i >= 0; i--) {
      const leaf = this.leaves[i]
      leaf.y += leaf.speed
      leaf.x += Math.sin(leaf.life * 0.02) * leaf.sway
      leaf.life++

      if (leaf.y > 512) {
        this.leaves.splice(i, 1)
        this.leaves.push(this.createLeaf())
      }
    }
  }

  updateFireflies(player, deepRestThreshold) {
    if (
      player.restTime > deepRestThreshold &&
      this.fireflies.length < 4
    ) {
      if (Math.random() < 0.02) {
        this.fireflies.push(this.createFirefly())
      }
    }

    if (player.restTime < deepRestThreshold) {
      this.fireflies = []
    }

    for (const firefly of this.fireflies) {
      firefly.x += firefly.dx
      firefly.y += firefly.dy
      firefly.life++
      firefly.glowTimer++

      if (firefly.life % 60 === 0) {
        firefly.dx = -0.8 + Math.random() * 1.6
        firefly.dy = -0.8 + Math.random() * 1.6
      }

      if (firefly.x < 0 || firefly.x > 512) firefly.dx = -firefly.dx
      if (firefly.y < 120 || firefly.y > 440) firefly.dy = -firefly.dy
    }
  }

  updateUrges(player) {
    for (const urge of this.urges) {
      if (!urge.consumed && !urge.transforming) {
        urge.pulseTimer++
        urge.bobOffset += 0.03

        if (player.resting) {
          urge.restTimer++

          if (urge.restTimer > 120) {
            urge.transforming = true
            this.createPermissionPetal(urge)
          }
        } else {
          urge.restTimer = 0
        }
      }
    }

    const allProcessed = this.urges.every(
      (u) => u.consumed || u.transforming
    )

    if (allProcessed) {
      this.respawnUrges()
    }
  }

  updatePermissionPetals(player) {
    for (const petal of this.permissionPetals) {
      petal.angle += petal.speed
      petal.life++

      if (player.resting) {
        petal.orbitRadius = Math.max(30, petal.orbitRadius - 0.5)
        petal.x = player.x + Math.cos(petal.angle) * petal.orbitRadius
        petal.y = player.y + Math.sin(petal.angle) * petal.orbitRadius
      } else {
        petal.orbitRadius += 1
        petal.x = player.x + Math.cos(petal.angle) * petal.orbitRadius
        petal.y = player.y + Math.sin(petal.angle) * petal.orbitRadius
      }

      if (petal.orbitRadius > 200) {
        const index = this.permissionPetals.indexOf(petal)
        this.permissionPetals.splice(index, 1)
      }
    }
  }

  updateBlossoms() {
    for (const blossom of this.blossoms) {
      blossom.life++
      blossom.swayOffset += 0.02
      blossom.glowPhase += 0.03

      blossom.x += Math.sin(blossom.swayOffset) * 0.1
    }
  }

  updateMotivation(player) {
    this.motivation.timer++

    if (!player.resting) {
      if (this.motivation.timer >= this.motivation.interval) {
        const randomIndex = Math.floor(
          Math.random() * this.motivation.messages.length
        )
        this.motivation.currentMessage = this.motivation.messages[randomIndex]
        this.motivation.timer = 0
      }
    } else {
      if (this.motivation.currentMessage) {
        this.motivation.currentMessage = ''
        this.motivation.timer = 0
      }
    }
  }

  createPermissionPetal(urge) {
    this.permissionPetals.push({
      x: urge.x,
      y: urge.y,
      angle: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.02,
      orbitRadius: 60,
      life: 0,
      color: '#00e436', 
      size: 3,
    })
  }
}