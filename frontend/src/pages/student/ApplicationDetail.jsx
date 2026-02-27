import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Trophy, TrendingUp, AlertCircle, CheckCircle2, Lightbulb, Star } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import ScoreRing from '../../components/ScoreRing'
import SkillBar from '../../components/SkillBar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { getApplicationDetail } from '../../api/student'

export default function ApplicationDetail() {
    const { id } = useParams()
    const { data: app, isLoading } = useQuery({
        queryKey: ['app-detail', id],
        queryFn: () => getApplicationDetail(id).then(r => r.data),
    })

    if (isLoading) return <Sidebar><LoadingSpinner /></Sidebar>
    if (!app) return <Sidebar><div className="text-muted">Application not found</div></Sidebar>

    const breakdown = app.score_breakdown || {}
    const skills = Object.entries(breakdown)

    // Radar data
    const radarData = skills.map(([skill, data]) => ({
        skill,
        you: data.student_score,
        max: 5,
    }))

    // Banner gradients
    const bannerClass = app.status === 'shortlisted'
        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
        : app.status === 'rejected'
            ? 'bg-gradient-to-r from-slate-600/20 to-slate-700/20 border-slate-500/30'
            : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/30'

    return (
        <Sidebar>
            <PageHeader
                title="Application Detail"
                breadcrumbs={[
                    { label: 'Applications', href: '/student/applications' },
                    { label: app.opportunity_title },
                ]}
            />

            {/* Header Banner */}
            <div className={`rounded-xl border p-6 mb-8 ${bannerClass}`}>
                <div className="flex items-center gap-2 mb-1">
                    {app.status === 'shortlisted' && <span className="text-2xl">🎉</span>}
                    <StatusBadge status={app.status} className="text-sm" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">
                    {app.status === 'shortlisted'
                        ? `Shortlisted for ${app.opportunity_title} at ${app.company_name}`
                        : app.status === 'rejected'
                            ? `Application reviewed for ${app.opportunity_title} at ${app.company_name}`
                            : `Under Review — ${app.opportunity_title} at ${app.company_name}`}
                </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="card flex flex-col items-center justify-center py-8">
                    <ScoreRing score={app.match_score} size={150} strokeWidth={12} />
                    <div className="mt-4 text-center">
                        {app.rank && (
                            <div className="inline-flex items-center gap-1 badge bg-primary/20 text-primary-300 border border-primary/30 text-base px-4 py-1.5 mb-2">
                                <Trophy size={16} /> #{app.rank} of {app.total_applicants} applicants
                            </div>
                        )}
                        <p className="text-sm text-muted mt-1">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                        {app.shortlisted_at && <p className="text-sm text-emerald-400">Shortlisted {new Date(app.shortlisted_at).toLocaleDateString()}</p>}
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="lg:col-span-2 card">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" /> Score Breakdown
                    </h3>
                    <div className="space-y-3">
                        {skills.map(([skill, data]) => (
                            <div key={skill} className="flex items-center gap-4">
                                <div className="w-28 text-sm text-slate-300 shrink-0">{skill}</div>
                                <div className="w-16 text-xs text-muted text-right shrink-0">{data.weight}%</div>
                                <div className="flex-1">
                                    <SkillBar skill="" score={data.student_score} showLabel={false} />
                                </div>
                                <div className="w-16 text-right text-sm font-semibold text-white shrink-0">
                                    +{data.weighted_contribution.toFixed(1)}
                                </div>
                            </div>
                        ))}
                        {app.semantic_similarity_bonus > 0 && (
                            <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
                                <div className="w-28 text-sm text-slate-300 shrink-0">Semantic Bonus</div>
                                <div className="w-16 text-xs text-muted text-right shrink-0">—</div>
                                <div className="flex-1">
                                    <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-secondary rounded-full" style={{ width: `${(app.semantic_similarity_bonus / 10) * 100}%` }} />
                                    </div>
                                </div>
                                <div className="w-16 text-right text-sm font-semibold text-secondary shrink-0">
                                    +{app.semantic_similarity_bonus.toFixed(1)}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-4 pt-3 border-t border-slate-700">
                            <div className="w-28 text-sm font-bold text-white shrink-0">Total</div>
                            <div className="w-16 shrink-0" />
                            <div className="flex-1" />
                            <div className="w-16 text-right text-lg font-bold text-primary shrink-0">
                                {app.match_score.toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Radar Chart */}
            {radarData.length > 2 && (
                <div className="card mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Skill Radar</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="skill" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 10 }} />
                            <Radar name="Your Profile" dataKey="you" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} strokeWidth={2} />
                            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F1F5F9' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Explanation */}
            <div className="grid lg:grid-cols-3 gap-6 mt-6">
                {/* Rank Reason */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Star size={16} className="text-amber-400" /> Why you ranked #{app.rank || '—'}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{app.explanation?.rank_reason || 'Score calculation in progress.'}</p>
                </div>

                {/* Strong Areas */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400" /> Strong Areas
                    </h3>
                    {app.explanation?.strong_areas?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {app.explanation.strong_areas.map((s, i) => (
                                <span key={i} className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{s}</span>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted">No strong areas identified yet.</p>}
                </div>

                {/* Improvement Tips */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Lightbulb size={16} className="text-amber-400" /> Areas to Improve
                    </h3>
                    {app.explanation?.improvement_tips?.length > 0 ? (
                        <ul className="space-y-2">
                            {app.explanation.improvement_tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                    <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted">No improvement tips available yet.</p>}
                </div>
            </div>

            {/* Knockout Info */}
            {!app.knockout_passed && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-6">
                    <p className="text-red-400 font-medium text-sm">⚠️ Knockout Filter Failed</p>
                    <p className="text-red-300/80 text-sm mt-1">{app.knockout_fail_reason}</p>
                </div>
            )}
        </Sidebar>
    )
}
