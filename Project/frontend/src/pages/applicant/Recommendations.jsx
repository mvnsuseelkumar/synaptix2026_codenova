import { useState, useEffect } from 'react';
import { applicantAPI } from '../../services/api';
import MatchScoreCard from '../../components/MatchScoreCard';
import { Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Recommendations() {
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);
    const load = async () => {
        try { const res = await applicantAPI.getRecommendations(); setRecs(res.data.recommendations || []); } catch (e) { /* ignore */ }
        setLoading(false);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-fuchsia-400" />
                <h1 className="text-2xl font-bold text-white">AI Recommendations</h1>
            </div>
            <p className="text-slate-400">Jobs matched to your skill profile, ranked by compatibility.</p>

            {recs.length === 0 ? (
                <div className="text-center py-16">
                    <Star className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">No recommendations yet</p>
                    <p className="text-sm text-slate-600">Add more skills in your profile to get matched.</p>
                    <Link to="/applicant/skills" className="inline-block mt-4 text-violet-400 text-sm hover:text-violet-300">Manage Skills →</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {recs.map((rec, i) => (
                        <div key={rec.job_id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-400 font-bold">{i + 1}</span>
                                            <h3 className="text-lg font-semibold text-white">{rec.title}</h3>
                                        </div>
                                        <p className="text-sm text-violet-400 mt-1">{rec.company}</p>
                                        {rec.job_type && <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20">{rec.job_type}</span>}
                                    </div>
                                </div>
                                {rec.explanation && <MatchScoreCard explanation={rec.explanation} />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
