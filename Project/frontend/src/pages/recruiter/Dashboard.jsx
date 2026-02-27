import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { recruiterAPI } from '../../services/api';
import { Briefcase, Users, TrendingUp, BarChart3, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RecruiterDashboard() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);
    const load = async () => { try { const res = await recruiterAPI.getAnalytics(); setAnalytics(res.data); } catch (e) { /* ignore */ } setLoading(false); };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" /></div>;

    const stats = analytics || { total_jobs: 0, total_applications: 0, avg_match_score: 0, status_breakdown: {} };
    const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#f472b6', '#e879f9'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-white">Recruiter Dashboard</h1><p className="text-slate-400 mt-1">Welcome back, {user?.name}</p></div>
                <Link to="/recruiter/post-job" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl transition-all"><PlusCircle className="w-4 h-4" /> Post New Job</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { icon: Briefcase, label: 'Active Jobs', value: stats.total_jobs, color: 'violet' },
                    { icon: Users, label: 'Total Applications', value: stats.total_applications, color: 'fuchsia' },
                    { icon: TrendingUp, label: 'Avg Match Score', value: `${stats.avg_match_score}%`, color: 'emerald' },
                    { icon: BarChart3, label: 'Shortlisted', value: stats.status_breakdown?.shortlisted || 0, color: 'amber' },
                ].map((s) => (
                    <div key={s.label} className="p-5 rounded-xl bg-white/5 border border-white/10">
                        <s.icon className={`w-5 h-5 text-${s.color}-400 mb-2`} />
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        <p className="text-sm text-slate-400">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Score Distribution</h2>
                    {analytics?.score_histogram?.length > 0 ? (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.score_histogram}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                                    <Bar dataKey="count" name="Candidates" radius={[4, 4, 0, 0]}>
                                        {analytics.score_histogram.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="text-slate-500 text-center py-8">No data yet</p>}
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Application Funnel</h2>
                    {stats.status_breakdown && Object.keys(stats.status_breakdown).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(stats.status_breakdown).map(([status, count]) => {
                                const total = stats.total_applications || 1;
                                const pct = Math.round((count / total) * 100);
                                const colors = { pending: 'bg-amber-500', reviewed: 'bg-blue-500', shortlisted: 'bg-emerald-500', rejected: 'bg-red-500' };
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-sm mb-1"><span className="text-slate-300 capitalize">{status}</span><span className="text-slate-400">{count} ({pct}%)</span></div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${colors[status] || 'bg-violet-500'} transition-all duration-500`} style={{ width: `${pct}%` }} /></div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-slate-500 text-center py-8">No applications yet</p>}
                </div>
            </div>

            {analytics?.jobs_stats?.length > 0 && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Your Listings</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="text-left text-sm text-slate-500 border-b border-slate-700">
                                <th className="pb-3 font-medium">Job Title</th><th className="pb-3 font-medium">Applicants</th><th className="pb-3 font-medium">Avg Score</th><th className="pb-3 font-medium">Best Score</th><th className="pb-3 font-medium"></th>
                            </tr></thead>
                            <tbody>
                                {analytics.jobs_stats.map((job) => (
                                    <tr key={job.job_id} className="border-b border-slate-800 text-sm">
                                        <td className="py-3 text-white font-medium">{job.title}</td>
                                        <td className="py-3 text-slate-300">{job.applicants}</td>
                                        <td className="py-3 text-violet-400">{job.avg_score}%</td>
                                        <td className="py-3 text-emerald-400">{job.max_score}%</td>
                                        <td className="py-3"><Link to="/recruiter/rankings" className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-xs">View <ArrowRight className="w-3 h-3" /></Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
