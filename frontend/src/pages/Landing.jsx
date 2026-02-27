import { Link } from 'react-router-dom'
import { Sparkles, Brain, Shield, BarChart3, ArrowRight, CheckCircle2, Upload, Zap, Users } from 'lucide-react'

export default function Landing() {
    return (
        <div className="min-h-screen bg-background">
            {/* Nav */}
            <nav className="border-b border-slate-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">InternMatch</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn-ghost text-sm">Log In</Link>
                        <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                        <Zap size={14} className="text-primary" />
                        <span className="text-sm text-primary-300 font-medium">AI-Powered Matching Engine</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                        Get <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Matched.</span><br />
                        Not Just Applied.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Our AI analyzes your resume, scores your skills by evidence, and matches you with the perfect internship —
                        with full transparency on every score.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-primary text-base px-8 py-3 rounded-xl shadow-glow-lg group">
                            I'm a Student <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/register" className="btn-secondary text-base px-8 py-3 rounded-xl">
                            I'm a Company
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why InternMatch?</h2>
                    <p className="text-muted text-lg max-w-xl mx-auto">Built with fairness, transparency, and AI at its core.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Brain,
                            title: 'Resume AI Parser',
                            desc: 'Our AI extracts skills from your resume and scores them based on work experience, projects, and certifications.',
                            gradient: 'from-primary to-blue-500',
                        },
                        {
                            icon: Shield,
                            title: 'Fair Matching',
                            desc: 'Built-in fairness audits detect institutional bias and apply normalization to ensure equal opportunity.',
                            gradient: 'from-emerald-500 to-teal-500',
                        },
                        {
                            icon: BarChart3,
                            title: 'Transparent Scores',
                            desc: 'See exactly why you ranked where you did with full score breakdowns, comparisons, and improvement tips.',
                            gradient: 'from-secondary to-pink-500',
                        },
                    ].map((feature, i) => (
                        <div key={i} className="card-hover group cursor-default">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon size={24} className="text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-muted leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it Works */}
            <section className="bg-surface/50 border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-muted text-lg">Four simple steps to your perfect match.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: 1, icon: Upload, title: 'Upload Resume', desc: 'Upload your PDF resume and let our AI parse it instantly.' },
                            { step: 2, icon: Brain, title: 'AI Analysis', desc: 'Skills are extracted, scored by evidence, and mapped to opportunities.' },
                            { step: 3, icon: Zap, title: 'Smart Matching', desc: 'Weighted scoring + semantic similarity finds your best matches.' },
                            { step: 4, icon: CheckCircle2, title: 'Get Matched', desc: 'See your rank, score breakdown, and tips to improve.' },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="relative inline-flex mb-4">
                                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                                        <item.icon size={28} className="text-primary" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-muted">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 px-6 py-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-primary" />
                        <span className="text-sm text-muted">InternMatch © 2024. AI-Powered Internship Matching.</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-muted hover:text-white transition-colors">About</a>
                        <a href="#" className="text-sm text-muted hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-sm text-muted hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
