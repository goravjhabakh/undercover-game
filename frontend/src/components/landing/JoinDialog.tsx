import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserInfo } from '@/types/user';
import { socket } from '@/lib/socket';

interface JoinDialogProps {
  userInfo: UserInfo;
  isOpen: boolean;
  onClose: () => void;
}

const JoinDialog = ({ userInfo, isOpen, onClose }: JoinDialogProps) => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = () => {
    if (!userInfo.nickname.trim()) {
      setError("We need a codename first!");
      return;
    }
    if (!roomId.trim()) {
        setError("Please enter a room ID.");
        return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.off('roomJoined');
    socket.off('error');

    socket.once('roomJoined', (room) => {
      console.log('Access granted. Entering room:', room.id);
      navigate(`/room/${room.id}`, { state: { room } });
      onClose();
    });

    socket.once('error', (err) => {
      console.error('Access denied:', err);
      setError(err.message || 'Failed to join room');
    });

    socket.emit('joinRoom', {
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
      roomId: roomId.toUpperCase()
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] **:data-[slot=dialog-close]:focus:ring-secondary">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-secondary">Join Game</DialogTitle>
          <DialogDescription>
            Enter the secret code to join an existing squad.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roomId" className="text-right font-semibold">
              Room ID
            </Label>
            <Input
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Ex. ABCD"
              className="col-span-3 font-mono uppercase tracking-widest placeholder:tracking-normal focus-visible:border-secondary focus-visible:ring-secondary/50"
              maxLength={4}
            />
          </div>
            
            {error && (
              <p className="text-sm text-destructive text-center font-medium">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="focus-visible:ring-secondary">Cancel</Button>
          <Button onClick={handleJoinRoom} variant="secondary" className="w-full sm:w-auto font-bold">
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinDialog;
