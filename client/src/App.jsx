import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import ExecBoard from "./pages/ExecBoard";
import DevTeam from "./pages/DevTeam";
import GetInvolved from "./pages/GetInvolved";
import Alumni from "./pages/Alumni";
import Mentorship from "./pages/Mentorship";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import Resources from "./pages/Resources";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/exec-board" element={<ExecBoard />} />
        <Route path="/dev-team" element={<DevTeam />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </BrowserRouter>
  );
}