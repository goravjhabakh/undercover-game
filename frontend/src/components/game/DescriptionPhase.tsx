import { useState } from "react"
import type { Player, Log } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DescriptionPhaseProps {
    roomId: string;
    players: Player[];
    currentTurnIndex: number;
    logs: Log[];
    currentUserId: string;
    onSubmitDescription: (description: string) => void;
}

export const DescriptionPhase = ({
    players,
    currentTurnIndex,
    logs,
    currentUserId,
    onSubmitDescription
}: DescriptionPhaseProps) => {
    const [description, setDescription] = useState("")

    const currentPlayer = players[currentTurnIndex];
    const isMyTurn = currentPlayer?.socketId === currentUserId;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onSubmitDescription(description);
            setDescription("");
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Player List / Turn Order */}
                <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Turn Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {players.filter(p => p.isAlive).map((player) => {
                                    const isCurrent = players.indexOf(player) === currentTurnIndex;
                                    return (
                                        <div 
                                            key={player.id} 
                                            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                                                isCurrent 
                                                    ? "bg-primary/10 border border-primary/20" 
                                                    : "opacity-70"
                                            }`}
                                        >
                                            <Avatar className={isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}>
                                                <AvatarImage src={player.avatar} />
                                                <AvatarFallback>{player.nickname[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate text-sm">
                                                    {player.nickname} 
                                                    {player.socketId === currentUserId && " (You)"}
                                                </p>
                                                {isCurrent && (
                                                    <p className="text-xs text-primary animate-pulse">Describing...</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Main Action Area */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                         <CardHeader>
                            <CardTitle>Game Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                                {logs.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        The game has just begun. Waiting for the first description...
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {logs.map((log, i) => (
                                            <div key={i} className="flex flex-col space-y-1">
                                                <div className="flex items-center space-x-2">
                                                     <span className="font-bold text-primary">{log.nickname}</span>
                                                     <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-foreground pl-2 border-l-2 border-border">{log.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            {isMyTurn ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Your Turn</label>
                                        <Input 
                                            placeholder="Describe your word..." 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            autoFocus
                                            className="bg-background"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={!description.trim()}>
                                        Submit Description
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    Waiting for {currentPlayer?.nickname} to describe...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
