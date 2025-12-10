export interface UserInfo {
  nickname: string,
  avatar: string,
  socketId?: string
}

export interface Settings {
  civilians: number,
  undercover: number
}