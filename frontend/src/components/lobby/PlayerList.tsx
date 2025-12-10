import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Player } from "@/lib/socket";

interface PlayerListProps {
  players: Player[];
  currentUserId?: string;
}

export const PlayerList = ({ players, currentUserId }: PlayerListProps) => {
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {players.map((player) => (
                <div 
                    key={player.id} 
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                        player.socketId === currentUserId 
                            ? "bg-primary/10 border-2 border-primary" 
                            : "bg-card hover:bg-card/80 border border-transparent"
                    }`}
                >
                    <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-border shadow-sm">
                            <AvatarImage src={player.avatar} alt={player.nickname} />
                            <AvatarFallback className="text-lg">{player.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {player.isHost && (
                            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                HOST
                            </span>
                        )}
                    </div>
                    <span className="mt-2 text-sm font-semibold truncate max-w-full text-center">
                        {player.nickname} {player.socketId === currentUserId && "(You)"}
                    </span>
                </div>
            ))}
        </div>
    </ScrollArea>
  );
};
