import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Download, X, User, BarChart3 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import SkillBar from '../../components/SkillBar'
import FairnessAlert from '../../components/FairnessAlert'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ConfirmModal from '../../components/ConfirmModal'
import { getRankings, updateApplicationStatus, getApplicantDetail } from '../../api/company'
import { triggerMatching } from '../../api/matching'

export default function Rankings() {
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [sortBy, setSortBy] = useState('rank')
    const [selectedApp, setSelectedApp] = useState(null)
    const [confirmAction, setConfirmAction] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['rankings', id, statusFilter, sortBy, search],
        queryFn: () => getRankings(id, { status_filter: statusFilter || undefined, sort_by: sortBy, search: search || undefined }).then(r => r.data),
    })

    const { data: detail, isLoading: detailLoading } = useQuery({
        queryKey: ['applicant-detail', selectedApp],
        queryFn: () => getApplicantDetail(selectedApp).then(r => r.data),
        enabled: !!selectedApp,
    })

    const statusMut = useMutation({
        mutationFn: ({ appId, status }) => updateApplicationStatus(appId, { status }),
        onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['rankings'] }) },
        onError: (e) => toast.error(e.response?.data?.detail || 'Update failed'),
    })

    const matchMut = useMutation({
        mutationFn: () => triggerMatching(id),
        onSuccess: () => { toast.success('Matching pipeline triggered!'); queryClient.invalidateQueries({ queryKey: ['rankings'] }) },
        onError: (e) => toast.error(e.response?.data?.detail || 'Matching failed'),
    })

    const exportCSV = () => {
        if (!data?.rankings) return
        const headers = ['Rank', 'Name', 'Email', 'Institution', 'Score', 'Status']
        const rows = data.rankings.map(r => [r.rank, r.student_name, r.student_email, r.student_institution, r.match_score, r.status])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `rankings-${id}.csv`; a.click()
    }

    if (isLoading) return <Sidebar><LoadingSpinner /></Sidebar>

    const opp = data?.opportunity || {}
    const rankings = data?.rankings || []
    const alerts = data?.fairness_alerts || []
    const skillKeys = opp.skill_weights ? Object.keys(opp.skill_weights) : []

    return (
        <Sidebar>
            <PageHeader
                title={opp.title || 'Rankings'}
                breadcrumbs={[{ label: 'Dashboard', href: '/company/dashboard' }, { label: 'Rankings' }]}
                action={
                    <div className="flex gap-2">
                        <button onClick={() => matchMut.mutate()} disabled={matchMut.isPending} className="btn-secondary text-sm">
                            <BarChart3 size={14} /> {matchMut.isPending ? 'Running...' : 'Run Matching'}
                        </button>
                        <button onClick={exportCSV} className="btn-secondary text-sm"><Download size={14} /> Export CSV</button>
                    </div>
                }
            />

            {/* Fairness Alerts */}
            <FairnessAlert alerts={alerts} className="mb-6" />

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input className="input-field pl-10" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select className="input-field w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="rank">Sort by Rank</option>
                    <option value="score">Sort by Score</option>
                </select>
            </div>

            {/* Rankings Table */}
            {rankings.length === 0 ? (
                <EmptyState icon={User} title="No applicants yet" message="Applicants will appear here once students apply." />
            ) : (
                <div className="card overflow-x-auto">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Candidate</th>
                                <th>Institution</th>
                                <th>Score</th>
                                {skillKeys.map(s => <th key={s}>{s}</th>)}
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((rank) => (
                                <tr key={rank.id}>
                                    <td>
                                        {rank.rank ? (
                                            <span className={`font-bold ${rank.rank <= 3 ? 'text-primary' : 'text-white'}`}>#{rank.rank}</span>
                                        ) : <span className="text-muted">—</span>}
                                    </td>
                                    <td>
                                        <div>
                                            <p className="font-medium text-white">{rank.student_name}</p>
                                            <p className="text-xs text-muted">{rank.student_email}</p>
                                        </div>
                                    </td>
                                    <td className="text-slate-300 text-sm">{rank.student_institution || '—'}</td>
                                    <td>
                                        <span className={`font-semibold ${rank.match_score >= 70 ? 'text-emerald-400' : rank.match_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {rank.match_score.toFixed(1)}
                                        </span>
                                    </td>
                                    {skillKeys.map(skill => (
                                        <td key={skill}>
                                            {rank.score_breakdown?.[skill] ? (
                                                <div className="w-16">
                                                    <span className="text-xs text-slate-300">{rank.score_breakdown[skill].student_score.toFixed(1)}/5</span>
                                                    <div className="h-1.5 bg-slate-700 rounded-full mt-0.5">
                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${(rank.score_breakdown[skill].student_score / 5) * 100}%` }} />
                                                    </div>
                                                </div>
                                            ) : <span className="text-muted text-xs">—</span>}
                                        </td>
                                    ))}
                                    <td>
                                        <select
                                            value={rank.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value
                                                if (newStatus === 'rejected') {
                                                    setConfirmAction({ appId: rank.id, status: newStatus, name: rank.student_name })
                                                } else {
                                                    statusMut.mutate({ appId: rank.id, status: newStatus })
                                                }
                                            }}
                                            className="bg-surface-2 border border-slate-600 rounded-md px-2 py-1 text-xs text-slate-300"
                                        >
                                            <option value="applied">Applied</option>
                                            <option value="under_review">Under Review</option>
                                            <option value="shortlisted">Shortlisted</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => setSelectedApp(rank.id)} className="text-primary text-sm hover:underline">
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Side Panel */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedApp(null)} />
                    <div className="relative w-full max-w-lg bg-surface border-l border-slate-700 overflow-y-auto animate-slide-in">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Applicant Profile</h2>
                                <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>

                            {detailLoading ? <LoadingSpinner /> : detail ? (
                                <div className="space-y-6">
                                    {detail.student && (
                                        <div>
                                            <h3 className="text-white font-medium text-lg">{detail.student.name}</h3>
                                            <p className="text-muted text-sm">{detail.student.email}</p>
                                            <p className="text-sm text-slate-300 mt-1">{detail.student.institution}</p>
                                        </div>
                                    )}

                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted">Match Score</span>
                                            <span className="text-2xl font-bold text-primary">{detail.match_score?.toFixed(1)}</span>
                                        </div>
                                        {detail.rank && <p className="text-sm text-muted">Rank #{detail.rank}</p>}
                                    </div>

                                    {detail.score_breakdown && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Score Breakdown</h4>
                                            <div className="space-y-2">
                                                {Object.entries(detail.score_breakdown).map(([skill, data]) => (
                                                    <SkillBar key={skill} skill={skill} score={data.student_score} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {detail.explanation?.rank_reason && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Explanation</h4>
                                            <p className="text-sm text-slate-300">{detail.explanation.rank_reason}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => statusMut.mutate({ appId: selectedApp, status: 'shortlisted' })}
                                            className="btn-primary flex-1 text-sm"
                                        >Shortlist</button>
                                        <button
                                            onClick={() => setConfirmAction({ appId: selectedApp, status: 'rejected', name: detail.student?.name })}
                                            className="btn-danger flex-1 text-sm"
                                        >Reject</button>
                                    </div>
                                </div>
                            ) : <p className="text-muted">Unable to load applicant details.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject confirm */}
            <ConfirmModal
                open={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => { statusMut.mutate({ appId: confirmAction.appId, status: confirmAction.status }); setConfirmAction(null) }}
                title="Reject Applicant?"
                message={`Are you sure you want to reject ${confirmAction?.name}? They will be notified.`}
                confirmText="Reject"
                danger
            />
        </Sidebar>
    )
}
