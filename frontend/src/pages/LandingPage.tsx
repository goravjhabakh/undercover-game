import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import HostDialog from "../components/landing/HostDialog"
import JoinDialog from "../components/landing/JoinDialog"

const LandingPage = () => {
  const [nickname, setNickname] = useState('')
  const [isHostOpen, setIsHostOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  // Generate a random seed for the avatar if nickname is empty, otherwise use nickname
  // This allows the avatar to be consistent for a name, but random initially
  const [randomSeed] = useState(() => Math.random().toString(36).substring(7));
  const avatarSeed = nickname || randomSeed;

  const avatar = useMemo(() => {
    return createAvatar(micah, {
      seed: avatarSeed,
      radius: 50,
      backgroundColor: ["b6e3f4","c0aede","d1d4f9","ffdfbf","ffd5dc"],
    }).toDataUri(); 
  }, [avatarSeed]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4">
      <div className="w-full max-w-sm space-y-8 text-center bg-card p-8 rounded-2xl shadow-xl border border-border/50">
        
        {/* Title */}
        <div className="space-y-2">
           <h1 className="text-4xl font-black text-primary tracking-widest uppercase">
             Undercover
           </h1>
           <p className="text-muted-foreground text-sm">Can you find the imposter?</p>
        </div>

        {/* Avatar */}
        <div className="relative mx-auto size-32 rounded-full overflow-hidden border-4 border-background shadow-lg ring-4 ring-primary/20 transition-transform duration-500 hover:scale-105">
           <img 
             src={avatar} 
             alt="Agent Avatar" 
             className="size-full object-cover"
           />
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="relative">
             <Input 
                type="text" 
                placeholder="Enter Nickname" 
                className="text-center text-lg h-12 font-bold tracking-wide"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
             />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
             <Button 
                size="lg" 
                variant="default"
                className="w-full font-bold"
                onClick={() => setIsHostOpen(true)}
             >
                HOST GAME
             </Button>
             <Button 
                size="lg" 
                variant="secondary"
                className="w-full font-bold"
                onClick={() => setIsJoinOpen(true)}
             >
                JOIN GAME
             </Button>
          </div>
        </div>

      </div>

      <HostDialog 
        isOpen={isHostOpen} 
        onClose={() => setIsHostOpen(false)} 
        userInfo={{ nickname, avatar }}
      />
      
      <JoinDialog 
        isOpen={isJoinOpen} 
        onClose={() => setIsJoinOpen(false)} 
        userInfo={{ nickname, avatar }}
      />
    </div>
  )
}

export default LandingPage