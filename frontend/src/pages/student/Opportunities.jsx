import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import SkillChip from '../../components/SkillChip'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { getOpportunities } from '../../api/student'

export default function StudentOpportunities() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [domain, setDomain] = useState('')
    const [mode, setMode] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['student-opps', page, search, domain, mode],
        queryFn: () => getOpportunities({ page, limit: 12, search, domain: domain || undefined, mode: mode || undefined }).then(r => r.data),
    })

    return (
        <Sidebar>
            <PageHeader title="Browse Opportunities" />

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        className="input-field pl-10"
                        placeholder="Search by title or description..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    />
                </div>
                <select className="input-field w-auto min-w-[140px]" value={domain} onChange={(e) => { setDomain(e.target.value); setPage(1) }}>
                    <option value="">All Domains</option>
                    {['Web Development', 'Data Science', 'Mobile', 'DevOps', 'AI/ML', 'Design', 'Backend', 'Frontend', 'Full Stack'].map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select className="input-field w-auto min-w-[120px]" value={mode} onChange={(e) => { setMode(e.target.value); setPage(1) }}>
                    <option value="">All Modes</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                </select>
            </div>

            {isLoading ? <LoadingSpinner /> : (
                <>
                    {(!data?.opportunities || data.opportunities.length === 0) ? (
                        <EmptyState title="No opportunities found" message="Try adjusting your search or filters." />
                    ) : (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {data.opportunities.map((opp) => (
                                <div key={opp.id} className="card-hover group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{opp.title}</h3>
                                            <p className="text-sm text-muted">{opp.company_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {opp.domain && <StatusBadge status="open" className="!text-xs" />}
                                        {opp.domain && <span className="badge bg-primary/20 text-primary-300 border border-primary/30">{opp.domain}</span>}
                                        <span className="badge bg-surface-2 text-slate-300 border border-slate-600 capitalize">{opp.mode}</span>
                                    </div>

                                    <div className="space-y-1.5 text-sm text-muted mb-3">
                                        {opp.duration && <div className="flex items-center gap-2"><Clock size={14} /> {opp.duration}</div>}
                                        {opp.location && <div className="flex items-center gap-2"><MapPin size={14} /> {opp.location}</div>}
                                        {opp.stipend && <div className="flex items-center gap-2"><DollarSign size={14} /> {opp.stipend}</div>}
                                    </div>

                                    {opp.must_have_skills?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {opp.must_have_skills.slice(0, 4).map(s => <SkillChip key={s} skill={s} variant="required" />)}
                                            {opp.must_have_skills.length > 4 && <span className="text-xs text-muted self-center">+{opp.must_have_skills.length - 4} more</span>}
                                        </div>
                                    )}

                                    <Link to={`/student/opportunities/${opp.id}`} className="btn-primary w-full text-sm py-2">
                                        View & Apply
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {data?.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost"><ChevronLeft size={16} /></button>
                            <span className="text-sm text-muted">Page {page} of {data.pages}</span>
                            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="btn-ghost"><ChevronRight size={16} /></button>
                        </div>
                    )}
                </>
            )}
        </Sidebar>
    )
}
