import { Info } from "lucide-react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const Instructions = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors" aria-label="Game Instructions">
          <Info className="size-6 text-primary" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md border-none shadow-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <span>🕵️</span> How to Play
          </DialogTitle>
          <DialogDescription className="text-base">
            Quick guide to surviving the game.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Roles Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="mb-2 p-2 bg-background rounded-full shadow-sm">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="font-bold text-foreground">Civilians</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                You all share the same secret word. Find the outsider!
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/10 border border-secondary/20">
              <div className="mb-2 p-2 bg-background rounded-full shadow-sm">
                <span className="text-2xl">🎭</span>
              </div>
              <h3 className="font-bold text-foreground">Undercover</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                You have a slightly different word. Blend in and don't get caught!
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">The Game Loop</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-sm">Describe Your Word</h4>
                <p className="text-sm text-muted-foreground">
                  Give a one-sentence clue. Don't be too vague, or you'll look suspicious!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-sm">Vote the Imposter</h4>
                <p className="text-sm text-muted-foreground">
                  Discuss who seems odd. The majority vote eliminates a player.
                </p>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Instructions
