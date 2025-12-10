import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Player } from "@/lib/socket";
import { Loader2 } from "lucide-react";

interface PlayerLobbyProps {
  roomCode: string;
  host: Player | undefined;
}

export const PlayerLobby = ({ roomCode, host }: PlayerLobbyProps) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
            Lobby
        </h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for host to start...</span>
        </div>
      </div>

      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <CardHeader className="text-center space-y-1 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Room Code
            </CardTitle>
            <div className="text-4xl font-black tracking-widest text-foreground">
                {roomCode}
            </div>
        </CardHeader>

        <CardContent className="pt-8 pb-10 space-y-8">
            <div className="flex flex-col items-center space-y-4">
                <span className="text-sm font-medium text-muted-foreground">Host</span>
                
                {host ? (
                    <div className="flex flex-col items-center space-y-3 p-6 bg-muted/20 rounded-2xl w-full border border-border/50">
                        <div className="relative">
                            <Avatar className="w-24 h-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
                                <AvatarImage src={host.avatar} alt={host.nickname} />
                                <AvatarFallback className="text-2xl">{host.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            </span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-foreground">{host.nickname}</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wide">Host</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                        Connecting to host...
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
