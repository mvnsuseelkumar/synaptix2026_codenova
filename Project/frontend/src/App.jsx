import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Features from './pages/public/Features';
import HowItWorks from './pages/public/HowItWorks';
import FAQ from './pages/public/FAQ';
import Contact from './pages/public/Contact';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ApplicantDashboard from './pages/applicant/Dashboard';
import Profile from './pages/applicant/Profile';
import Skills from './pages/applicant/Skills';
import Jobs from './pages/applicant/Jobs';
import Applications from './pages/applicant/Applications';
import Recommendations from './pages/applicant/Recommendations';

import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import Listings from './pages/recruiter/Listings';
import Rankings from './pages/recruiter/Rankings';
import Analytics from './pages/recruiter/Analytics';

function DashboardLayout() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] pt-16">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Register />} />

      <Route path="/applicant" element={<ProtectedRoute role="applicant"><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<ApplicantDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="skills" element={<Skills />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="applications" element={<Applications />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      <Route path="/recruiter" element={<ProtectedRoute role="recruiter"><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="listings" element={<Listings />} />
        <Route path="rankings" element={<Rankings />} />
        <Route path="analytics" element={<Analytics />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-950">
            <Navbar />
            <AppRoutes />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
