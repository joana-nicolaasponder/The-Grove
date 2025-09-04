export class Progression {
  constructor() {
    this.totalRestTime = 0 
    this.currentMilestone = 0 
    this.milestones = [0, 300, 900, 1800, 3600, 7200] 
    this.blossomStages = [
      { name: 'bare', blossoms: 0, leafDensity: 0 },
      { name: 'budding', blossoms: 20, leafDensity: 0.3 },
      { name: 'sprouting', blossoms: 120, leafDensity: 0.6 },
      { name: 'blooming', blossoms: 180, leafDensity: 0.8 },
      { name: 'flourishing', blossoms: 250, leafDensity: 1.2 },
      { name: 'radiant', blossoms: 500, leafDensity: 3 },
    ]
  }

  initialize(world) {
    const saved = localStorage.getItem('groveProgression')
    if (saved) {
      const data = JSON.parse(saved)
      this.totalRestTime = data.totalRestTime || 0
      this.currentMilestone = data.currentMilestone || 0
    }

    this.generateBlossoms(world)
  }

  update(player, world, audioSystem) {
    if (player.resting) {
      this.totalRestTime++
      this.checkProgressionMilestones(world, audioSystem, player)
    }
  }

  checkProgressionMilestones(world, audioSystem, player) {
    const milestones = this.milestones
    const currentTime = this.totalRestTime

    for (let i = milestones.length - 1; i >= 0; i--) {
      if (
        currentTime >= milestones[i] &&
        this.currentMilestone < i
      ) {
        this.currentMilestone = i
        this.onMilestoneReached(i, world, audioSystem, player)
        this.saveProgression()
        break
      }
    }
  }

  onMilestoneReached(milestone, world, audioSystem, player) {
    this.generateBlossoms(world)

    if (milestone > 0) {
      for (let i = 0; i < 3; i++) {
        world.fireflies.push(world.createFirefly())
      }

      const base = 523.25
      setTimeout(() => audioSystem.playBloomChime(base), 50)
      setTimeout(() => audioSystem.playBloomChime(base * 1.25), 200)
      setTimeout(() => audioSystem.playBloomChime(base * 0.75), 350)

      if (
        player.resting &&
        player.restTime > player.ui.deepRestThreshold
      ) {
        const newStageName = this.blossomStages[milestone].name
        audioSystem.currentHarmonyStage = null
        const restCalm = Math.min(1, player.ui.innerCritic.restingTime / 120)
        audioSystem.updateRest(restCalm, true, newStageName)
      }
    }
  }

  generateBlossoms(world) {
    const stage = this.blossomStages[this.currentMilestone]
    world.blossoms = []

    const treeX = world.treeX
    const treeY = world.treeY

    for (let i = 0; i < stage.blossoms; i++) {
      const branchPositions = [
        {
          x: treeX - 40 + Math.random() * 30,
          y: treeY + 20 + Math.random() * 10,
        },
        {
          x: treeX + 10 + Math.random() * 30,
          y: treeY + 30 + Math.random() * 10,
        },
        { x: treeX - 20 + Math.random() * 15, y: treeY + Math.random() * 10 },
        {
          x: treeX + 5 + Math.random() * 25,
          y: treeY + 10 + Math.random() * 10,
        },
        {
          x: treeX - 15 + Math.random() * 30,
          y: treeY + 40 + Math.random() * 20,
        },
      ]

      const pos =
        branchPositions[Math.floor(Math.random() * branchPositions.length)]

      world.blossoms.push({
        x: pos.x + (Math.random() - 0.5) * 20,
        y: pos.y + (Math.random() - 0.5) * 15,
        size: 2 + Math.random() * 3,
        color: this.getBlossomColor(stage.name),
        life: Math.random() * 100,
        swayOffset: Math.random() * Math.PI * 2,
        glowPhase: Math.random() * Math.PI * 2,
      })
    }
  }

  getBlossomColor(stageName) {
    const colors = {
      bare: '#5f574f',
      budding: '#83769c',
      sprouting: '#00e436',
      blooming: '#ffec27',
      flourishing: '#ff77a8',
      radiant: '#fff1e8',
    }
    return colors[stageName] || '#5f574f'
  }

  saveProgression() {
    const data = {
      totalRestTime: this.totalRestTime,
      currentMilestone: this.currentMilestone,
    }
    localStorage.setItem('groveProgression', JSON.stringify(data))
  }

  resetProgression(world) {
    localStorage.removeItem('groveProgression')

    this.totalRestTime = 0
    this.currentMilestone = 0

    this.generateBlossoms(world)
  }

  getCurrentStage() {
    return this.blossomStages[this.currentMilestone]
  }

  getNextMilestone() {
    return this.milestones[this.currentMilestone + 1] || 'MAX'
  }
}