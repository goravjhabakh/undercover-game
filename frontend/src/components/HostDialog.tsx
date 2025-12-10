import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserInfo } from '@/types/user';
import { socket } from '@/lib/socket';

interface HostDialogProps {
  userInfo: UserInfo;
  isOpen: boolean;
  onClose: () => void;
}

const HostDialog = ({ userInfo, isOpen, onClose }: HostDialogProps) => {
  const navigate = useNavigate();
  const [civilians, setCivilians] = useState(3);
  const [undercover, setUndercover] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const totalPlayers = civilians + undercover;

  const handleCreateRoom = () => {
    if (!userInfo.nickname.trim()) {
        setError("Please enter a nickname first!");
        return;
    }

    if (!socket.connected) {
      socket.connect();
    }
    
    // Cleanup any existing listeners to avoid duplicates if this fails and they retry
    socket.off('roomCreated');
    socket.off('error');

    socket.once('roomCreated', (room) => {
      console.log('Mission control established. Room ID:', room.id);
      navigate(`/room/${room.id}`, { state: { room } });
      onClose(); // Just in case, though nav usually unmounts
    });

    socket.once('error', (err) => {
      console.error('Mission aborted:', err);
      setError(err.message || 'Failed to create room');
      // Keep socket open maybe? Or disconnect? let's keep it open for retry for now
    });

    socket.emit('createRoom', {
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
      settings: {
        civilians,
        undercover
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Host Game</DialogTitle>
           <DialogDescription>
            Configure your squad. You need at least 3 players.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="civilians" className="text-right font-semibold">
              Civilians
            </Label>
            <Input
              id="civilians"
              value={civilians}
              onChange={(e) => setCivilians(Math.max(0, parseInt(e.target.value) || 0))}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="undercover" className="text-right font-semibold">
              Undercover
            </Label>
            <Input
              id="undercover"
              value={undercover}
              onChange={(e) => setUndercover(Math.max(0, parseInt(e.target.value) || 0))}
              className="col-span-3"
            />
          </div>

          {error && (
              <p className="text-sm text-destructive text-center font-medium">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="hover:bg-muted text-muted-foreground">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRoom}
            disabled={totalPlayers < 3 || civilians < 1 || undercover < 1}
            className="w-full sm:w-auto"
          >
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HostDialog;
