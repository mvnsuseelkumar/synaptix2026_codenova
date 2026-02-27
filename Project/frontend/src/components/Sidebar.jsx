import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, User, Briefcase, FileText, Star, BarChart3, PlusCircle, Users, Target } from 'lucide-react';

const applicantLinks = [
    { to: '/applicant/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/applicant/profile', icon: User, label: 'Profile Builder' },
    { to: '/applicant/skills', icon: Target, label: 'Skill Manager' },
    { to: '/applicant/jobs', icon: Briefcase, label: 'Job Listings' },
    { to: '/applicant/applications', icon: FileText, label: 'Applications' },
    { to: '/applicant/recommendations', icon: Star, label: 'AI Recommendations' },
];

const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recruiter/post-job', icon: PlusCircle, label: 'Post Job' },
    { to: '/recruiter/listings', icon: Briefcase, label: 'Manage Listings' },
    { to: '/recruiter/rankings', icon: Users, label: 'Candidate Rankings' },
    { to: '/recruiter/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
    const { user } = useAuth();
    const location = useLocation();
    const links = user?.role === 'recruiter' ? recruiterLinks : applicantLinks;

    return (
        <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-white/5 dark:bg-slate-900/50 backdrop-blur-sm border-r border-white/10 dark:border-slate-700/50 pt-4 px-3">
            <div className="px-3 mb-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                    {user?.role === 'recruiter' ? 'Recruiter Panel' : 'Job Seeker Portal'}
                </p>
            </div>
            <nav className="flex-1 space-y-1">
                {links.map((link) => {
                    const active = location.pathname === link.to;
                    const Icon = link.icon;
                    return (
                        <Link key={link.to} to={link.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                            <Icon className={`w-4 h-4 ${active ? 'text-violet-400' : ''}`} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                    <p className="text-xs text-violet-300 font-medium">SkillNova v1.0</p>
                    <p className="text-xs text-slate-500 mt-1">AI-Powered Matching</p>
                </div>
            </div>
        </aside>
    );
}
