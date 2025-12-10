
import type { Player } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skull, Meh } from "lucide-react"

interface EliminationRevealProps {
    eliminatedId: string | null;
    eliminatedRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
    isTie: boolean;
    players: Player[];
    onContinue: () => void;
}

export const EliminationReveal = ({
    eliminatedId,
    eliminatedRole,
    isTie,
    players,
    onContinue
}: EliminationRevealProps) => {
    
    // Find eliminated player details
    const eliminatedPlayer = players.find(p => p.id === eliminatedId);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-2 shadow-2xl animate-in zoom-in-95 duration-300">
                <CardHeader className="text-center space-y-2">
                    {isTie ? (
                        <>
                            <div className="mx-auto bg-muted p-4 rounded-full w-fit mb-2">
                                <Meh className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-2xl font-bold">It's a Tie!</CardTitle>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto bg-destructive/20 p-4 rounded-full w-fit mb-2">
                                <Skull className="h-10 w-10 text-destructive animate-pulse" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-destructive">
                                Player Eliminated
                            </CardTitle>
                        </>
                    )}
                </CardHeader>
                
                <CardContent className="text-center space-y-6">
                    {isTie ? (
                        <p className="text-lg text-muted-foreground">
                            The vote was split. No one was eliminated this round.
                        </p>
                    ) : (
                        eliminatedPlayer && (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center space-y-2">
                                    <Avatar className="h-24 w-24 border-4 border-destructive">
                                        <AvatarImage src={eliminatedPlayer.avatar} />
                                        <AvatarFallback>{eliminatedPlayer.nickname[0]}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-xl font-bold">{eliminatedPlayer.nickname}</h3>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Their role was:</p>
                                    <p className="text-2xl font-black uppercase tracking-widest text-primary">
                                        {eliminatedRole}
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </CardContent>

                <CardFooter>
                    <Button onClick={onContinue} size="lg" className="w-full">
                        Continue
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
