import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MapPin, Clock, DollarSign, CheckCircle2, XCircle, Loader2, Building2 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import SkillChip from '../../components/SkillChip'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import { getOpportunityDetail, applyToOpportunity } from '../../api/student'
import { useState } from 'react'

export default function OpportunityDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showConfirm, setShowConfirm] = useState(false)

    const { data: opp, isLoading } = useQuery({
        queryKey: ['opp-detail', id],
        queryFn: () => getOpportunityDetail(id).then(r => r.data),
    })

    const applyMutation = useMutation({
        mutationFn: () => applyToOpportunity(id),
        onSuccess: (res) => {
            toast.success('Application submitted!')
            queryClient.invalidateQueries({ queryKey: ['opp-detail', id] })
            navigate(`/student/applications/${res.data.application_id}`)
        },
        onError: (e) => toast.error(e.response?.data?.detail || 'Application failed'),
    })

    if (isLoading) return <Sidebar><LoadingSpinner /></Sidebar>
    if (!opp) return <Sidebar><div className="text-muted">Opportunity not found</div></Sidebar>

    return (
        <Sidebar>
            <PageHeader
                title={opp.title}
                breadcrumbs={[
                    { label: 'Opportunities', href: '/student/opportunities' },
                    { label: opp.title },
                ]}
            />

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                                <Building2 size={24} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{opp.company_name}</h2>
                                <div className="flex items-center gap-3 text-sm text-muted">
                                    {opp.domain && <span>{opp.domain}</span>}
                                    <span className="capitalize">{opp.mode}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-300 mb-6 pb-6 border-b border-slate-700">
                            {opp.duration && <div className="flex items-center gap-1.5"><Clock size={14} className="text-muted" /> {opp.duration}</div>}
                            {opp.location && <div className="flex items-center gap-1.5"><MapPin size={14} className="text-muted" /> {opp.location}</div>}
                            {opp.stipend && <div className="flex items-center gap-1.5"><DollarSign size={14} className="text-muted" /> {opp.stipend}</div>}
                        </div>

                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{opp.description}</div>
                    </div>

                    {/* Skill Weights */}
                    {opp.skill_weights && Object.keys(opp.skill_weights).length > 0 && (
                        <div className="card">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Skill Weights</h3>
                            <div className="space-y-3">
                                {Object.entries(opp.skill_weights).map(([skill, weight]) => (
                                    <div key={skill}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-300">{skill}</span>
                                            <span className="text-white font-medium">{weight}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${weight}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Application panel */}
                <div className="space-y-6">
                    <div className="card sticky top-20">
                        {/* Required Skills Checklist */}
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Required Skills</h3>
                        <div className="space-y-2 mb-6">
                            {opp.must_have_skills?.map((skill) => {
                                const matched = opp.matching_skills?.includes(skill)
                                return (
                                    <div key={skill} className="flex items-center gap-2 text-sm">
                                        {matched ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
                                        <span className={matched ? 'text-slate-300' : 'text-red-300'}>{skill}</span>
                                    </div>
                                )
                            })}
                        </div>

                        {opp.missing_skills?.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                                <p className="text-xs text-red-400 font-medium mb-2">Skills you're missing:</p>
                                <div className="flex flex-wrap gap-1">
                                    {opp.missing_skills.map(s => <SkillChip key={s} skill={s} variant="missing" />)}
                                </div>
                            </div>
                        )}

                        <div className="text-sm text-muted mb-4">
                            <p>Min score threshold: <span className="text-white font-medium">{opp.min_score_threshold}/5.0</span></p>
                            <p>Applicants: <span className="text-white font-medium">{opp.total_applicants}</span></p>
                        </div>

                        {opp.has_applied ? (
                            <button disabled className="btn-secondary w-full opacity-75">Already Applied</button>
                        ) : (
                            <button onClick={() => setShowConfirm(true)} className="btn-primary w-full">
                                Apply Now
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => applyMutation.mutate()}
                title="Confirm Application"
                message={`Are you sure you want to apply for "${opp.title}" at ${opp.company_name}?`}
                confirmText={applyMutation.isPending ? 'Applying...' : 'Apply'}
            />
        </Sidebar>
    )
}
