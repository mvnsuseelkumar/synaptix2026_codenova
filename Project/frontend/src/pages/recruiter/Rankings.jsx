import { useState, useEffect } from 'react';
import { recruiterAPI, resumeAPI } from '../../services/api';
import MatchScoreCard from '../../components/MatchScoreCard';
import { Users, ChevronDown, ChevronUp, CheckCircle, XCircle, Shield, FileText, Download } from 'lucide-react';

export default function Rankings() {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [fairnessReport, setFairnessReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { loadJobs(); }, []);

    const loadJobs = async () => {
        try { const res = await recruiterAPI.getMyJobs(); setJobs(res.data.jobs || []); if (res.data.jobs?.length > 0) { setSelectedJob(res.data.jobs[0].id); loadCandidates(res.data.jobs[0].id); } } catch (e) { /* ignore */ }
    };

    const loadCandidates = async (jobId) => {
        setLoading(true);
        try { const res = await recruiterAPI.getCandidates(jobId); setCandidates(res.data.candidates || []); setFairnessReport(res.data.fairness_report); } catch (e) { /* ignore */ }
        setLoading(false);
    };

    const updateStatus = async (appId, status) => {
        try { await recruiterAPI.updateApplicationStatus(appId, status); setCandidates(cs => cs.map(c => c.application_id === appId ? { ...c, status } : c)); } catch (e) { /* ignore */ }
    };

    const downloadResume = async (applicantId, fileName) => {
        try {
            const res = await resumeAPI.downloadApplicant(applicantId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'resume';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) { /* ignore */ }
    };

    const statusColors = { pending: 'text-amber-400', reviewed: 'text-blue-400', shortlisted: 'text-emerald-400', rejected: 'text-red-400' };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-6 h-6 text-violet-400" /> Candidate Rankings</h1>

            <div className="flex gap-3 flex-wrap">
                {jobs.map((job) => (
                    <button key={job.id} onClick={() => { setSelectedJob(job.id); loadCandidates(job.id); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedJob === job.id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
                        {job.title}
                    </button>
                ))}
            </div>

            {fairnessReport && (
                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 flex items-center gap-4 flex-wrap">
                    <Shield className="w-5 h-5 text-violet-400" />
                    <span className="text-sm text-slate-300">Pool: <strong className="text-white">{fairnessReport.pool_size}</strong></span>
                    <span className="text-sm text-slate-300">Mean: <strong className="text-violet-400">{fairnessReport.mean_score}%</strong></span>
                    <span className="text-sm text-slate-300">Std Dev: <strong className="text-white">{fairnessReport.std_dev}</strong></span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${fairnessReport.fairness_status === 'balanced' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {fairnessReport.fairness_status === 'balanced' ? '✓ Balanced' : '⚠ Review Recommended'}
                    </span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" /></div>
            ) : candidates.length === 0 ? (
                <div className="text-center py-16 text-slate-500"><Users className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>No applications yet for this position</p></div>
            ) : (
                <div className="space-y-3">
                    {candidates.map((c, i) => (
                        <div key={c.application_id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                            <div className="p-5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-all" onClick={() => setExpandedId(expandedId === c.application_id ? null : c.application_id)}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700/50 text-slate-400'}`}>{i + 1}</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{c.applicant_name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">{c.applicant_email}</span>
                                        {c.has_resume && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📄 Resume</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-white">{c.final_score}%</span>
                                        {c.fairness_adjustment !== 0 && <p className="text-xs text-violet-400">{c.fairness_adjustment > 0 ? '+' : ''}{c.fairness_adjustment}% adj</p>}
                                    </div>
                                    <span className={`capitalize text-sm ${statusColors[c.status] || ''}`}>{c.status}</span>
                                    <div className="flex gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); updateStatus(c.application_id, 'shortlisted'); }} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 transition-all" title="Shortlist"><CheckCircle className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); updateStatus(c.application_id, 'rejected'); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Reject"><XCircle className="w-4 h-4" /></button>
                                    </div>
                                    {expandedId === c.application_id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                </div>
                            </div>
                            {expandedId === c.application_id && (
                                <div className="border-t border-white/10 p-5 space-y-4">
                                    {/* Resume Section */}
                                    {c.has_resume && c.resume_info && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-violet-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white">Resume Available</p>
                                                <p className="text-xs text-slate-500">
                                                    {c.resume_info.file_type} — {c.resume_info.file_name}
                                                    {c.resume_info.uploaded_at && ` — Uploaded: ${new Date(c.resume_info.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                                </p>
                                            </div>
                                            <button onClick={() => downloadResume(c.applicant_id, c.resume_info.file_name)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-sm font-medium border border-violet-500/20 transition-all">
                                                <Download className="w-4 h-4" /> Download
                                            </button>
                                        </div>
                                    )}
                                    {!c.has_resume && (
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                                            <p className="text-xs text-slate-500">No resume uploaded by this candidate</p>
                                        </div>
                                    )}

                                    {/* Match Score */}
                                    {c.explanation && <MatchScoreCard explanation={c.explanation} />}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
