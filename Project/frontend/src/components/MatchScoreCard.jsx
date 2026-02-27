import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Cell
} from 'recharts';

const STATUS_COLORS = { matched: '#8b5cf6', partial: '#f59e0b', missing: '#ef4444' };

export default function MatchScoreCard({ explanation, compact = false }) {
    const { final_score, overall_assessment, narrative, skill_breakdown, strengths, missing_skills, confidence, fairness_adjustment } = explanation;
    const scoreColor = final_score >= 75 ? 'text-emerald-400' : final_score >= 50 ? 'text-amber-400' : 'text-red-400';
    const ringColor = final_score >= 75 ? '#10b981' : final_score >= 50 ? '#f59e0b' : '#ef4444';
    const hasBonus = skill_breakdown?.some(s => s.project_bonus > 0 || s.experience_bonus > 0);

    return (
        <div className="bg-white/5 dark:bg-slate-800/50 rounded-2xl border border-white/10 dark:border-slate-700/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-slate-700" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke={ringColor} strokeWidth="8" strokeDasharray={`${final_score * 2.64} ${264 - final_score * 2.64}`} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${scoreColor}`}>{final_score}%</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{overall_assessment}</h3>
                    <p className="text-sm text-slate-400 mt-1">Confidence: {confidence}%</p>
                    {fairness_adjustment !== 0 && <p className="text-xs text-violet-400 mt-1">Fairness adjustment: {fairness_adjustment > 0 ? '+' : ''}{fairness_adjustment}%</p>}
                    {hasBonus && <p className="text-xs text-emerald-400 mt-1">✨ Project & experience bonuses applied</p>}
                </div>
            </div>

            {!compact && (
                <>
                    <p className="text-sm text-slate-300 mb-6 leading-relaxed">{narrative}</p>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Skill Contribution Breakdown</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={skill_breakdown} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis dataKey="skill" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                                    <Bar dataKey="contribution" name="Contribution" radius={[0, 4, 4, 0]}>
                                        {skill_breakdown.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[entry.status] || '#8b5cf6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Per-Skill Bonus Breakdown Table */}
                    {hasBonus && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-slate-300 mb-3">Per-Skill Bonus Breakdown</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-slate-300">
                                    <thead>
                                        <tr className="border-b border-slate-700 text-slate-500">
                                            <th className="py-2 pr-2 text-left font-medium">Skill</th>
                                            <th className="py-2 px-2 text-center font-medium">Manual</th>
                                            <th className="py-2 px-2 text-center font-medium">Proj Bonus</th>
                                            <th className="py-2 px-2 text-center font-medium">Exp Bonus</th>
                                            <th className="py-2 px-2 text-center font-medium">Job Wt</th>
                                            <th className="py-2 px-2 text-center font-medium">Final</th>
                                            <th className="py-2 pl-2 text-center font-medium">Contribution</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {skill_breakdown.map((s, i) => (
                                            <tr key={i} className="border-b border-slate-700/50">
                                                <td className="py-2 pr-2 font-medium text-white">{s.skill}</td>
                                                <td className="py-2 px-2 text-center">{s.manual_score}</td>
                                                <td className="py-2 px-2 text-center">
                                                    {s.project_bonus > 0 ? (
                                                        <span className="text-emerald-400">+{s.project_bonus}</span>
                                                    ) : (
                                                        <span className="text-slate-600">0</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-2 text-center">
                                                    {s.experience_bonus > 0 ? (
                                                        <span className="text-cyan-400">+{s.experience_bonus}</span>
                                                    ) : (
                                                        <span className="text-slate-600">0</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-2 text-center text-amber-400">{(s.weight / 100).toFixed(2)}</td>
                                                <td className="py-2 px-2 text-center font-semibold text-white">{s.final_skill_score}</td>
                                                <td className="py-2 pl-2 text-center font-semibold text-violet-400">{s.contribution}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {strengths.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-emerald-400 mb-2">✓ Strengths</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {strengths.map((s) => <span key={s} className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">{s}</span>)}
                                </div>
                            </div>
                        )}
                        {missing_skills.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-red-400 mb-2">✗ Missing</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {missing_skills.map((s) => <span key={s} className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-xs border border-red-500/20">{s}</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export function SkillRadarChart({ skills }) {
    const data = skills.map((s) => ({ subject: s.name, value: s.proficiency, fullMark: 10 }));
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadarChart data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar name="Proficiency" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
