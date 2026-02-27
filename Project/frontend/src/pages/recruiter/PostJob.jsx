import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { Plus, X, Save, Briefcase } from 'lucide-react';

export default function PostJob() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', company: '', location: '', job_type: 'internship',
        experience_level: 'beginner', complexity: 'medium', duration: '', stipend: '',
        required_skills: [{ name: '', weight: 0, min_proficiency: 5 }]
    });

    const addSkill = () => setForm(f => ({ ...f, required_skills: [...f.required_skills, { name: '', weight: 0, min_proficiency: 5 }] }));
    const removeSkill = (i) => setForm(f => ({ ...f, required_skills: f.required_skills.filter((_, j) => j !== i) }));
    const updateSkill = (i, field, value) => { const skills = [...form.required_skills]; skills[i] = { ...skills[i], [field]: value }; setForm(f => ({ ...f, required_skills: skills })); };
    const totalWeight = form.required_skills.reduce((s, sk) => s + sk.weight, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (totalWeight !== 100) { alert('Skill weights must sum to 100%'); return; }
        if (form.required_skills.some(s => !s.name)) { alert('All skills must have a name'); return; }
        setSaving(true);
        try { await jobsAPI.create(form); navigate('/recruiter/listings'); } catch (err) { alert(err.response?.data?.detail || 'Failed to post job'); }
        setSaving(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3"><Briefcase className="w-6 h-6 text-violet-400" /><h1 className="text-2xl font-bold text-white">Post New Job</h1></div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h2 className="font-semibold text-white">Job Details</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2"><label className="block text-sm text-slate-400 mb-1">Job Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none" placeholder="e.g. Machine Learning Intern" /></div>
                        <div><label className="block text-sm text-slate-400 mb-1">Company</label><input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none" /></div>
                        <div><label className="block text-sm text-slate-400 mb-1">Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none" /></div>
                        <div><label className="block text-sm text-slate-400 mb-1">Type</label><select value={form.job_type} onChange={e => setForm(f => ({ ...f, job_type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none"><option value="internship">Internship</option><option value="project">Project</option><option value="full-time">Full Time</option><option value="part-time">Part Time</option></select></div>
                        <div><label className="block text-sm text-slate-400 mb-1">Experience Level</label><select value={form.experience_level} onChange={e => setForm(f => ({ ...f, experience_level: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select></div>
                        <div><label className="block text-sm text-slate-400 mb-1">Duration</label><input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 3 months" className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none" /></div>
                        <div><label className="block text-sm text-slate-400 mb-1">Stipend</label><input value={form.stipend} onChange={e => setForm(f => ({ ...f, stipend: e.target.value }))} placeholder="e.g. $2000/month" className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none" /></div>
                        <div className="sm:col-span-2"><label className="block text-sm text-slate-400 mb-1">Description *</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none resize-none" /></div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div><h2 className="font-semibold text-white">Required Skills & Weights</h2><p className="text-xs text-slate-500 mt-1">Weights must sum to 100%. Current: <span className={totalWeight === 100 ? 'text-emerald-400' : 'text-red-400'}>{totalWeight}%</span></p></div>
                        <button type="button" onClick={addSkill} className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"><Plus className="w-4 h-4" /> Add Skill</button>
                    </div>
                    {form.required_skills.map((skill, i) => (
                        <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-white/5 border border-white/10">
                            <input value={skill.name} onChange={e => updateSkill(i, 'name', e.target.value)} placeholder="Skill name" className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-violet-500 focus:outline-none" />
                            <div className="flex items-center gap-2"><label className="text-xs text-slate-500">Weight</label><input type="number" value={skill.weight} onChange={e => updateSkill(i, 'weight', parseInt(e.target.value) || 0)} min={0} max={100} className="w-16 px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm text-center focus:border-violet-500 focus:outline-none" /><span className="text-xs text-slate-500">%</span></div>
                            <div className="flex items-center gap-2"><label className="text-xs text-slate-500">Min</label><input type="number" value={skill.min_proficiency} onChange={e => updateSkill(i, 'min_proficiency', parseInt(e.target.value) || 1)} min={1} max={10} className="w-14 px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm text-center focus:border-violet-500 focus:outline-none" /></div>
                            {form.required_skills.length > 1 && <button type="button" onClick={() => removeSkill(i)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>}
                        </div>
                    ))}
                </div>

                <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />{saving ? 'Posting...' : 'Post Job'}
                </button>
            </form>
        </div>
    );
}
