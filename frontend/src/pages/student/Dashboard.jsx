import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Briefcase, CheckCircle2, Clock, TrendingUp, Upload, AlertCircle, Loader2 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { getProfile, getApplications } from '../../api/student'

const barColor = (s) => (s >= 3.5 ? '#10B981' : s >= 2 ? '#F59E0B' : '#EF4444')

export default function StudentDashboard() {
    const { user } = useAuth()
    const { data: profile, isLoading: pLoading } = useQuery({ queryKey: ['student-profile'], queryFn: () => getProfile().then(r => r.data) })
    const { data: appsData, isLoading: aLoading } = useQuery({ queryKey: ['student-apps'], queryFn: () => getApplications({}).then(r => r.data) })

    if (pLoading || aLoading) return <Sidebar><LoadingSpinner /></Sidebar>

    const apps = appsData?.applications || []
    const totalApps = apps.length
    const shortlisted = apps.filter(a => a.status === 'shortlisted').length
    const underReview = apps.filter(a => a.status === 'under_review').length
    const avgScore = apps.length > 0 ? (apps.reduce((s, a) => s + (a.match_score || 0), 0) / apps.length).toFixed(1) : '0.0'

    const skillData = profile?.skill_profile
        ? Object.entries(profile.skill_profile)
            .sort((a, b) => b[1].score - a[1].score)
            .slice(0, 10)
            .map(([name, data]) => ({ name, score: data.score }))
        : []

    return (
        <Sidebar>
            <PageHeader title={`Welcome back, ${user?.name || 'Student'}`} />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Applications', value: totalApps, icon: Briefcase, color: 'text-primary' },
                    { label: 'Shortlisted', value: shortlisted, icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Under Review', value: underReview, icon: Clock, color: 'text-blue-400' },
                    { label: 'Avg Match Score', value: avgScore, icon: TrendingUp, color: 'text-amber-400' },
                ].map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center ${s.color}`}>
                                <s.icon size={20} />
                            </div>
                            <div>
                                <p className="stat-value text-2xl">{s.value}</p>
                                <p className="stat-label">{s.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resume Status Banner */}
            {profile?.resume_parse_status === 'pending' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <Upload className="text-amber-400" size={20} />
                    <div>
                        <p className="text-amber-200 font-medium text-sm">Upload your resume to start matching</p>
                        <Link to="/student/profile" className="text-amber-400 text-xs hover:underline">Go to Profile →</Link>
                    </div>
                </div>
            )}
            {profile?.resume_parse_status === 'processing' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <Loader2 className="text-blue-400 animate-spin" size={20} />
                    <p className="text-blue-200 font-medium text-sm">Parsing your resume...</p>
                </div>
            )}
            {profile?.resume_parse_status === 'done' && skillData.length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                    <p className="text-emerald-200 font-medium text-sm">Resume parsed — {Object.keys(profile.skill_profile).length} skills detected</p>
                </div>
            )}
            {profile?.resume_parse_status === 'failed' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <AlertCircle className="text-red-400" size={20} />
                    <div>
                        <p className="text-red-200 font-medium text-sm">Resume parsing failed</p>
                        <Link to="/student/profile" className="text-red-400 text-xs hover:underline">Try uploading again →</Link>
                    </div>
                </div>
            )}

            {/* Skill Profile Chart */}
            {skillData.length > 0 && (
                <div className="card mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Your Top Skills</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={skillData} layout="vertical" margin={{ left: 80 }}>
                            <XAxis type="number" domain={[0, 5]} stroke="#64748B" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} width={80} />
                            <Tooltip
                                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F1F5F9' }}
                                formatter={(v) => [`${v.toFixed(1)} / 5.0`, 'Score']}
                            />
                            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                                {skillData.map((entry, i) => (
                                    <Cell key={i} fill={barColor(entry.score)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Recent Applications */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
                    <Link to="/student/applications" className="text-sm text-primary hover:underline">View All</Link>
                </div>
                {apps.length === 0 ? (
                    <p className="text-muted text-sm py-4">No applications yet. <Link to="/student/opportunities" className="text-primary hover:underline">Browse opportunities</Link></p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th>Role</th><th>Company</th><th>Applied</th><th>Status</th><th>Score</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.slice(0, 5).map((app) => (
                                    <tr key={app.id}>
                                        <td className="font-medium text-white">{app.opportunity_title}</td>
                                        <td className="text-slate-300">{app.company_name}</td>
                                        <td className="text-muted">{new Date(app.applied_at).toLocaleDateString()}</td>
                                        <td><StatusBadge status={app.status} /></td>
                                        <td className="font-semibold">{app.match_score > 0 ? app.match_score.toFixed(1) : '—'}</td>
                                        <td><Link to={`/student/applications/${app.id}`} className="text-primary text-sm hover:underline">View</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Sidebar>
    )
}
