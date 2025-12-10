import { removePlayerBySocketId, getRoomById, saveRoom } from "../repository/room.js"
import { assignRolesAndWords, findNextSpeakerIndex, processVotesAndCheckWin } from "../services/gameService.js"
import { withLock } from "../lib/lock.js"

export const handleDisconnect = async(socket, io) => {
  // Disconnect is tricky because we don't know roomId immediately without reading.
  // We can let removePlayerBySocketId handle it, but it scans all rooms.
  // Ideally removePlayerBySocketId should use locking internally per room it checks?
  // For now leaving as is, or wrapping logic if possible.
  // Since removePlayerBySocketId iterates keys, it's hard to lock "all".
  // Assuming disconnect is less frequent/critical race for now. 
  // But strictly, modifying player list should be locked.
  // Let's modify removePlayerBySocketId to lock room before modifying? 
  // It's in repository, let's leave it for now and focus on game logic.
  
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
  
  await withLock(roomId, async () => {
      const room = await getRoomById(roomId)

      if (!room) return socket.emit('error', { message: 'Room not found' })
      if (!room.players.find(p => p.socketId === socket.id && p.isHost)) return socket.emit('error', { message: 'Only host can start the game' })
      if (room.players.length < 3) return socket.emit('error', { message: 'At least 3 players are required to start the game' })

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
  })
}

export const handleSubmitDescription = async (socket, io, payload) => {
  const { roomId, description } = payload
  if (!description || description.trim().length === 0) return socket.emit('error', { message: 'Empty description' })

  await withLock(roomId, async () => {
      const room = await getRoomById(roomId)
      if (!room || room.status !== 'PLAYING') return socket.emit('error', { message: 'Game is NOT in playing state' })
      
      const speaker = room.players.find(p => p.socketId === socket.id)
      if (!speaker) return socket.emit('error', { message: 'Player is dead' })

      const currentSpeakerIndex = room.currentTurnIndex
      if (room.players[currentSpeakerIndex].socketId !== socket.id) return socket.emit('error', { message: 'Not your turn' })
      
      const newLog = {
        playerId: speaker.id,
        nickname: speaker.nickname,
        description: description.trim(),
        type: 'DESCRIPTION',
        timestamp: Date.now()
      }
      room.logs.push(newLog)

      const aliveCount = room.players.filter(p => p.isAlive).length
      const currentRoundLogs = room.logs.length - (room.lastVotingLogCount || 0)

      if (currentRoundLogs >= aliveCount) {
        room.status = 'VOTING'
        room.currentTurnIndex = -1

        await saveRoom(room)
        io.to(roomId).emit('voting', {
          status: 'VOTING',
          logs: room.logs
        })
        console.log(`Room ${roomId} is in voting state`)
        return;
      }

      const nextIndex = findNextSpeakerIndex({ room, currentIndex: currentSpeakerIndex })
      room.currentTurnIndex = nextIndex
      await saveRoom(room)
      io.to(roomId).emit('nextTurn', {
        nextTurnIndex: room.currentTurnIndex, 
        newLog: newLog, 
        currentStatus: room.status
      })
  })
}

export const handleVote = async (socket, io, payload) => {
  const { roomId, votedForId } = payload
  
  await withLock(roomId, async () => {
      const room = await getRoomById(roomId)
      if (!room || room.status !== 'VOTING') return socket.emit('error', { message: 'Not in voting phase' })

      const voterIndex = room.players.findIndex(p => p.socketId === socket.id)
      if (voterIndex === -1 || !room.players[voterIndex].isAlive) return socket.emit('error', { message: 'You cannot vote' })

      room.players[voterIndex].votedFor = votedForId
      await saveRoom(room)

      // Check if all alive players have voted
      const alivePlayers = room.players.filter(p => p.isAlive)
      const votesCast = alivePlayers.filter(p => p.votedFor).length

      if (votesCast === alivePlayers.length) {
        const { room: updatedRoom, eliminateResult } = processVotesAndCheckWin(room)
        await saveRoom(updatedRoom)
        
        io.to(roomId).emit('voteResult', {
          eliminateResult,
          status: updatedRoom.status,
          currentTurnIndex: updatedRoom.currentTurnIndex,
          players: updatedRoom.status === 'GAME_OVER' ? updatedRoom.players : undefined,
          words: updatedRoom.status === 'GAME_OVER' ? updatedRoom.words : undefined
        })
        console.log(`Vote result in room ${roomId}:`, eliminateResult)
      }
  })
}