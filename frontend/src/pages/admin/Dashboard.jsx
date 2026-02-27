import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Users, Briefcase, FileText, AlertTriangle, CheckCircle2, Shield } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { getStats, getFairnessLogs, getAllUsers, resolveFairnessFlag } from '../../api/matching'

export default function AdminDashboard() {
    const queryClient = useQueryClient()

    const { data: stats, isLoading: sLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => getStats().then(r => r.data) })
    const { data: fairness, isLoading: fLoading } = useQuery({ queryKey: ['admin-fairness'], queryFn: () => getFairnessLogs().then(r => r.data) })
    const { data: usersData, isLoading: uLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => getAllUsers().then(r => r.data) })

    const resolveMut = useMutation({
        mutationFn: (id) => resolveFairnessFlag(id),
        onSuccess: () => { toast.success('Flag resolved'); queryClient.invalidateQueries({ queryKey: ['admin-fairness'] }) },
        onError: (e) => toast.error(e.response?.data?.detail || 'Failed'),
    })

    if (sLoading || fLoading || uLoading) return <Sidebar><LoadingSpinner /></Sidebar>

    const logs = fairness?.fairness_logs || []
    const users = usersData?.users || []

    return (
        <Sidebar>
            <PageHeader title="Admin Dashboard" />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-primary' },
                    { label: 'Opportunities', value: stats?.total_opportunities || 0, icon: Briefcase, color: 'text-blue-400' },
                    { label: 'Applications', value: stats?.total_applications || 0, icon: FileText, color: 'text-emerald-400' },
                    { label: 'Unresolved Flags', value: stats?.unresolved_flags || 0, icon: AlertTriangle, color: 'text-amber-400' },
                ].map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center ${s.color}`}><s.icon size={20} /></div>
                            <div>
                                <p className="stat-value text-2xl">{s.value}</p>
                                <p className="stat-label">{s.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fairness Flags */}
            <div className="card mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Shield size={20} className="text-amber-400" /> Fairness Flags</h2>
                {logs.length === 0 ? (
                    <p className="text-muted text-sm py-4">No fairness flags — everything looks good!</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th>Opportunity</th><th>Flag Type</th><th>Detail</th><th>Date</th><th>Status</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="font-medium text-white">{log.opportunity_title}</td>
                                        <td className="text-sm text-muted">{log.flag_type}</td>
                                        <td className="text-sm text-slate-300 max-w-xs truncate">{log.detail}</td>
                                        <td className="text-sm text-muted">{new Date(log.flagged_at).toLocaleDateString()}</td>
                                        <td>
                                            {log.resolved
                                                ? <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Resolved</span>
                                                : <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">Open</span>}
                                        </td>
                                        <td>
                                            {!log.resolved && (
                                                <button onClick={() => resolveMut.mutate(log.id)} className="text-emerald-400 text-sm hover:underline flex items-center gap-1">
                                                    <CheckCircle2 size={14} /> Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Users */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">All Users</h2>
                <div className="overflow-x-auto">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Name</th><th>Email</th><th>Role</th><th>Details</th><th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="font-medium text-white">{u.name}</td>
                                    <td className="text-muted text-sm">{u.email}</td>
                                    <td><StatusBadge status={u.role === 'student' ? 'applied' : 'open'} /></td>
                                    <td className="text-sm text-slate-300">
                                        {u.role === 'student' ? `${u.skills_count || 0} skills • ${u.resume_status}` : u.industry || '—'}
                                    </td>
                                    <td className="text-sm text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Sidebar>
    )
}
