import { useState, useEffect } from 'react';
import { recruiterAPI, jobsAPI } from '../../services/api';
import { Briefcase, Trash2, Users, MapPin, Clock } from 'lucide-react';

export default function Listings() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);
    const load = async () => { try { const res = await recruiterAPI.getMyJobs(); setJobs(res.data.jobs || []); } catch (e) { /* ignore */ } setLoading(false); };
    const deleteJob = async (id) => { if (!window.confirm('Delete this job posting?')) return; try { await jobsAPI.delete(id); setJobs(jobs.filter(j => j.id !== id)); } catch (e) { /* ignore */ } };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Manage Listings</h1>
            {jobs.length === 0 ? (
                <div className="text-center py-16 text-slate-500"><Briefcase className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>No job listings yet</p></div>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400'}`}>{job.status}</span>
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                                    {job.company && <span>{job.company}</span>}
                                    {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                                    {job.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.duration}</span>}
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicant_count || 0} job seekers</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {job.required_skills?.map((s) => <span key={s.name} className="px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-400 border border-slate-700">{s.name} ({s.weight}%)</span>)}
                                </div>
                            </div>
                            <button onClick={() => deleteJob(job.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
