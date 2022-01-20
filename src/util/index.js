export function compareStates (stateA, stateB) {
  return stateA.every((value, index) => {
    return value === stateB[index]
  })
}

export function getPosition (index, size) {
  const x = index % size
  const y = Math.floor(index / size)
  return [x, y]
}

export function getDistance (posA, posB) {
  const [xA, yA] = posA
  const [xB, yB] = posB
  // manhattan distance
  return Math.abs(xA - xB) + Math.abs(yA - yB)
}

export function getMovables (state, size) {
  const holeIndex = state.indexOf(size ** 2)
  const holePos = getPosition(holeIndex, size)
  return state.filter((_, index) => {
    const pos = getPosition(index, size)
    return getDistance(pos, holePos) === 1
  })
}

export function previewMove (state, value, size) {
  const valueIndex = state.indexOf(value)
  const holeIndex = state.indexOf(size ** 2)
  const nextState = [...state]
  nextState[valueIndex] = size ** 2
  nextState[holeIndex] = value
  return nextState
}

export function aStar (currentState, targetState, size, useCount) {
  const openList = []
  const closed = {}
  const hierarchy = {}

  function g (state) {
    const hash = state.join()
    return hierarchy[hash].moves
  }

  function h (state) {
    return targetState.reduce((sum, value, index) => {
      if (useCount) {
        // Heuristic 1: number of outgoing cells
        return state.indexOf(value) === index ? sum : sum + 1
      }

      // Heuristic 2: number of total moves
      const currentPos = getPosition(state.indexOf(value), size)
      const targetPos = getPosition(index, size)
      return sum + getDistance(currentPos, targetPos)
    }, 0)
  }

  function f (state) {
    return g(state) + h(state)
  }

  function open (state, previous = null, from = null) {
    const hash = state.join()
    if (!closed[hash]) {
      openList.push([...state])
      hierarchy[hash] = {
        moves: previous ? hierarchy[previous].moves + 1 : 0,
        previous, // previous state hash
        from, // previous move value
      }
    }
  }

  function search () {
    openList.sort((stateA, stateB) => f(stateB) - f(stateA))
    const state = openList.pop()
    const hash = state.join()

    console.log(`Open states: ${openList.length}. Closed states: ${Object.keys(closed).length}. Now searching: [${hash}]`)
    closed[hash] = true

    if (compareStates(state, targetState)) {
      // Solved!
      return generateSolution()
    }

    const attempts = getMovables(state, size)
    attempts.forEach(attempt => {
      const nextState = previewMove(state, attempt, size)
      open(nextState, hash, attempt)
    });

    return search()
  }

  function generateSolution () {
    const targetHash = targetState.join()
    let step = hierarchy[targetHash]
    let steps = []

    while (step && step.previous) {
      steps.unshift(step.from)
      step = hierarchy[step.previous]
    }

    console.log(`Solution: [${steps.join()}] (${steps.length} moves)`)
    return steps
  }

  open(currentState)
  return search()
}
