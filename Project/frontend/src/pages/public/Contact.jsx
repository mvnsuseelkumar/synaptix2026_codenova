import { Mail, MapPin, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSent(false), 4000);
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Get In <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Touch</span>
                    </h1>
                    <p className="text-lg text-slate-400">Have questions? We'd love to hear from you.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {[
                            { icon: Mail, label: 'Email', value: 'support@synaptix.ai' },
                            { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
                            { icon: MessageSquare, label: 'Support', value: 'Mon-Fri, 9am-6pm PST' },
                        ].map((c) => (
                            <div key={c.label} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                    <c.icon className="w-6 h-6 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">{c.label}</p>
                                    <p className="text-white font-medium">{c.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        {sent && <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">Message sent! We'll get back to you soon.</div>}
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Name</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Message</label>
                            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none resize-none" />
                        </div>
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
