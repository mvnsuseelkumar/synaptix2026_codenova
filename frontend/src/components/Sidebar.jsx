import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from './NotificationBell'
import {
    LayoutDashboard, User, Briefcase, FileText, Bell,
    PlusCircle, BarChart3, Shield, LogOut, Menu, X, Sparkles,
} from 'lucide-react'

const studentNav = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'My Profile' },
    { to: '/student/opportunities', icon: Briefcase, label: 'Opportunities' },
    { to: '/student/applications', icon: FileText, label: 'Applications' },
]

const companyNav = [
    { to: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/company/opportunities/new', icon: PlusCircle, label: 'Post Opportunity' },
]

const adminNav = [
    { to: '/admin/dashboard', icon: Shield, label: 'Admin Panel' },
]

export default function Sidebar({ children }) {
    const { user, logoutUser } = useAuth()
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()

    const navItems = user?.role === 'student' ? studentNav
        : user?.role === 'company' ? companyNav
            : user?.role === 'admin' ? adminNav
                : []

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className={`bg-surface border-r border-slate-700 flex flex-col transition-all duration-300 shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
                {/* Logo */}
                <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shrink-0">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    {!collapsed && <span className="text-lg font-bold text-white">InternMatch</span>}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto text-slate-400 hover:text-white transition-colors lg:block hidden"
                    >
                        {collapsed ? <Menu size={18} /> : <X size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`
                            }
                        >
                            <item.icon size={20} className="shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-3 border-t border-slate-700">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-[10px] text-muted capitalize">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logoutUser}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-slate-700 rounded-lg"
            >
                <Menu size={20} className="text-white" />
            </button>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto bg-background">
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-slate-700/50 px-6 py-3 flex justify-end">
                    <NotificationBell />
                </div>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
