import { UserPlus, Target, Sparkles, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        { icon: UserPlus, step: '01', title: 'Create Your Profile', desc: 'Sign up and build your skill profile with proficiency levels. Add education, experience, and certifications.' },
        { icon: Target, step: '02', title: 'AI Scores Your Skills', desc: 'Our weighted competency engine maps your skills to job requirements, assigning transparent scores to each match.' },
        { icon: Sparkles, step: '03', title: 'Get Matched & Explained', desc: 'Receive AI-powered job recommendations with detailed explanations — see exactly why each job is a good fit.' },
        { icon: CheckCircle, step: '04', title: 'Apply with Confidence', desc: 'Apply to matched positions knowing your score. Recruiters see fair rankings with explainable reasoning.' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        How It <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Works</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">Four simple steps to fair, AI-powered opportunity matching.</p>
                </div>

                <div className="space-y-8">
                    {steps.map((s, i) => (
                        <div key={s.step} className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center">
                                <s.icon className="w-7 h-7 text-violet-400" />
                            </div>
                            <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-bold text-violet-400">STEP {s.step}</span>
                                    <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                                </div>
                                <p className="text-slate-400">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
