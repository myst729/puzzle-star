<template>
  <div class="app">
    <PuzzleGame :size="3" />
  </div>
</template>

<script>
import PuzzleGame from './components/PuzzleGame.vue'
export default {
  name: 'App',
  components: {
    PuzzleGame,
  },
}
</script>

<style scoped>
.app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0 auto;
  display: flex;
  user-select: none;
  justify-content: center;
  align-items: center;
  height: 90vh;
}
</style>
