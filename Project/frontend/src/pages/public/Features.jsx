import { Brain, Shield, BarChart3, Target, Users, Sparkles, GitBranch, Eye } from 'lucide-react';

export default function Features() {
    const features = [
        { icon: Brain, title: 'Weighted Competency Scoring', desc: 'Each skill is weighted based on job requirements, ensuring relevant skills matter most.' },
        { icon: Shield, title: 'Fairness-Aware Algorithms', desc: 'Built-in bias detection and normalization to ensure equitable opportunity allocation.' },
        { icon: Eye, title: 'Explainable AI', desc: 'Every match decision comes with a clear narrative, score breakdown, and visual charts.' },
        { icon: Target, title: 'Skill Gap Analysis', desc: 'Identifies missing skills and provides actionable improvement suggestions.' },
        { icon: Users, title: 'Candidate Rankings', desc: 'Recruiters get ranked candidates with transparent scoring and fairness reports.' },
        { icon: Sparkles, title: 'AI Recommendations', desc: 'Personalized job suggestions based on your unique skill profile.' },
        { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time insights into application funnel, score distributions, and hiring trends.' },
        { icon: GitBranch, title: 'Audit Trail', desc: 'Every status change and decision is logged for complete transparency.' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Platform <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Features</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">Everything you need for fair, transparent, and intelligent skill-based matching.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f) => (
                        <div key={f.title} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 hover:bg-white/[0.07] transition-all">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <f.icon className="w-6 h-6 text-violet-400" />
                            </div>
                            <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-slate-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
