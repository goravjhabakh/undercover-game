
import { useState } from "react"
import type { Player } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface VotingPhaseProps {
    players: Player[];
    currentUserId: string;
    onVote: (playerId: string) => void;
}

export const VotingPhase = ({
    players,
    currentUserId,
    onVote
}: VotingPhaseProps) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = () => {
        if (selectedPlayerId) {
            onVote(selectedPlayerId);
            setHasVoted(true);
        }
    }

    const alivePlayers = players.filter(p => p.isAlive);
    const myPlayer = players.find(p => p.socketId === currentUserId);
    const amIAlive = myPlayer?.isAlive;

    if (!amIAlive) {
        return (
             <div className="w-full max-w-2xl mx-auto text-center space-y-6">
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center justify-center gap-2">
                            <AlertCircle className="h-6 w-6" />
                            You are Eliminated
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You can watch the voting but cannot participate.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (hasVoted) {
         return (
             <div className="w-full max-w-2xl mx-auto text-center space-y-6">
                <Card className="border-primary/50 bg-primary/10">
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-6 w-6" />
                            Vote Submitted
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Waiting for other players to vote...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Voting Phase</h2>
                <p className="text-muted-foreground">Who is the Undercover? Select a player to eliminate.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {alivePlayers.map((player) => {
                    const isSelected = selectedPlayerId === player.id;
                    const isMe = player.socketId === currentUserId;

                    return (
                        <Card 
                            key={player.id}
                            className={`cursor-pointer transition-all hover:scale-105 ${
                                isSelected 
                                    ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" 
                                    : "border-border/50 hover:border-primary/50"
                            } ${isMe ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                            onClick={() => !isMe && setSelectedPlayerId(player.id)}
                        >
                            <CardContent className="flex flex-col items-center p-6 space-y-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={player.avatar} />
                                    <AvatarFallback>{player.nickname[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <p className="font-bold truncate max-w-[120px]">{player.nickname}</p>
                                    {isMe && <span className="text-xs text-muted-foreground">(You)</span>}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="flex justify-center pt-8">
                <Button 
                    size="lg" 
                    disabled={!selectedPlayerId} 
                    onClick={handleVote}
                    className="w-full max-w-md text-lg h-12"
                >
                    Cast Vote
                </Button>
            </div>
        </div>
    )
}
