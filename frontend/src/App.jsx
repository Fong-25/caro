import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import PvPgame from "./pages/PvPgame"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path='/play/:roomId' element={<PvPgame />} />
      </Routes>
    </Router>
  )
};

export default App
