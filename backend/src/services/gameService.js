import { getRandomWordPair } from "../lib/word.js";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const assignRolesAndWords = ({ room }) => {
  const { civilian, undercover } = getRandomWordPair({})
  room.words = { civilian, undercover }

  const roles = []
  const { civilians, undercover: undercoverCount } = room.settings
  for (let i=0; i<undercoverCount; i++) roles.push('UNDERCOVER')
  for (let i=0; i<civilians; i++) roles.push('CIVILIAN')

  shuffleArray(room.players)
  shuffleArray(roles)

  room.players = room.players.map((player, index) => {
    const role = roles[index]
    player.role = role
    
    if (role === 'UNDERCOVER') player.word = undercover
    if (role === 'CIVILIAN') player.word = civilian
    return player
  })
  
  room.currentTurnIndex = 0
  return room
}

export const checkWinCondition = ({ room }) => {
  const alive = room.players.filter(player => player.isAlive)
  if (alive.length === 0) return null

  const civilians = alive.filter(p => p.role === 'CIVILIAN').length
  const undercovers = alive.filter(p => p.role === 'UNDERCOVER').length

  if (undercovers === 0 && civilians > 0) return { winner: 'CIVILIAN', status: 'GAME_OVER' }
  if (civilians <= 1 && undercovers > 0) return { winner: 'UNDERCOVER', status: 'GAME_OVER' }
  return null
}

export const findNextSpeakerIndex = ({ room, currentIndex }) => {
  const totalPlayers = room.players.length
  if (totalPlayers === 0) return -1
  
  // Ensure valid start
  if (typeof currentIndex !== 'number' || currentIndex < -1) currentIndex = -1
  
  let nextIndex = (currentIndex + 1) % totalPlayers

  for (let i=0; i<totalPlayers; i++) {
    if (room.players[nextIndex].isAlive) return nextIndex
    nextIndex = (nextIndex + 1) % totalPlayers
  }
  return currentIndex
}

const findEliminationTarget = (players) => {
  const voteCounts = {}
  
  // Count votes
  players.forEach(voter => {
    if (voter.isAlive && voter.votedFor) {
        const targetId = voter.votedFor
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
    }
  })

  let maxVotes = 0
  let maxVotesPlayerIds = []

  // Find player(s) with max votes
  for (const [playerId, count] of Object.entries(voteCounts)) {
     if (count > maxVotes) {
         maxVotes = count
         maxVotesPlayerIds = [playerId]
     } else if (count === maxVotes) {
         maxVotesPlayerIds.push(playerId)
     }
  }

  // Eliminate only if clear majority (no tie for first place)
  if (maxVotesPlayerIds.length === 1 && maxVotes > 0) return maxVotesPlayerIds[0]
  return null
}

export const processVotesAndCheckWin = (room) => {
  const aliveCount = room.players.filter(player => player.isAlive).length

  let eliminateResult = {
    eliminatedId: null,
    eliminatedRole: null,
    isTie: false,
    gameResult: null
  }

  const eliminatedPlayerId = findEliminationTarget(room.players)
  if (eliminatedPlayerId) {
    room.players = room.players.map(player => {
      if (player.id === eliminatedPlayerId) {
        eliminateResult.eliminatedId = eliminatedPlayerId
        eliminateResult.eliminatedRole = player.role
        player.isAlive = false
      }
      player.votedFor = null // Reset vote
      return player
    })
    eliminateResult.gameResult = checkWinCondition({ room })
  } else {
    eliminateResult.isTie = true
    room.players = room.players.map(player => ({ ...player, votedFor: null }))
  }

  if (eliminateResult.gameResult) {
    room.status = 'GAME_OVER'
    room.winner = eliminateResult.gameResult.winner
  } else {
    room.status = 'PLAYING'
    room.lastVotingLogCount = room.logs.length // Mark start of new round
    
    // Determine who starts next round. 
    // It should be the person after the LAST speaker of the previous round.
    // Last speaker is in the last log.
    const lastLog = room.logs[room.logs.length - 1]
    let lastSpeakerIndex = -1
    if (lastLog) {
         lastSpeakerIndex = room.players.findIndex(p => p.id === lastLog.playerId)
    }
    
    // If last speaker invalid (shouldn't happen), default -1
    room.currentTurnIndex = findNextSpeakerIndex({ room, currentIndex: lastSpeakerIndex })
  }

  return { room, eliminateResult }
}