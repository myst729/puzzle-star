<template>
  <div>
    <div class="status">
      <span>Moves: {{ moveCount }}</span>
      <span v-if="moveCount && won">You made it 🎉</span>
      <span v-if="!won">Think think 🧠</span>
    </div>
    <transition-group tag="div" name="game" class="game" :style="{ width: side + 'px', height: side + 'px' }">
      <button
        v-for="value in currentState"
        :key="value"
        :class="['cell', { 'hole': value === hole.value }]"
        :style="{ width: `${cellSide}px`, height: `${cellSide}px` }"
        @click="moveCell(value, true, true)"
      >
        {{ value }}
      </button>
    </transition-group>
    <div class="control">
      <button class="action" @click="shuffle">Shuffle</button>
      <button class="action" @click="solve">Solve</button>
      <button class="action" @click="reset">Reset</button>
    </div>
    <audio ref="block" src="../assets/pooh.mp3"></audio>
    <audio ref="move" src="../assets/phew.mp3"></audio>
    <audio ref="win" src="../assets/win.mp3"></audio>
  </div>
</template>

<script>
import { compareStates, getPosition, getMovables, previewMove, aStar } from '../util/index'
export default {
  name: 'PuzzleGame',
  props: {
    size: Number,
  },
  data () {
    const initialState = Array(this.size ** 2).fill(0).map((_, i) => i + 1)
    return {
      cellSide: 100,
      cellGap: 5,
      initialState,
      currentState: [...initialState],
      moveCount: 0,
    }
  },
  computed: {
    side () {
      return this.size * (this.cellSide + this.cellGap * 2)
    },
    won () {
      return compareStates(this.currentState, this.initialState)
    },
    hole () {
      const value = this.size ** 2
      const index = this.currentState.indexOf(value)
      const [x, y] = getPosition(index, this.size)
      return { value, index, pos: [x, y] }
    },
    movableCells () {
      return getMovables(this.currentState, this.size)
    },
  },
  methods: {
    /* Game */
    resetCount () {
      this.moveCount = 0
    },
    resetState () {
      this.currentState = [...this.initialState]
    },
    moveCell (value, count, sound) {
      if (this.movableCells.indexOf(value) === -1) {
        if (sound) {
          this.$refs.block.play()
        }
        return
      }
      this.currentState = previewMove(this.currentState, value, this.size)
      if (count) {
        this.moveCount++
      }
      if (sound) {
        this.$refs.move.play()
      }
      if (this.won) {
        setTimeout(() => {
          this.$refs.win.play()
        }, 500)
      }
    },
    randomMove (count, sound) {
      const random = Math.floor(Math.random() * this.movableCells.length)
      this.moveCell(this.movableCells[random], count, sound)
    },
    wait (ms) {
      return new Promise(resolve => {
        setTimeout(resolve, ms)
      })
    },
    async playSolution (steps) {
      const [step, ...restSteps] = steps
      this.moveCell(step, true, true)
      if (restSteps.length) {
        await this.wait(240)
        this.playSolution(restSteps)
      }
    },
    /* Control */
    shuffle () {
      let n = 300
      while (n--) {
        this.randomMove(false, false)
      }
      this.resetCount()
      if (this.won) {
        this.shuffle()
      }
    },
    solve () {
      const steps = aStar(this.currentState, this.initialState, this.size, false)
      this.playSolution(steps)
    },
    reset () {
      this.resetState()
      this.resetCount()
    },
    /* Algorithm */
  },
}
</script>

<style scoped>
.status {
  height: 60px;
  font-size: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}
.game {
  background-color: #2c3e50;
  border-radius: 10px;
  padding: 5px;
}
.game-move {
  transition: transform .2s ease-out;
}
.cell {
  background-color: #42b983;
  color: #fff;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  margin: 5px;
  font-size: 36px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  float: left;
}
.cell:active {
  border: 4px solid #333;
  font-size: 32px;
  opacity: .85;
}
.hole {
  visibility: hidden;
  pointer-events: none;
}
.control {
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}
.action {
  background-color: #2c3e50;
  color: #fff;
  border-radius: 5px;
  width: 100px;
  height: 36px;
  font-size: 18px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  border: 0 none;
}
.action:active {
  background-color: #333;
}
</style>
