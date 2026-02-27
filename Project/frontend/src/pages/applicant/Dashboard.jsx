import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applicantAPI } from '../../services/api';
import { SkillRadarChart } from '../../components/MatchScoreCard';
import { Briefcase, Target, TrendingUp, FileText, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApplicantDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ applications: 0, avgScore: 0, skills: 0 });
    const [applications, setApplications] = useState([]);
    const [skills, setSkills] = useState([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [profileRes, appsRes] = await Promise.all([
                applicantAPI.getProfile(),
                applicantAPI.getApplications(),
            ]);
            const profile = profileRes.data.profile || {};
            const apps = appsRes.data.applications || [];
            const sk = profile.skills || [];
            setSkills(sk);
            setApplications(apps.slice(0, 5));
            const scores = apps.map((a) => a.match_score || 0).filter((s) => s > 0);
            setStats({
                applications: apps.length,
                avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
                skills: sk.length,
            });
        } catch (err) { console.error(err); }
    };

    const statusColors = {
        pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        reviewed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        shortlisted: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
    };

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name} 👋</h1>
                <p className="text-slate-400 mt-1">Here's your matching overview</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: FileText, label: 'Applications', value: stats.applications, color: 'violet' },
                    { icon: TrendingUp, label: 'Avg Match Score', value: `${stats.avgScore}%`, color: 'emerald' },
                    { icon: Target, label: 'Skills Added', value: stats.skills, color: 'fuchsia' },
                ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Your Skills Profile</h2>
                    {skills.length > 0 ? (
                        <SkillRadarChart skills={skills} />
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No skills added yet</p>
                            <Link to="/applicant/skills" className="text-violet-400 text-sm mt-2 inline-block">Add your skills →</Link>
                        </div>
                    )}
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
                        <Link to="/applicant/applications" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
                    </div>
                    {applications.length > 0 ? (
                        <div className="space-y-3">
                            {applications.map((app) => (
                                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="font-medium text-white text-sm">{app.job_title}</p>
                                        <p className="text-xs text-slate-500">{app.company}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-violet-400">{app.match_score?.toFixed(0)}%</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColors[app.status] || ''}`}>{app.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No applications yet</p>
                            <Link to="/applicant/jobs" className="text-violet-400 text-sm mt-2 inline-block">Browse jobs →</Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { to: '/applicant/profile', label: 'Build Profile', icon: Star, desc: 'Complete your professional profile' },
                    { to: '/applicant/jobs', label: 'Find Jobs', icon: Briefcase, desc: 'Browse matching internships' },
                    { to: '/applicant/recommendations', label: 'AI Recommendations', icon: TrendingUp, desc: 'Get personalized suggestions' },
                ].map((action) => (
                    <Link key={action.to} to={action.to} className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all">
                        <action.icon className="w-6 h-6 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-white">{action.label}</h3>
                        <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
