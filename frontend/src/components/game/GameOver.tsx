
import type { Player } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Crown, Home } from "lucide-react"

interface GameOverProps {
    winner: 'CIVILIAN' | 'UNDERCOVER';
    players: Player[];
    words: {
        civilian: string | null;
        undercover: string | null;
    };
    currentUserId: string;
    onBackToLobby: () => void;
}

export const GameOver = ({
    winner,
    players,
    words,
    currentUserId,
    onBackToLobby
}: GameOverProps) => {
    
    // Sort players: Winners on top
    const sortedPlayers = [...players].sort((a, b) => {
        // Simple logic: if winner is CIVILIAN, civilians first. 
        // But maybe just keeping them in order or grouping by role is better.
        // Let's just group by role for clarity.
        const roleA = a.role === winner ? 1 : 0;
        const roleB = b.role === winner ? 1 : 0;
        return roleB - roleA;
    });

    return (
        <div className="container max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-8 animate-in fade-in duration-500">
            {/* Winner Banner */}
            <div className={`text-center space-y-4 p-8 rounded-2xl w-full ${
                winner === 'CIVILIAN' ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'
            } border-2`}>
                <div className="flex justify-center">
                    {winner === 'CIVILIAN' ? (
                        <Trophy className="h-24 w-24 text-primary animate-bounce" />
                    ) : (
                        <Crown className="h-24 w-24 text-destructive animate-bounce" />
                    )}
                </div>
                <h1 className={`text-5xl font-black uppercase tracking-tighter ${
                    winner === 'CIVILIAN' ? 'text-primary' : 'text-destructive'
                }`}>
                    {winner === 'CIVILIAN' ? 'Civilians Win!' : 'Undercover Wins!'}
                </h1>
                <p className="text-xl text-muted-foreground uppercase tracking-widest font-semibold">
                    Game Over
                </p>
            </div>

            {/* Word Reveal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Card>
                    <CardHeader className="text-center pb-2">
                        <CardDescription>Civilian Word</CardDescription>
                        <CardTitle className="text-3xl font-bold text-primary">{words.civilian}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="text-center pb-2">
                        <CardDescription>Undercover Word</CardDescription>
                        <CardTitle className="text-3xl font-bold text-destructive">{words.undercover}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Player Roles Reveal */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Role Reveal</CardTitle>
                    <CardDescription>See who was who</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sortedPlayers.map((player) => {
                                const isWinner = (winner === 'CIVILIAN' && player.role === 'CIVILIAN') || 
                                               (winner === 'UNDERCOVER' && player.role === 'UNDERCOVER');
                                const isMe = player.socketId === currentUserId;

                                return (
                                    <div 
                                        key={player.id} 
                                        className={`flex items-center space-x-4 p-3 rounded-lg border ${
                                            isWinner 
                                                ? winner === 'CIVILIAN' ? 'bg-primary/5 border-primary/30' : 'bg-destructive/5 border-destructive/30'
                                                : 'bg-muted/50 border-transparent opacity-60'
                                        }`}
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={player.avatar} />
                                            <AvatarFallback>{player.nickname[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold flex items-center gap-2">
                                                    {player.nickname}
                                                    {isMe && <span className="text-[10px] bg-background border px-1.5 py-0.5 rounded-full text-muted-foreground">YOU</span>}
                                                </p>
                                                {isWinner && <Trophy className="h-4 w-4 text-emerald-500" />}
                                            </div>
                                            <p className={`text-sm font-mono uppercase ${
                                                player.role === 'UNDERCOVER' ? 'text-destructive font-bold' : 'text-primary'
                                            }`}>
                                                {player.role || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={onBackToLobby}>
                        <Home className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                    {/* Ideally host can restart here, but for now simple flow */}
                </CardFooter>
            </Card>
        </div>
    )
}
