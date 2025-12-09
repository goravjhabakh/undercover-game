import { getRandomWordPair } from "../lib/word.js";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const assignRolesAndWords = ({ room }) => {
  const { civilian, undercover } = getRandomWordPair()
  room.words = { civilian, undercover }

  const roles = []
  const { civilians, undercovers } = room.settings
  for (let i=0; i<undercovers; i++) roles.push('UNDERCOVER')
  for (let i=0; i<civilians; i++) roles.push('CIVILIAN')

  shuffleArray(room.players)
  shuffleArray(roles)

  room.players = room.players.map((player, index) => {
    const role = roles[index]
    player.role = role
    
    if (role === 'UNDERCOVER') player.word = undercover
    if (role === 'CIVILIAN') player.word = civilian
    return player
  })
  return room
}