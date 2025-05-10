import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import PostProjectPage from "./pages/client/PostProjectPage";
import MyProjectsPage from "./pages/client/MyProjectsPage";
import FreelancerSearchPage from "./pages/client/FreelancerSearchPage";
import OtpVerification from "./pages/OtpVerification";
import ProjectDetailPage from "./pages/client/ProjectDetailPage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import FreelancerProfilePage from './pages/freelancer/FreelancerProfilePage';
import ClientAnalyticsPage from './pages/client/ClientAnalyticsPage';
import EditProfileSection from './pages/freelancer/EditProfileSection';
import MyBidsPage from './pages/freelancer/MyBidsPage';
import FreelancerProjectsPage from './pages/freelancer/FreelancerProjectsPage';
import FreelancerProjectDetailPage from './pages/freelancer/FreelancerProjectDetailPage';
import BrowseProjectsPage from './pages/freelancer/BrowseProjectsPage';
import VerifyFreelancersPage from './pages/admin/VerifyFreelancersPage';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-phone" element={<OtpVerification />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/post-project" element={<PostProjectPage />} />
        <Route path="/dashboard/my-projects" element={<MyProjectsPage />} />
        <Route
          path="/dashboard/freelancers"
          element={<FreelancerSearchPage />}
        />
        <Route path="/freelancers/:freelancerId" element={<FreelancerProfilePage />} />
        <Route path="/dashboard/freelancer-profile" element={<FreelancerProfilePage />} />
        <Route path="/freelancers/me" element={<FreelancerProfilePage />} />
        <Route path="/freelancers/me/edit" element={<EditProfileSection />} />
        <Route path="/dashboard/messages" element={<MessagesPage />} />
        <Route path="/dashboard/chat/:userId" element={<ChatPage />} />
        <Route path="/dashboard/analytics" element={<ClientAnalyticsPage />} />
        <Route path="/dashboard/my-bids" element={<MyBidsPage />} />
        <Route path="/dashboard/project/:id" element={<ProjectDetailPage />} />
        <Route path="/freelancers/my-projects" element={<FreelancerProjectsPage />} />
        <Route path="/dashboard/projects/:projectId" element={<FreelancerProjectDetailPage />} />
        <Route path="/dashboard/browse-projects" element={<BrowseProjectsPage />} />
        <Route path="/admin/verify-freelancers" element={<VerifyFreelancersPage />} />
      </Routes>

      <ToastContainer />
    </>
  );
}

export default App;
