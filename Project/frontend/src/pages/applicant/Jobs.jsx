import { useState, useEffect } from 'react';
import { jobsAPI, applicantAPI } from '../../services/api';
import { Search, MapPin, Clock, DollarSign, Briefcase, Zap, Check } from 'lucide-react';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [applied, setApplied] = useState(new Set());
    const [applyResult, setApplyResult] = useState(null);

    useEffect(() => { loadJobs(); loadApplied(); }, []);

    const loadJobs = async (s, t) => {
        setLoading(true);
        try { const res = await jobsAPI.list({ search: s || search, job_type: t || typeFilter || undefined }); setJobs(res.data.jobs); } catch (e) { /* ignore */ }
        setLoading(false);
    };

    const loadApplied = async () => {
        try { const res = await applicantAPI.getApplications(); setApplied(new Set(res.data.applications.map(a => a.job_id))); } catch (e) { /* ignore */ }
    };

    const apply = async (jobId) => {
        setApplying(jobId);
        try {
            const res = await applicantAPI.apply(jobId);
            setApplied(prev => new Set(prev).add(jobId));
            setApplyResult({ jobId, score: res.data.match_score, message: res.data.explanation?.overall_assessment || '' });
            setTimeout(() => setApplyResult(null), 5000);
        } catch (err) { alert(err.response?.data?.detail || 'Failed to apply'); }
        setApplying(null);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Job Listings</h1>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadJobs()} placeholder="Search jobs, companies, skills..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
                </div>
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); loadJobs(search, e.target.value); }} className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none">
                    <option value="">All Types</option>
                    <option value="internship">Internship</option>
                    <option value="project">Project</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                </select>
                <button onClick={() => loadJobs()} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-all">Search</button>
            </div>

            {applyResult && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <div>
                        <p className="text-emerald-400 font-medium">Applied Successfully!</p>
                        <p className="text-sm text-slate-400">Match Score: <span className="text-violet-400 font-semibold">{applyResult.score?.toFixed(1)}%</span> — {applyResult.message}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500 mx-auto" /></div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-slate-500"><Briefcase className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>No jobs found</p></div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/20 transition-all">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20">{job.job_type}</span>
                                    </div>
                                    <p className="text-violet-400 font-medium text-sm">{job.company}</p>
                                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">{job.description}</p>
                                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                                        {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                                        {job.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.duration}</span>}
                                        {job.stipend && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.stipend}</span>}
                                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{job.experience_level}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {job.required_skills.map((s) => <span key={s.name} className="px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-400 border border-slate-700">{s.name} <span className="text-violet-400">{s.weight}%</span></span>)}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    {applied.has(job.id) ? (
                                        <span className="px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium inline-flex items-center gap-1"><Check className="w-4 h-4" /> Applied</span>
                                    ) : (
                                        <button onClick={() => apply(job.id)} disabled={applying === job.id} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50">
                                            {applying === job.id ? 'Applying...' : 'Apply Now'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
