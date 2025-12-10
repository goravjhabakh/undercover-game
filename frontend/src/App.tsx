import { BrowserRouter, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import LandingPage from "./pages/LandingPage"
import RoomPage from "./pages/RoomPage"

const App = () => {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
export default App