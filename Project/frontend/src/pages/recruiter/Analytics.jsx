import { useEffect, useState } from 'react';
import { recruiterAPI } from '../../services/api';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { recruiterAPI.getAnalytics().then(res => setData(res.data)).catch(() => { }).finally(() => setLoading(false)); }, []);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" /></div>;
    if (!data) return <div className="text-center py-20 text-slate-500">No analytics data available</div>;

    const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
    const statusData = Object.entries(data.status_breakdown || {}).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3"><BarChart3 className="w-6 h-6 text-violet-400" /><h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><p className="text-2xl font-bold text-white">{data.total_jobs}</p><p className="text-sm text-slate-400">Jobs Posted</p></div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><p className="text-2xl font-bold text-white">{data.total_applications}</p><p className="text-sm text-slate-400">Applications</p></div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><p className="text-2xl font-bold text-violet-400">{data.avg_match_score}%</p><p className="text-sm text-slate-400">Avg Match Score</p></div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><p className="text-2xl font-bold text-emerald-400">{data.status_breakdown?.shortlisted || 0}</p><p className="text-sm text-slate-400">Shortlisted</p></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Score Distribution</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={data.score_histogram || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Application Status</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                                <Legend formatter={(value) => <span className="text-slate-300 capitalize">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {data.jobs_stats?.length > 0 && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Per-Job Statistics</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={data.jobs_stats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis dataKey="title" type="category" width={160} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                                <Bar dataKey="avg_score" name="Avg Score" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="max_score" name="Best Score" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
