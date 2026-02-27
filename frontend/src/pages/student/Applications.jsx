import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { getApplications } from '../../api/student'
import { FileText } from 'lucide-react'

const TABS = ['all', 'applied', 'under_review', 'shortlisted', 'rejected']

export default function StudentApplications() {
    const [activeTab, setActiveTab] = useState('all')

    const { data, isLoading } = useQuery({
        queryKey: ['student-apps', activeTab],
        queryFn: () => getApplications({ status_filter: activeTab === 'all' ? undefined : activeTab }).then(r => r.data),
    })

    const apps = data?.applications || []

    return (
        <Sidebar>
            <PageHeader title="My Applications" />

            {/* Status tabs */}
            <div className="flex gap-1 bg-surface rounded-lg p-1 mb-6 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {tab === 'all' ? 'All' : tab === 'under_review' ? 'Under Review' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {isLoading ? <LoadingSpinner /> : apps.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No applications found"
                    message={activeTab !== 'all' ? 'Try switching to another tab.' : 'Start by browsing opportunities and applying.'}
                    action={<Link to="/student/opportunities" className="btn-primary text-sm">Browse Opportunities</Link>}
                />
            ) : (
                <div className="card overflow-x-auto">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Opportunity</th>
                                <th>Company</th>
                                <th>Applied</th>
                                <th>Status</th>
                                <th>Match Score</th>
                                <th>Rank</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map((app) => (
                                <tr key={app.id}>
                                    <td className="font-medium text-white">{app.opportunity_title}</td>
                                    <td className="text-slate-300">{app.company_name}</td>
                                    <td className="text-muted">{new Date(app.applied_at).toLocaleDateString()}</td>
                                    <td><StatusBadge status={app.status} /></td>
                                    <td>
                                        {app.match_score > 0 ? (
                                            <span className={`font-semibold ${app.match_score >= 70 ? 'text-emerald-400' : app.match_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                {app.match_score.toFixed(1)}
                                            </span>
                                        ) : <span className="text-muted">—</span>}
                                    </td>
                                    <td>
                                        {app.rank ? (
                                            <span className="badge bg-primary/20 text-primary-300 border border-primary/30">#{app.rank}</span>
                                        ) : <span className="text-muted">—</span>}
                                    </td>
                                    <td>
                                        <Link to={`/student/applications/${app.id}`} className="text-primary text-sm hover:underline">View Details</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Sidebar>
    )
}
