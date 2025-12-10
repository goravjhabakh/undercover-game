import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface RoleRevealProps {
  word: string;
  onReady: () => void;
}

export const RoleReveal = ({ word, onReady }: RoleRevealProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [countdown, setCountdown] = useState(10); // Auto-start after 10s if user doesn't click

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-ready after countdown
      onReady();
    }
  }, [countdown, onReady]);

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Card className="border-4 border-primary/20 shadow-2xl bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary via-secondary to-primary animate-pulse" />
            
            <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl font-black uppercase tracking-widest text-primary">
                    Secret Identity
                </CardTitle>
                <CardDescription className="text-lg">
                    Memorize your word. Do not share it explicitly!
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center space-y-8 py-8">
                
                <div 
                    className="relative cursor-pointer group perspective-1000"
                    onClick={toggleReveal}
                >
                    <div className={`
                        w-64 h-40 rounded-xl flex items-center justify-center transition-all duration-500 transform-style-3d border-2 shadow-inner
                        ${isRevealed 
                            ? "bg-primary/10 border-primary rotate-x-0" 
                            : "bg-muted/80 border-dashed border-muted-foreground hover:bg-muted rotate-x-12 hover:rotate-x-0"
                        }
                    `}>
                        {isRevealed ? (
                            <div className="text-center space-y-2 animate-in fade-in zoom-in duration-300">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                                    Your Word
                                </p>
                                <h2 className="text-4xl font-black text-foreground drop-shadow-sm">
                                    {word}
                                </h2>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                <Eye className="w-12 h-12" />
                                <span className="font-bold text-sm tracking-wider">TAP TO REVEAL</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 w-full text-center">
                    <Button 
                        size="lg" 
                        onClick={onReady}
                        className="w-full max-w-sm font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        I'm Ready
                    </Button>
                    <p className="text-xs text-muted-foreground font-mono">
                        Auto-starting in {countdown}s
                    </p>
                </div>

            </CardContent>
        </Card>
    </div>
  );
};
