const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

const createPlayer = ({ socketId, nickname, avatar, isHost= false }) => ({
  socketId,
  id: Math.random().toString(36).substring(2, 9),
  nickname,
  avatar,
  isHost,
  role: null,
  word: null,
  isAlive: true
})

const initialRoomState = ({ host, settings }) => ({
  id: generateRoomId(),
  status: 'LOBBY',
  createdAt: Date.now(),
  settings,
  players: [host],

  currentTurnIndex: 0,
  words: {
    civilian: null,
    undercover: null
  },
  logs: [],
  lastVotingLogCount: 0
})

export { generateRoomId, createPlayer, initialRoomState }