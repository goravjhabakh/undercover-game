import { useParams } from "react-router-dom"

const RoomPage = () => {
  const { roomId } = useParams()

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-4xl font-bold mb-4">Room: {roomId}</h1>
      <p className="text-muted-foreground">Game logic will go here.</p>
    </div>
  )
}

export default RoomPage
