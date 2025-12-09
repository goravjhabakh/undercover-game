import { removePlayerBySocketId, getRoomById, saveRoom } from "../repository/room.js"
import { assignRolesAndWords } from "../services/gameService.js"

export const handleDisconnect = async(socket, io) => {
  const roomId = await removePlayerBySocketId(socket.id)
  if (roomId) {
    const room = await getRoomById(roomId)
    if (room) {
      io.to(roomId).emit('playerDisconnected', {
        socketId: socket.id,
        count: room.players.length
      })
    }
  }
}

export const handleStartGame = async (socket, io, payload) => {
  const { roomId } = payload
  const room = await getRoomById(roomId)

  if (!room) return socket.emit('error', { message: 'Room not found' })
  if (!room.players.find(p => p.socketId === socket.id && p.isHost)) return socket.emit('error', { message: 'Only host can start the game' })
  if (room.players.length < 4) return socket.emit('error', { message: 'At least 4 players are required to start the game' })

  const updatedRoom = assignRolesAndWords({ room })
  updatedRoom.status = 'PLAYING'
  await saveRoom(updatedRoom)

  const safeRoomState = {
    id: updatedRoom.id,
    status: updatedRoom.status,
    players: updatedRoom.players.map(p => ({
      id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      isAlive: p.isAlive,
      isHost: p.isHost
    })),
    currentTurnIndex: updatedRoom.currentTurnIndex,
  }

  io.to(roomId).emit('gameStarted', safeRoomState)
  updatedRoom.players.forEach(player => {
    io.to(player.socketId).emit('privateRoleReveal', {
      role: player.role,
      word: player.word,
    })
  })

  console.log(`Game started for room ${roomId}. Civilian word: ${updatedRoom.words.civilian}, Undercover word: ${updatedRoom.words.undercover}`)
}