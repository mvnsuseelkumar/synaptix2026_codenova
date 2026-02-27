import { useState, useEffect } from 'react';
import { applicantAPI } from '../../services/api';
import MatchScoreCard from '../../components/MatchScoreCard';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try { const res = await applicantAPI.getApplications(); setApplications(res.data.applications || []); } catch (e) { /* ignore */ }
        setLoading(false);
    };

    const statusConfig = {
        pending: { icon: Clock, color: 'amber', label: 'Pending Review' },
        reviewed: { icon: Eye, color: 'blue', label: 'Reviewed' },
        shortlisted: { icon: CheckCircle, color: 'emerald', label: 'Shortlisted' },
        rejected: { icon: XCircle, color: 'red', label: 'Rejected' },
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Application Tracker</h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(statusConfig).map(([status, cfg]) => {
                    const count = applications.filter(a => a.status === status).length;
                    const Icon = cfg.icon;
                    return (
                        <div key={status} className={`p-4 rounded-xl bg-${cfg.color}-500/5 border border-${cfg.color}-500/20`}>
                            <Icon className={`w-5 h-5 text-${cfg.color}-400 mb-1`} />
                            <p className="text-2xl font-bold text-white">{count}</p>
                            <p className={`text-xs text-${cfg.color}-400`}>{cfg.label}</p>
                        </div>
                    );
                })}
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-16 text-slate-500"><FileText className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>No applications yet</p></div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => {
                        const cfg = statusConfig[app.status] || statusConfig.pending;
                        return (
                            <div key={app.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                                <div className="p-5 cursor-pointer hover:bg-white/[0.02] transition-all" onClick={() => setSelected(selected?.id === app.id ? null : app)}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-white">{app.job_title}</h3>
                                            <p className="text-sm text-slate-400">{app.company}</p>
                                            <p className="text-xs text-slate-500 mt-1">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-violet-400">{app.match_score?.toFixed(1)}%</span>
                                                <p className="text-xs text-slate-500">Match</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${cfg.color}-500/10 text-${cfg.color}-400 border border-${cfg.color}-500/20`}>{cfg.label}</span>
                                        </div>
                                    </div>
                                </div>
                                {selected?.id === app.id && app.explanation && (
                                    <div className="border-t border-white/10 p-5"><MatchScoreCard explanation={app.explanation} /></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
