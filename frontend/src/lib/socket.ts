import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.NODE_ENV === 'production' ? 'https://undercover-game-3yjq.onrender.com' : 'http://localhost:3000'

export interface Player {
  socketId: string;
  id: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  isAlive: boolean;
  role?: 'CIVILIAN' | 'UNDERCOVER' | null;
  word?: string | null;
  votedFor?: string | null;
}

export interface Log {
  playerId: string;
  nickname: string;
  description: string;
  type: 'DESCRIPTION';
  timestamp: number;
}

export interface RoomSettings {
  civilians: number;
  undercover: number;
}

export interface Room {
  id: string;
  status: 'LOBBY' | 'PLAYING' | 'VOTING' | 'GAME_OVER';
  createdAt: number;
  settings: RoomSettings;
  players: Player[];
  currentTurnIndex: number;
  words: {
    civilian: string | null;
    undercover: string | null;
  };
  logs: Log[];
  lastVotingLogCount: number;
}

export interface SafeRoomState {
  id: string;
  status: 'LOBBY' | 'PLAYING' | 'VOTING' | 'GAME_OVER';
  players: {
      id: string;
      nickname: string;
      avatar: string;
      isAlive: boolean;
      isHost: boolean;
  }[];
  currentTurnIndex: number;
}

export interface EliminateResult {
  eliminatedId: string | null;
  eliminatedRole: 'CIVILIAN' | 'UNDERCOVER' | null;
  isTie: boolean;
  gameResult: { winner: 'CIVILIAN' | 'UNDERCOVER', status: 'GAME_OVER' } | null;
}

export interface ServerToClientEvents {
  roomCreated: (room: Room) => void;
  error: (data: { message: string }) => void;
  roomJoined: (room: Room) => void;
  playerJoined: (data: { player: { nickname: string, avatar: string }, count: number }) => void;
  playerDisconnected: (data: { socketId: string, count: number }) => void;
  gameStarted: (roomState: SafeRoomState) => void;
  privateRoleReveal: (data: { role: string, word: string }) => void;
  voting: (data: { status: 'VOTING', logs: Log[] }) => void;
  nextTurn: (data: { nextTurnIndex: number, newLog: Log, currentStatus: string }) => void;
  voteResult: (data: { eliminateResult: EliminateResult, status: string, currentTurnIndex: number }) => void;
}

export interface ClientToServerEvents {
  createRoom: (payload: { nickname: string, avatar: string, settings: RoomSettings }) => void;
  joinRoom: (payload: { nickname: string, avatar: string, roomId: string }) => void;
  startGame: (payload: { roomId: string }) => void;
  submitDescription: (payload: { roomId: string, description: string }) => void;
  vote: (payload: { roomId: string, votedForId: string }) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL);

