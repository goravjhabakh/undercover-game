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