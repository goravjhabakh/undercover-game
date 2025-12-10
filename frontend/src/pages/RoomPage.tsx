import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { socket, type Room, type EliminateResult } from "@/lib/socket"
import { HostLobby } from "@/components/lobby/HostLobby"
import { PlayerLobby } from "@/components/lobby/PlayerLobby"
import { RoleReveal } from "@/components/game/RoleReveal"
import { DescriptionPhase } from "@/components/game/DescriptionPhase"
import { VotingPhase } from "@/components/game/VotingPhase"
import { EliminationReveal } from "@/components/game/EliminationReveal"
import { GameOver } from "@/components/game/GameOver"
import { toast } from "sonner"

// Define game phases
type GamePhase = 'LOBBY' | 'ROLE_REVEAL' | 'GAMEPLAY' | 'VOTING' | 'GAME_OVER';

const RoomPage = () => {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Initialize room state from navigation state if available
  const [room, setRoom] = useState<Room | null>(location.state?.room || null)
  // Local Game State
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
  const [myRole, setMyRole] = useState<{ role: string, word: string } | null>(null);
  const [eliminationResult, setEliminationResult] = useState<EliminateResult | null>(null);
  const [showElimination, setShowElimination] = useState(false);

  // Determine host status
  const isHost = room?.players.find(p => p.socketId === socket.id)?.isHost || false;

  useEffect(() => {
    if (!socket.connected && !room) {
        navigate('/');
        return;
    }

    const handlePlayerDisconnected = ({ socketId }: { socketId: string }) => {
        setRoom(prev => {
            if (!prev) return null;
            return {
                ...prev,
                players: prev.players.filter(p => p.socketId !== socketId)
            };
        });
    };
    
    socket.on('playerJoined', (data) => {
        if (data.player && data.player.socketId) {
             setRoom(prev => {
                if (!prev) return null;
                if (prev.players.some(p => p.socketId === data.player.socketId)) return prev;
                return {
                    ...prev,
                    players: [...prev.players, data.player]
                };
            });
        }
    });

    socket.on('playerDisconnected', handlePlayerDisconnected);

    socket.on('gameStarted', (roomState) => {
        toast.success("Game Started! Identity assigned.");
        setRoom(prev => {
            if (!prev) return null;
            // Merge safe state with existing socketIds
            const mergedPlayers = roomState.players.map(p => {
                const existing = prev.players.find(ep => ep.id === p.id);
                return { ...p, socketId: existing?.socketId || '' };
            });
            
            // Destructure to avoid spreading 'players' which we are replacing
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { players: _incomingPlayers, ...safeStateWithoutPlayers } = roomState;

            return { 
                ...prev, 
                ...safeStateWithoutPlayers, 
                status: 'PLAYING', 
                players: mergedPlayers 
            };
        });
        setPhase('ROLE_REVEAL');
    });

    socket.on('privateRoleReveal', (data) => {
        console.log("Role Revealed:", data);
        setMyRole(data);
    });

    // GAMEPLAY
    socket.on('nextTurn', (data) => {
        // data: { nextTurnIndex: number, newLog: Log, currentStatus: string }
        setRoom(prev => {
            if (!prev) return null;
            return {
                ...prev,
                currentTurnIndex: data.nextTurnIndex,
                logs: [...prev.logs, data.newLog]
            };
        });
    });

    socket.on('voting', (data) => {
        setRoom(prev => {
             if (!prev) return null;
             return {
                 ...prev,
                 status: 'VOTING',
                 logs: data.logs // Update final logs
             };
        });
        setPhase('VOTING');
        toast.info("Voting has started!");
    });

    socket.on('voteResult', (data) => {
        // data: { eliminateResult: EliminateResult, status: string, currentTurnIndex: number }
        const { eliminateResult, status, currentTurnIndex } = data;
        
        // Update room state locally (mark player dead etc if we want, but backend sends safe 'gameStarted' usually? 
        // actually for voteResult we might need to manually update local player list isAlive status)
        
        setRoom(prev => {
            if (!prev) return null;
            
            // If data contains new player state (with roles) and words, use them
            const newPlayers = data.players || prev.players.map(p => {
                if (p.id === eliminateResult.eliminatedId) {
                    return { ...p, isAlive: false };
                }
                return p;
            });
            
            const newWords = data.words || prev.words;
            const winner = eliminateResult.gameResult?.winner || prev.winner;

            return {
                ...prev,
                status: status as Room['status'], 
                currentTurnIndex: currentTurnIndex,
                players: newPlayers,
                words: newWords,
                winner: winner
            };
        });

        setEliminationResult(eliminateResult);
        setShowElimination(true);
    });

    return () => {
        socket.off('playerJoined');
        socket.off('playerDisconnected');
        socket.off('gameStarted');
        socket.off('privateRoleReveal');
        socket.off('nextTurn');
        socket.off('voting');
        socket.off('voteResult');
    }
  }, [navigate, room]);

  const handleStartGame = () => {
    if (room && roomId) {
        socket.emit('startGame', { roomId });
    }
  };

  const handleRoleReady = () => {
      setPhase('GAMEPLAY');
      // If server is already PLAYING (likely), we just sync UI
      if (room && room.status === 'PLAYING') {
          // Already good
      }
  };

  const handleSubmitDescription = (description: string) => {
      if (room && roomId) {
          socket.emit('submitDescription', { roomId, description });
      }
  };

  const handleVote = (votedForId: string) => {
      if (room && roomId) {
          socket.emit('vote', { roomId, votedForId });
      }
  }

  if (!room) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Connecting to secure frequency...</p>
        </div>
    );
  }

  const hostPlayer = room.players.find(p => p.isHost);

  const handleEliminationContinue = () => {
      setShowElimination(false);
      setEliminationResult(null);
      // If the game is effectively over (status is GAME_OVER), we should be seeing GameOver screen now.
      // The socket event updated the room status, so rendering should handle it.
      if (room && room.status === 'GAME_OVER') {
          setPhase('GAME_OVER');
      } else {
          // If not game over, we probably go back to playing (next turn)
          setPhase('GAMEPLAY');
      }
  };
  
  const handleBackToLobby = () => {
      // For now just reload or navigate to home
      navigate('/');
  };

  // 1. Elimination Overlay (High Priority z-index)
  const eliminationOverlay = showElimination && eliminationResult && room ? (
      <EliminationReveal
          eliminatedId={eliminationResult.eliminatedId}
          eliminatedRole={eliminationResult.eliminatedRole as 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null} 
          isTie={eliminationResult.isTie}
          players={room.players}
          onContinue={handleEliminationContinue}
      />
  ) : null;

  // 2. Game Over Screen
  if (phase === 'GAME_OVER' || room.status === 'GAME_OVER') {
       // We need to know who won.
       // We prioritize room.winner if available (from full sync or saved state)
       // Fallback to eliminationResult logic if needed.
       
       const winner = room.winner || eliminationResult?.gameResult?.winner || 'CIVILIAN'; 
       
       return (
           <div className="container mx-auto p-4 pt-8 min-h-[calc(100vh-4rem)]">
               {eliminationOverlay} 
               <GameOver
                   winner={winner}
                   players={room.players}
                   words={room.words} // Room has words!
                   currentUserId={socket.id || ''}
                   onBackToLobby={handleBackToLobby}
               />
           </div>
       )
  }

  // 3. Role Reveal
  if (phase === 'ROLE_REVEAL' && myRole) {
      return (
          <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
              <RoleReveal 
                  word={myRole.word} 
                  onReady={handleRoleReady} 
              />
          </div>
      );
  }

  // 4. Description Phase
  if ((phase === 'GAMEPLAY' || room.status === 'PLAYING') && room.status !== 'VOTING') {
       return (
           <div className="container mx-auto p-4 pt-8 min-h-[calc(100vh-4rem)]">
               {eliminationOverlay}
               <DescriptionPhase
                   roomId={room.id || ''}
                   players={room.players}
                   currentTurnIndex={room.currentTurnIndex}
                   logs={room.logs}
                   currentUserId={socket.id || ''}
                   onSubmitDescription={handleSubmitDescription}
               />
           </div>
       )
  }

  // 5. Voting Phase
  if (phase === 'VOTING' || room.status === 'VOTING') {
      return (
          <div className="container mx-auto p-4 pt-8 min-h-[calc(100vh-4rem)]">
              {eliminationOverlay}
              <VotingPhase
                  players={room.players}
                  currentUserId={socket.id || ''}
                  onVote={handleVote}
              />
          </div>
      )
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
      {isHost ? (
        <HostLobby 
            roomCode={room.id} 
            players={room.players} 
            onStartGame={handleStartGame}
            currentUserId={socket.id || ''}
        />
      ) : (
        <PlayerLobby 
            roomCode={room.id} 
            host={hostPlayer} 
        />
      )}
    </div>
  )
}

export default RoomPage
