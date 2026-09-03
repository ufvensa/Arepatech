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
import NewsletterAdminRoute from "./components/admin/NewsletterAdminRoute";
import NewsletterDashboard from "./pages/admin/NewsletterDashboard";
import NewNewsletter from "./pages/admin/NewNewsletter";
import NewsletterEditor from "./pages/admin/NewsletterEditor";
import NewsletterPreview from "./pages/admin/NewsletterPreview";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";
import "./newsletter.css";

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
        <Route path="/unsubscribe" element={<NewsletterUnsubscribe />} />
        <Route path="/admin/newsletters" element={<NewsletterAdminRoute><NewsletterDashboard /></NewsletterAdminRoute>} />
        <Route path="/admin/newsletters/new" element={<NewsletterAdminRoute><NewNewsletter /></NewsletterAdminRoute>} />
        <Route path="/admin/newsletters/:id" element={<NewsletterAdminRoute><NewsletterEditor /></NewsletterAdminRoute>} />
        <Route path="/admin/newsletters/:id/preview" element={<NewsletterAdminRoute><NewsletterPreview /></NewsletterAdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
