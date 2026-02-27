import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentOpportunities from './pages/student/Opportunities'
import OpportunityDetail from './pages/student/OpportunityDetail'
import StudentApplications from './pages/student/Applications'
import ApplicationDetail from './pages/student/ApplicationDetail'
import CompanyDashboard from './pages/company/Dashboard'
import NewOpportunity from './pages/company/NewOpportunity'
import EditOpportunity from './pages/company/EditOpportunity'
import Rankings from './pages/company/Rankings'
import AdminDashboard from './pages/admin/Dashboard'
import LoadingSpinner from './components/LoadingSpinner'

function ProtectedRoute({ children, allowedRole }) {
    const { user, loading } = useAuth()
    if (loading) return <LoadingSpinner text="Loading..." />
    if (!user) return <Navigate to="/login" replace />
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />
    return children
}

function AppRoutes() {
    const { user, loading } = useAuth()

    if (loading) return <LoadingSpinner text="Loading application..." />

    return (
        <Routes>
            <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Landing />} />
            <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Register />} />

            {/* Student routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><StudentProfile /></ProtectedRoute>} />
            <Route path="/student/opportunities" element={<ProtectedRoute allowedRole="student"><StudentOpportunities /></ProtectedRoute>} />
            <Route path="/student/opportunities/:id" element={<ProtectedRoute allowedRole="student"><OpportunityDetail /></ProtectedRoute>} />
            <Route path="/student/applications" element={<ProtectedRoute allowedRole="student"><StudentApplications /></ProtectedRoute>} />
            <Route path="/student/applications/:id" element={<ProtectedRoute allowedRole="student"><ApplicationDetail /></ProtectedRoute>} />

            {/* Company routes */}
            <Route path="/company/dashboard" element={<ProtectedRoute allowedRole="company"><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/company/opportunities/new" element={<ProtectedRoute allowedRole="company"><NewOpportunity /></ProtectedRoute>} />
            <Route path="/company/opportunities/:id/edit" element={<ProtectedRoute allowedRole="company"><EditOpportunity /></ProtectedRoute>} />
            <Route path="/company/opportunities/:id/rankings" element={<ProtectedRoute allowedRole="company"><Rankings /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}
