import { Heart, Shield, Lightbulb, Globe } from 'lucide-react';

export default function About() {
    const values = [
        { icon: Shield, title: 'Fairness First', desc: 'Every algorithm is audited for bias. We ensure equitable opportunity allocation regardless of background.' },
        { icon: Lightbulb, title: 'Transparency', desc: 'No black-box decisions. Every match score comes with clear, human-readable explanations.' },
        { icon: Heart, title: 'Empowerment', desc: 'We help candidates discover their strengths and bridge skill gaps with actionable insights.' },
        { icon: Globe, title: 'Accessibility', desc: 'A platform designed for everyone — students, career changers, and recruiters worldwide.' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        About <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">SkillNova</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        We're on a mission to make hiring fair, transparent, and skill-based. Our AI-powered platform eliminates traditional keyword filtering and replaces it with weighted competency scoring.
                    </p>
                </div>

                <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Traditional hiring is broken. Keyword filters reject qualified candidates, unconscious bias narrows talent pools, and candidates never know why they were rejected. SkillNova fixes this by building a matching engine that scores candidates on actual competency, explains every decision transparently, and applies fairness-aware algorithms to ensure no one is left behind.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-8">Our Core Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {values.map((v) => (
                        <div key={v.title} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/20 transition-all">
                            <v.icon className="w-8 h-8 text-violet-400 mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                            <p className="text-sm text-slate-400">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
