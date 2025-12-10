import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerList } from "./PlayerList";
import type { Player } from "@/lib/socket";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface HostLobbyProps {
  roomCode: string;
  players: Player[];
  onStartGame: () => void;
  currentUserId?: string;
}

export const HostLobby = ({ roomCode, players, onStartGame, currentUserId }: HostLobbyProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Room code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary drop-shadow-sm">
            Lobby
        </h1>
        <p className="text-xl text-muted-foreground">
            Waiting for players to join...
        </p>
      </div>

      <Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground uppercase tracking-widest">
                Room Code
            </CardTitle>
            <div 
                className="flex items-center justify-center gap-4 text-5xl font-black text-foreground tracking-widest cursor-pointer hover:text-primary transition-colors group"
                onClick={copyToClipboard}
            >
                {roomCode}
                {copied ? (
                    <Check className="w-6 h-6 text-green-500 animate-in zoom-in duration-200" />
                ) : (
                    <Copy className="w-6 h-6 text-muted-foreground group-hover:text-primary opacity-50 group-hover:opacity-100 transition-all" />
                )}
            </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-semibold text-lg">Active Players ({players.length})</h3>
                <span className="text-xs text-muted-foreground animate-pulse">Scanning for players...</span>
            </div>
            <PlayerList players={players} currentUserId={currentUserId} />
        </CardContent>
        <CardFooter className="flex justify-center pt-6 pb-8">
            <Button 
                size="lg" 
                className="w-full max-w-sm text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                onClick={onStartGame}
                disabled={players.length < 3}
            >
                {players.length < 3 ? `Need ${3 - players.length} more players` : "Start Game"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
