import { Link } from 'react-router-dom';
import { Zap, Shield, BarChart3, Target, Users, Brain, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
    const stats = [
        { label: 'Match Accuracy', value: '94%' },
        { label: 'Bias Reduction', value: '89%' },
        { label: 'Candidates Matched', value: '12K+' },
        { label: 'Active Companies', value: '350+' },
    ];

    const features = [
        { icon: Brain, title: 'AI-Powered Matching', desc: 'Weighted competency scoring maps your skills to real opportunities.' },
        { icon: Shield, title: 'Fairness-Aware', desc: 'Bias detection and normalization ensures equitable opportunity allocation.' },
        { icon: BarChart3, title: 'Explainable Scores', desc: 'Every match comes with transparent reasoning and skill breakdowns.' },
        { icon: Target, title: 'Skill Gap Analysis', desc: 'Discover exactly what to learn to qualify for your dream roles.' },
        { icon: Users, title: 'Smart Rankings', desc: 'Recruiters see ranked candidates with clear justification.' },
        { icon: Sparkles, title: 'No Keyword Bias', desc: 'Competency-based scoring replaces outdated keyword filtering.' },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/50 via-slate-950 to-slate-950" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-500/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-40 left-20 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-60 right-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
                        <Zap className="w-4 h-4 text-violet-400" />
                        <span className="text-sm text-violet-300 font-medium">AI-Powered Skill Matching Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Where <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Skills</span> Meet{' '}
                        <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Opportunity</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        An explainable, fairness-aware internship and project matching platform that eliminates bias and ensures transparent, data-driven opportunity allocation.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-2xl shadow-violet-500/25 flex items-center gap-2 text-lg">
                            Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/features" className="px-8 py-4 bg-white/5 text-white font-semibold rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-lg">
                            Learn More
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-20">
                        {stats.map((stat) => (
                            <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{stat.value}</p>
                                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Built for <span className="text-violet-400">Fair</span> & <span className="text-fuchsia-400">Transparent</span> Matching
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div key={f.title} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 hover:bg-white/[0.07] transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <f.icon className="w-6 h-6 text-violet-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-20">
                    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                        <h2 className="text-2xl font-bold text-white mb-3">Ready to Experience Fair Matching?</h2>
                        <p className="text-slate-400 mb-6">Join thousands of candidates and recruiters using AI-powered, bias-free matching.</p>
                        <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25">
                            Create Free Account <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
