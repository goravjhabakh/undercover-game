import redis from '../lib/redis.js'
import { initialRoomState, generateRoomId } from '../lib/gameState.js'

const roomKey = (roomId) => `room:${roomId}`
const roomExpiry = 60 * 60 * 24 // 24hrs

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

  if (res == 'OK') return roomData
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
  const keys = await redis.keys(roomKey('*'))

  for (const key of keys) {
    const roomJSON = await redis.get(key)
    if (!roomJSON) continue

    const room = JSON.parse(roomJSON)
    const playerIndex = room.players.findIndex(p => p.socketId === socketId)
    if (playerIndex === -1) continue

    const player = room.players[playerIndex]
    room.players.splice(playerIndex, 1)
    console.log(`Removed player ${player.nickname} from room ${room.id}`)
    console.log(`Remaining players: ${room.players.length}`)

    if (room.players.length === 0) {
      console.log(`Room ${room.id} is empty, removing...`)
      await redis.del(key)
      return room.id
    }

    await saveRoom(room)
    return room.id
  }
  return null
}