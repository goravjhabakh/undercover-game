import { handleCreateRoom, handleJoinRoom } from "../controllers/room.js";
import redis from "./redis.js";
import { Server } from "socket.io";
import { handleDisconnect, handleStartGame } from "../controllers/game.js";

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    redis.get('health-check').then(res => {
      console.log(`Redis health check key: ${res}`)
      redis.set('health-check', Date.now())
    }).catch(err => {
      console.error(`Redis health check error: ${err}`)
    })

    socket.on('createRoom', (payload) => handleCreateRoom(socket, io, payload))
    socket.on('joinRoom', (payload) => handleJoinRoom(socket, io, payload))
    socket.on('startGame', (payload) => handleStartGame(socket, io, payload))

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
      handleDisconnect(socket, io)
    })
  })

  return io
}

export default initSocket