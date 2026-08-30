import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import PreviousEvents from "./pages/PreviousEvents";
import ExecBoard from "./pages/ExecBoard";
import DevTeam from "./pages/DevTeam";
import GetInvolved from "./pages/GetInvolved";
import Alumni from "./pages/Alumni";
import Mentorship from "./pages/Mentorship";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Directory from "./pages/Directory";
import Calendar from "./pages/Calendar";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/previous-events" element={<PreviousEvents />} />
        <Route path="/exec-board" element={<ExecBoard />} />
        <Route path="/dev-team" element={<DevTeam />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/directory" element={<Directory />} />
      </Routes>
    </BrowserRouter>
  );
}
