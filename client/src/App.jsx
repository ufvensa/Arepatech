import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Events from "./pages/Events.jsx";
import GetInvolved from "./pages/GetInvolved.jsx";
import Resources from "./pages/Resources.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: "24px auto", padding: "0 16px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/get-involved" element={<GetInvolved />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}