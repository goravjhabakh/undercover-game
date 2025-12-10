import { createRoom, getRoomById, saveRoom, addSocketMapping } from "../repository/room.js"
import { createPlayer } from "../lib/gameState.js"

export const handleCreateRoom = async (socket, io, payload) => {
  const { nickname, avatar, settings } = payload

  if (!nickname || !settings) {
    socket.emit('error', { message: 'Invalid payload' })
    return
  }
  
  // Normalize settings (tester sends undercovers, we use undercover)
  if (settings.undercovers && !settings.undercover) {
      settings.undercover = settings.undercovers
  }

  if ((settings.civilians + settings.undercover < 3)) {
    socket.emit('error', { message: 'Invalid settings: need at least 3 players' })
    return
  }

  const host = createPlayer({ socketId: socket.id, nickname, avatar, isHost: true })
  const newRoom = await createRoom({ host, settings })

  if (newRoom) {
    socket.join(newRoom.id)
    socket.emit('roomCreated', newRoom)
    console.log(`Room Created: ${newRoom.id} by ${nickname}`)
  } else {
    socket.emit('error', { message: 'Failed to create room' })
    console.log(`Failed to create room for ${nickname}`)
  }
}

export const handleJoinRoom = async(socket, io, payload) => {
  const { nickname, avatar, roomId } = payload
  if (!nickname || !roomId) {
    socket.emit('error', { message: 'Invalid payload' })
    return
  }

  const room = await getRoomById(roomId)
  if (!room) {
    socket.emit('error', { message: 'Room not found' })
    return
  }

  // Game already started
  if (room.status !== 'LOBBY') {
    socket.emit('error', { message: 'Game already started' })
    return
  }

  // Player already joined
  if (room.players.some(p => p.nickname === nickname)) {
    socket.emit('error', { message: 'Nickname already taken' })
    return
  }

  // Max players reached
  if (room.players.length >= room.settings.civilians + room.settings.undercover) {
    socket.emit('error', { message: 'Room is full' })
    return
  }

  const newPlayer = createPlayer({ socketId: socket.id, nickname, avatar })
  room.players.push(newPlayer)

  await addSocketMapping(socket.id, roomId)
  await saveRoom(room)
  socket.join(roomId)
  socket.emit('roomJoined', room)

  io.to(roomId).emit('playerJoined', {
    player: newPlayer,
    count: room.players.length
  })

  console.log(`Player ${nickname} joined room ${roomId}`)
}