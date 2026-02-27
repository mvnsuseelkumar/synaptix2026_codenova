import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Briefcase, Users, CheckCircle2, AlertTriangle, Plus, BarChart3, ChevronRight } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import FairnessAlert from '../../components/FairnessAlert'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { getOpportunities } from '../../api/company'
import { useAuth } from '../../hooks/useAuth'

export default function CompanyDashboard() {
    const { user } = useAuth()
    const { data, isLoading } = useQuery({
        queryKey: ['company-opps'],
        queryFn: () => getOpportunities().then(r => r.data),
    })

    if (isLoading) return <Sidebar><LoadingSpinner /></Sidebar>

    const opps = data?.opportunities || []
    const totalApplicants = opps.reduce((s, o) => s + (o.total_applicants || 0), 0)

    return (
        <Sidebar>
            <PageHeader
                title={`Welcome, ${user?.name || 'Company'}`}
                action={<Link to="/company/opportunities/new" className="btn-primary text-sm"><Plus size={16} /> Post Opportunity</Link>}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Opportunities', value: opps.length, icon: Briefcase, color: 'text-primary' },
                    { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'text-blue-400' },
                    { label: 'Open Positions', value: opps.filter(o => o.status === 'open').length, icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Active', value: opps.filter(o => o.status !== 'closed').length, icon: BarChart3, color: 'text-amber-400' },
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

            {/* Active Opportunities */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Your Opportunities</h2>
                    <Link to="/company/opportunities/new" className="text-sm text-primary hover:underline">+ New</Link>
                </div>

                {opps.length === 0 ? (
                    <EmptyState
                        icon={Briefcase}
                        title="No opportunities posted yet"
                        message="Create your first internship opportunity and start receiving applications."
                        action={<Link to="/company/opportunities/new" className="btn-primary text-sm"><Plus size={14} /> Post Opportunity</Link>}
                    />
                ) : (
                    <div className="space-y-3">
                        {opps.map((opp) => (
                            <div key={opp.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-medium text-white">{opp.title}</h3>
                                        <StatusBadge status={opp.status} />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted">
                                        <span>{opp.domain}</span>
                                        <span>{opp.total_applicants} applicants</span>
                                        <span>{new Date(opp.posted_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link to={`/company/opportunities/${opp.id}/rankings`} className="btn-primary text-xs py-1.5 px-3">
                                        <BarChart3 size={14} /> Rankings
                                    </Link>
                                    <Link to={`/company/opportunities/${opp.id}/edit`} className="btn-ghost text-xs">Edit</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Sidebar>
    )
}
