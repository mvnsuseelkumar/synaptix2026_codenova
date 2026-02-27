import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Zap, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/'); };
    const isActive = (path) => location.pathname === path;

    const publicLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/features', label: 'Features' },
        { to: '/how-it-works', label: 'How It Works' },
        { to: '/faq', label: 'FAQ' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/10 dark:border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/50 transition-shadow">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">SkillNova</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {!user && publicLinks.map((link) => (
                            <Link key={link.to} to={link.to} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to) ? 'text-violet-400 bg-violet-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link to={`/${user.role}/dashboard`} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                                    <User className="w-4 h-4 text-violet-400" />
                                    <span className="text-sm text-violet-300 hidden sm:block">{user.name}</span>
                                </div>
                                <button onClick={handleLogout} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25">Get Started</Link>
                            </div>
                        )}
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white">
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileOpen && (
                <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 px-4 py-4 space-y-2">
                    {!user && publicLinks.map((link) => (
                        <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all">{link.label}</Link>
                    ))}
                    {!user && (
                        <>
                            <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-violet-400">Sign In</Link>
                            <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-fuchsia-400">Get Started</Link>
                        </>
                    )}
                    {user && (
                        <>
                            <Link to={`/${user.role}/dashboard`} onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-slate-300">Dashboard</Link>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-400">Logout</button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
