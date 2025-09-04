export class Renderer {
  constructor(ctx) {
    this.ctx = ctx
  }

  getDesaturatedColor(color, desaturation) {
    const colors = {
      '#1d2b53': { r: 29, g: 43, b: 83 }, 
      '#7e2553': { r: 126, g: 37, b: 83 }, 
      '#008751': { r: 0, g: 135, b: 81 }, 
      '#ab5236': { r: 171, g: 82, b: 54 }, 
      '#5f574f': { r: 95, g: 87, b: 79 }, 
      '#c2c3c7': { r: 194, g: 195, b: 199 }, 
      '#fff1e8': { r: 255, g: 241, b: 232 }, 
      '#ff004d': { r: 255, g: 0, b: 77 }, 
      '#ffa300': { r: 255, g: 163, b: 0 }, 
      '#ffec27': { r: 255, g: 236, b: 39 }, 
      '#00e436': { r: 0, g: 228, b: 54 }, 
      '#29adff': { r: 41, g: 173, b: 255 }, 
      '#83769c': { r: 131, g: 118, b: 156 }, 
      '#ff77a8': { r: 255, g: 119, b: 168 }, 
      '#ffccaa': { r: 255, g: 204, b: 170 }, 
    }

    const rgb = colors[color] || { r: 128, g: 128, b: 128 }
    const gray = (rgb.r + rgb.g + rgb.b) / 3

    const r = Math.floor(rgb.r + (gray - rgb.r) * desaturation)
    const g = Math.floor(rgb.g + (gray - rgb.g) * desaturation)
    const b = Math.floor(rgb.b + (gray - rgb.b) * desaturation)

    return `rgb(${r}, ${g}, ${b})`
  }

  drawEnvironment(world, guiltRatio) {
    this.ctx.fillStyle = this.getDesaturatedColor('#ab5236', guiltRatio)
    this.ctx.fillRect(world.treeX - 8, world.treeY + 80, 16, 60)

    this.ctx.strokeStyle = this.getDesaturatedColor('#5f574f', guiltRatio)
    this.ctx.lineWidth = 3
    this.ctx.beginPath()

    this.ctx.moveTo(world.treeX, world.treeY + 80)
    this.ctx.lineTo(world.treeX - 40, world.treeY + 20)
    this.ctx.moveTo(world.treeX, world.treeY + 80)
    this.ctx.lineTo(world.treeX + 40, world.treeY + 30)
    this.ctx.moveTo(world.treeX, world.treeY + 80)
    this.ctx.lineTo(world.treeX - 20, world.treeY)
    this.ctx.moveTo(world.treeX, world.treeY + 80)
    this.ctx.lineTo(world.treeX + 30, world.treeY + 10)

    this.ctx.stroke()

    for (const tile of world.groundTiles) {
      this.ctx.fillStyle = this.getDesaturatedColor('#008751', guiltRatio)
      this.ctx.fillRect(tile.x - 8, tile.y - 4, 16, 8)
    }
  }

  drawPlayer(player, guiltRatio) {
    const playerColor = this.getDesaturatedColor('#fff1e8', guiltRatio)

    if (player.resting) {
      this.ctx.fillStyle = playerColor
      this.ctx.beginPath()
      this.ctx.ellipse(player.x, player.y, 12, 8, 0, 0, 2 * Math.PI)
      this.ctx.fill()
    } else {
      this.ctx.fillStyle = playerColor
      this.ctx.fillRect(player.x - 6, player.y - 16, 12, 16)
    }
  }

  drawLeaves(world, guiltRatio) {
    for (const leaf of world.leaves) {
      this.ctx.fillStyle = this.getDesaturatedColor('#ffa300', guiltRatio)
      this.ctx.beginPath()
      this.ctx.ellipse(
        leaf.x,
        leaf.y,
        4,
        6,
        Math.sin(leaf.life * 0.1),
        0,
        2 * Math.PI
      )
      this.ctx.fill()
    }
  }

  drawUrges(world, guiltRatio) {
    for (const urge of world.urges) {
      if (!urge.consumed && !urge.transforming) {
        const bobY = urge.y + Math.sin(urge.bobOffset) * 1.5

        const pulseIntensity = Math.sin(urge.pulseTimer * 0.1) * 0.3 + 0.7
        const pulseSize = urge.size + pulseIntensity * 2

        this.ctx.fillStyle = this.getDesaturatedColor(
          urge.color,
          guiltRatio * 0.5
        )
        this.ctx.globalAlpha = 0.2 * pulseIntensity
        this.ctx.beginPath()
        this.ctx.arc(urge.x, bobY, pulseSize + 4, 0, 2 * Math.PI)
        this.ctx.fill()
        this.ctx.globalAlpha = 1.0

        this.ctx.fillStyle = this.getDesaturatedColor(urge.color, guiltRatio)
        this.ctx.beginPath()

        const size = pulseSize
        this.ctx.moveTo(urge.x, bobY - size)
        this.ctx.lineTo(urge.x + size, bobY)
        this.ctx.lineTo(urge.x, bobY + size)
        this.ctx.lineTo(urge.x - size, bobY)
        this.ctx.closePath()
        this.ctx.fill()

        if (urge.restTimer > 0) {
          const progress = urge.restTimer / 120

          this.ctx.strokeStyle = this.getDesaturatedColor(
            '#00e436',
            guiltRatio * 0.3
          )
          this.ctx.lineWidth = 3
          this.ctx.shadowColor = this.getDesaturatedColor(
            '#00e436',
            guiltRatio * 0.2
          )
          this.ctx.shadowBlur = 8
          this.ctx.beginPath()
          this.ctx.arc(urge.x, bobY, size + 12, 0, progress * Math.PI * 2)
          this.ctx.stroke()

          this.ctx.shadowBlur = 0

          this.ctx.strokeStyle = this.getDesaturatedColor(
            '#00e436',
            guiltRatio * 0.1
          )
          this.ctx.lineWidth = 1
          this.ctx.beginPath()
          this.ctx.arc(urge.x, bobY, size + 8, 0, progress * Math.PI * 2)
          this.ctx.stroke()
        }
      }
    }
  }

  drawPermissionPetals(world, guiltRatio) {
    for (const petal of world.permissionPetals) {
      const softGlow = Math.sin(petal.life * 0.05) * 0.3 + 0.7

      this.ctx.fillStyle = this.getDesaturatedColor(
        petal.color,
        guiltRatio * 0.1
      )
      this.ctx.globalAlpha = 0.3 * softGlow
      this.ctx.beginPath()
      this.ctx.arc(petal.x, petal.y, petal.size + 6, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.globalAlpha = 1.0

      this.ctx.fillStyle = this.getDesaturatedColor(
        petal.color,
        guiltRatio * 0.3
      )
      this.ctx.beginPath()
      this.ctx.arc(petal.x, petal.y, petal.size, 0, 2 * Math.PI)
      this.ctx.fill()

      this.ctx.strokeStyle = this.getDesaturatedColor(
        petal.color,
        guiltRatio * 0.5
      )
      this.ctx.lineWidth = 1
      this.ctx.globalAlpha = 0.5
      this.ctx.beginPath()
      const trailX = petal.x - Math.cos(petal.angle) * 10
      const trailY = petal.y - Math.sin(petal.angle) * 10
      this.ctx.moveTo(trailX, trailY)
      this.ctx.lineTo(petal.x, petal.y)
      this.ctx.stroke()
      this.ctx.globalAlpha = 1.0
    }
  }

  drawBlossoms(world, progression, guiltRatio) {
    const stage = progression.getCurrentStage()

    for (const blossom of world.blossoms) {
      const glowIntensity = Math.sin(blossom.glowPhase) * 0.3 + 0.7

      this.ctx.fillStyle = this.getDesaturatedColor(
        blossom.color,
        guiltRatio * 0.3
      )
      this.ctx.globalAlpha = 0.4 * glowIntensity
      this.ctx.beginPath()
      this.ctx.arc(blossom.x, blossom.y, blossom.size + 3, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.globalAlpha = 1.0

      this.ctx.fillStyle = this.getDesaturatedColor(
        blossom.color,
        guiltRatio * 0.1
      )
      this.ctx.beginPath()
      this.ctx.arc(blossom.x, blossom.y, blossom.size, 0, 2 * Math.PI)
      this.ctx.fill()

      if (stage.name === 'radiant') {
        this.ctx.fillStyle = this.getDesaturatedColor(
          '#fff1e8',
          guiltRatio * 0.2
        )
        this.ctx.beginPath()
        this.ctx.arc(
          blossom.x - 1,
          blossom.y - 1,
          blossom.size * 0.3,
          0,
          2 * Math.PI
        )
        this.ctx.fill()
      }
    }
  }

  drawFireflies(world, guiltRatio) {
    for (const firefly of world.fireflies) {
      if (firefly.glowTimer % 30 < 15) {
        this.ctx.fillStyle = this.getDesaturatedColor(
          '#ffec27',
          guiltRatio * 0.5
        )
        this.ctx.beginPath()
        this.ctx.arc(firefly.x, firefly.y, 8, 0, 2 * Math.PI)
        this.ctx.fill()
      }

      this.ctx.fillStyle = this.getDesaturatedColor('#fff1e8', guiltRatio)
      this.ctx.beginPath()
      this.ctx.arc(firefly.x, firefly.y, 2, 0, 2 * Math.PI)
      this.ctx.fill()
    }
  }

  drawUI(player, world, progression, guiltRatio) {
    if (player.ui.affirmationTimer > 0) {
      this.ctx.fillStyle = this.getDesaturatedColor('#1d2b53', guiltRatio * 0.7)
      this.ctx.fillRect(32, 200, 448, 40)
      this.ctx.strokeStyle = this.getDesaturatedColor('#fff1e8', guiltRatio)
      this.ctx.strokeRect(32, 200, 448, 40)

      this.ctx.fillStyle = this.getDesaturatedColor('#fff1e8', guiltRatio)
      this.ctx.font = '18px monospace'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(player.ui.affirmation, 256, 225)
      this.ctx.textAlign = 'left'
    }

    this.ctx.fillStyle = this.getDesaturatedColor('#c2c3c7', guiltRatio)
    this.ctx.font = '14px monospace'

    this.ctx.font = '16px monospace'
    this.ctx.textAlign = 'right'
    this.ctx.fillStyle = this.getDesaturatedColor('#ffa300', guiltRatio * 0.3)
    this.ctx.fillText(`Collected: ${player.collectibles.count}`, 496, 30)

    if (world.motivation.currentMessage) {
      this.ctx.font = '12px monospace'
      this.ctx.fillStyle = this.getDesaturatedColor('#ff004d', guiltRatio * 0.2)
      this.ctx.fillText(world.motivation.currentMessage, 496, 50)
    }

    this.ctx.textAlign = 'left' 

    this.ctx.font = '12px monospace'
    this.ctx.fillStyle = this.getDesaturatedColor('#c2c3c7', guiltRatio)
    const currentStage = progression.getCurrentStage()
  }

  drawEnvironmentalAnxiety(player, totalDesaturation) {
    const movementAnxiety = player.getMovementAnxiety()
    const urgeAnxiety = player.getGuiltRatio()
    const totalAnxiety = player.getTotalAnxiety()
    const restCalm = player.getRestCalm()

    if (totalAnxiety > 0 && !player.resting) {
      this.ctx.save()

      const edgeDarkness = totalAnxiety * 0.7
      const gradient = this.ctx.createRadialGradient(
        256,
        256,
        100 - totalAnxiety * 50, 
        256,
        256,
        300
      )
      gradient.addColorStop(0, `rgba(0, 0, 0, 0)`)
      gradient.addColorStop(0.6, `rgba(0, 0, 0, ${edgeDarkness * 0.4})`)
      gradient.addColorStop(1, `rgba(0, 0, 0, ${edgeDarkness})`)

      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, 512, 512)

      const redGradient = this.ctx.createRadialGradient(
        256,
        256,
        120,
        256,
        256,
        300
      )
      redGradient.addColorStop(0, `rgba(255, 0, 77, 0)`)
      redGradient.addColorStop(1, `rgba(255, 0, 77, ${totalAnxiety * 0.25})`)

      this.ctx.fillStyle = redGradient
      this.ctx.fillRect(0, 0, 512, 512)

      this.ctx.restore()
    }

    if (totalAnxiety > 0.6) {
      const shakeIntensity = (totalAnxiety - 0.6) * 4
      const shakeX = (Math.random() - 0.5) * shakeIntensity
      const shakeY = (Math.random() - 0.5) * shakeIntensity
      this.ctx.save()
      this.ctx.translate(shakeX, shakeY)
    }

    if (restCalm > 0 && player.resting) {
      this.ctx.save()

      const glowIntensity = restCalm * 0.4
      const gradient = this.ctx.createRadialGradient(
        player.x,
        player.y,
        15,
        player.x,
        player.y,
        200 
      )
      gradient.addColorStop(0, `rgba(255, 241, 232, ${glowIntensity})`)
      gradient.addColorStop(0.4, `rgba(0, 228, 54, ${glowIntensity * 0.3})`)
      gradient.addColorStop(1, `rgba(255, 241, 232, 0)`)

      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, 512, 512)

      this.ctx.restore()
    }

    return totalAnxiety > 0.6 
  }

  draw(player, world, progression) {
    const movementAnxiety = player.getMovementAnxiety()
    const guiltRatio = player.getGuiltRatio()
    const totalDesaturation = Math.min(1, (guiltRatio + movementAnxiety) / 2)
    const totalAnxiety = player.getTotalAnxiety()

    this.ctx.fillStyle = this.getDesaturatedColor('#1d2b53', totalDesaturation)
    this.ctx.fillRect(0, 0, 512, 512)

    const shakeApplied = this.drawEnvironmentalAnxiety(
      player,
      totalDesaturation
    ) 
    this.drawEnvironment(world, totalDesaturation)
    this.drawBlossoms(world, progression, totalDesaturation)
    this.drawUrges(world, totalDesaturation)
    this.drawPermissionPetals(world, totalDesaturation)
    this.drawPlayer(player, totalDesaturation)
    this.drawLeaves(world, totalDesaturation)
    this.drawFireflies(world, totalDesaturation)
    this.drawUI(player, world, progression, totalDesaturation)

    if (shakeApplied) {
      this.ctx.restore()
    }
  }
}
