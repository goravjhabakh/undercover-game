import redis from '../lib/redis.js'
import { initialRoomState, generateRoomId } from '../lib/gameState.js'

const roomKey = (roomId) => `room:${roomId}`
const roomExpiry = 60 * 60 * 24 // 24hrs

const socketKey = (socketId) => `socket:${socketId}`

export const addSocketMapping = async (socketId, roomId) => {
  await redis.set(socketKey(socketId), roomId, 'EX', roomExpiry)
}

export const removeSocketMapping = async (socketId) => {
  await redis.del(socketKey(socketId))
}

export const createRoom = async({ host, settings }) => {
  let roomId
  let roomData

  do {
    roomId = generateRoomId()
  } while (await redis.exists(roomKey(roomId)))

  roomData = initialRoomState({ host, settings })
  roomData.id = roomId

  const roomJSON = JSON.stringify(roomData)
  const res = await redis.set(roomKey(roomId), roomJSON, 'EX', roomExpiry)

  if (res == 'OK') {
      await addSocketMapping(host.socketId, roomId)
      return roomData
  }
  return null
}

export const getRoomById = async (roomId) => {
  const roomJSON = await redis.get(roomKey(roomId))
  if (!roomJSON) return null
  return JSON.parse(roomJSON)
}

export const saveRoom = async (roomData) => {
  if (!roomData || !roomData.id) throw new Error('Invalid room data for saving')
  
  const roomJSON = JSON.stringify(roomData)
  return await redis.set(roomKey(roomData.id), roomJSON, 'EX', roomExpiry)
}

export const removePlayerBySocketId = async (socketId) => {
  // Optimization: specific lookup instead of scan
  const roomId = await redis.get(socketKey(socketId))
  if (!roomId) return null

  const room = await getRoomById(roomId)
  if (!room) {
      // Clean up dangling socket mapping
      await removeSocketMapping(socketId)
      return null
  }

  const playerIndex = room.players.findIndex(p => p.socketId === socketId)
  if (playerIndex === -1) {
      await removeSocketMapping(socketId) // Should not happen if consistent
      return null
  }

  const player = room.players[playerIndex]
  room.players.splice(playerIndex, 1)
  console.log(`Removed player ${player.nickname} from room ${room.id}`)
  console.log(`Remaining players: ${room.players.length}`)

  await removeSocketMapping(socketId)

  if (room.players.length === 0) {
    console.log(`Room ${room.id} is empty, removing...`)
    await redis.del(roomKey(roomId))
    return roomId
  }

  await saveRoom(room)
  return roomId
}