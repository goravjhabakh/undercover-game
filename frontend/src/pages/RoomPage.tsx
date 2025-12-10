import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { socket, type Room } from "@/lib/socket"
import { HostLobby } from "@/components/lobby/HostLobby"
import { PlayerLobby } from "@/components/lobby/PlayerLobby"
import { toast } from "sonner"

const RoomPage = () => {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Initialize room state from navigation state if available
  const [room, setRoom] = useState<Room | null>(location.state?.room || null)
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
                // Avoid duplicates
                if (prev.players.some(p => p.socketId === data.player.socketId)) return prev;
                return {
                    ...prev,
                    players: [...prev.players, data.player]
                };
            });
        }
    });

    socket.on('playerDisconnected', handlePlayerDisconnected);

    socket.on('gameStarted', () => {
        toast.success("Game Started!");
        setRoom(prev => prev ? { ...prev, status: 'PLAYING' } : null);
    });

    return () => {
        socket.off('playerJoined');
        socket.off('playerDisconnected');
        socket.off('gameStarted');
    }
  }, [navigate, room]);

  const handleStartGame = () => {
    if (room && roomId) {
        socket.emit('startGame', { roomId });
    }
  };

  if (!room) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Connecting to secure frequency...</p>
        </div>
    );
  }

  const hostPlayer = room.players.find(p => p.isHost);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
      {isHost ? (
        <HostLobby 
            roomCode={room.id} 
            players={room.players} 
            onStartGame={handleStartGame}
            currentUserId={socket.id}
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
