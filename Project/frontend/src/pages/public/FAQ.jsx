import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    { q: 'How does the matching algorithm work?', a: 'Our AI uses weighted competency scoring — each job requirement has a weight, and candidate skills are scored against those weights. The result is a transparent match percentage with detailed breakdowns.' },
    { q: 'Is the platform really bias-free?', a: 'We apply fairness-aware algorithms that detect and normalize score distributions to reduce systemic bias. While no system is perfect, we continuously audit and improve our fairness measures.' },
    { q: 'How are match scores calculated?', a: 'Match scores combine skill proficiency matching (weighted by importance), experience level alignment, and a confidence factor. Each component is shown transparently in the explanation.' },
    { q: 'What makes this different from traditional job boards?', a: 'Traditional platforms use keyword filtering, which rejects qualified candidates. We use competency-based scoring that evaluates actual skill proficiency levels, not just keyword matches.' },
    { q: 'Can I see why I was ranked a certain way?', a: 'Absolutely! Every match comes with a detailed explanation including narrative assessment, skill-by-skill breakdown, strengths, missing skills, and improvement suggestions.' },
    { q: 'Is my data secure?', a: 'Yes. We use JWT-based authentication, encrypted passwords (bcrypt), role-based access control, and maintain a complete audit trail of all decisions.' },
    { q: 'How does skill gap analysis work?', a: 'Our engine compares your skill profile against job requirements and identifies gaps. For each gap, we provide the proficiency difference and actionable suggestions for improvement.' },
    { q: 'Is this platform free for candidates?', a: 'Yes! Candidates can create profiles, add skills, browse jobs, apply, and receive AI recommendations completely free.' },
];

export default function FAQ() {
    const [open, setOpen] = useState(null);

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Frequently Asked <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Questions</span>
                    </h1>
                    <p className="text-lg text-slate-400">Everything you need to know about SkillNova.</p>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                                <span className="font-medium text-white pr-4">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
                            </button>
                            {open === i && (
                                <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed animate-fade-in">{faq.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
