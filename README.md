# The Grove - Game 2

**Quarterly Game Project - Q3 2024**

**👋🏼 Intro:**

The Grove is a contemplative browser game about rest, productivity culture, and the gentle art of doing nothing. Part of an ongoing quarterly game challenge with my brother, where we create small experimental games for each other every three months.

**📦 Tech Stack:** 

- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas
- Web Audio API
- CSS3

**👩🏻‍🍳 Features:** 

- **Movement-based anxiety system** - Moving around increases guilt and desaturates the world
- **Rest mechanics** - Holding space/X to sit and rest gradually restores color and calm  
- **Progressive grove system** - Extended rest sessions unlock new blossom stages that persist across sessions
- **Dynamic audio layers** - Ambient sounds, anxiety-inducing wind, and harmony that responds to your emotional state
- **Gentle affirmations** - Meaningful messages appear during deep rest periods
- **Urge transformation** - Productivity urges scattered around the world transform into permission petals when you rest near them
- **Visual storytelling** - Color desaturation and screen effects communicate emotional states without explicit UI

**💭 Process:** 

Started with PICO-8 but moved to vanilla JavaScript when pixel art became a blocker rather than enabler. The original 1960-line monolith got refactored into modular ES6 classes (AudioSystem, Player, World, Progression, Renderer, InputHandler) for better maintainability.

The core insight was designing mechanics that mirror real emotional experiences - the more you chase productivity "urges," the more hollow and gray the world becomes, while rest and stillness literally bring beauty and color back to life.

**📚 Learnings:** 

- How to use Web Audio API for procedural, emotional soundscapes
- The power of environmental storytelling through visual effects
- When to abandon tools that aren't serving the creative process (PICO-8 → vanilla JS)
- Modular architecture makes experimental games much easier to iterate on
- Sometimes the most impactful game mechanics are the ones that teach rather than challenge

**✨ Improvements:** 

- More varied affirmation messages based on play patterns
- Additional grove progression stages for longer-term players  
- Subtle particle effects for enhanced atmosphere
- Mobile/touch controls for broader accessibility
- Save system for affirmations you've unlocked

**🚦 Running the project:** 

1. Clone the repository
2. Open `index.html` in your browser (uses ES6 modules, so needs to be served from HTTP/HTTPS - you can use Live Server extension in VS Code)
3. Use WASD/Arrow keys to move, Space/X to rest
4. Debug keys: R (reset progression), M (toggle audio), P (force progression)

**📸 Video/Images:**

| Bare Grove | Blooming Grove |
|:---:|:---:|
| ![Bare Grove](images/Screenshot%202025-09-04%20at%2009.36.14.png) | ![Blooming Grove](images/Screenshot%202025-09-04%20at%2009.36.44.png) |

| Movement Anxiety | Rest Affirmation |
|:---:|:---:|
| ![Movement Anxiety](images/Screenshot%202025-09-04%20at%2009.36.55.png) | ![Rest Affirmation](images/Screenshot%20Affirmation.png) |

---

*Part of the quarterly game challenge - creating small, experimental games every three months to explore different themes and mechanics.*