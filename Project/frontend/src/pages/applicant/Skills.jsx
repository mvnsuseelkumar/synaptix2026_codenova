import { useState, useEffect } from 'react';
import { applicantAPI } from '../../services/api';
import { SkillRadarChart } from '../../components/MatchScoreCard';
import { Plus, X, Save, Target } from 'lucide-react';

const COMMON_SKILLS = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'C++', 'SQL',
    'Machine Learning', 'TensorFlow', 'Docker', 'Git', 'AWS', 'MongoDB', 'PostgreSQL',
    'HTML/CSS', 'R', 'Tableau', 'Statistics', 'Data Analysis', 'Flask', 'FastAPI',
    'Kubernetes', 'Linux', 'Figma', 'REST APIs', 'GraphQL', 'Redis', 'Spark'
];

export default function Skills() {
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => { loadSkills(); }, []);

    const loadSkills = async () => {
        try { const res = await applicantAPI.getProfile(); setSkills(res.data.profile?.skills || []); } catch (e) { /* ignore */ }
    };

    const addSkill = (name) => {
        if (!name.trim() || skills.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
        setSkills([...skills, { name: name.trim(), proficiency: 5 }]);
        setNewSkill(''); setSuggestions([]);
    };

    const updateProficiency = (index, value) => { const updated = [...skills]; updated[index].proficiency = value; setSkills(updated); };
    const removeSkill = (index) => setSkills(skills.filter((_, i) => i !== index));

    const save = async () => {
        setSaving(true);
        try { await applicantAPI.updateProfile({ skills }); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch (e) { /* ignore */ }
        setSaving(false);
    };

    const handleInput = (val) => {
        setNewSkill(val);
        if (val.length > 0) {
            setSuggestions(COMMON_SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !skills.find(sk => sk.name.toLowerCase() === s.toLowerCase())).slice(0, 5));
        } else { setSuggestions([]); }
    };

    const profLabels = { 1: 'Beginner', 2: 'Basic', 3: 'Developing', 4: 'Competent', 5: 'Proficient', 6: 'Skilled', 7: 'Advanced', 8: 'Expert', 9: 'Master', 10: 'World-Class' };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Target className="w-6 h-6 text-violet-400" /> Skill Manager</h1>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl transition-all disabled:opacity-50">
                    <Save className="w-4 h-4" />{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Skills'}
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative">
                        <div className="flex gap-2">
                            <input value={newSkill} onChange={e => handleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill(newSkill)} placeholder="Add a skill..." className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
                            <button onClick={() => addSkill(newSkill)} className="px-4 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                        {suggestions.length > 0 && (
                            <div className="absolute left-4 right-4 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-xl">
                                {suggestions.map(s => <button key={s} onClick={() => addSkill(s)} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-violet-500/10 hover:text-white transition-all">{s}</button>)}
                            </div>
                        )}
                    </div>

                    {skills.length === 0 ? (
                        <div className="text-center py-12 text-slate-500"><Target className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>No skills added yet.</p></div>
                    ) : (
                        <div className="space-y-3">
                            {skills.map((skill, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/20 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-white">{skill.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${skill.proficiency >= 7 ? 'text-emerald-400 bg-emerald-500/10' : skill.proficiency >= 4 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                                {profLabels[skill.proficiency] || 'Level ' + skill.proficiency}
                                            </span>
                                            <button onClick={() => removeSkill(i)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input type="range" min={1} max={10} value={skill.proficiency} onChange={e => updateProficiency(i, parseInt(e.target.value))} className="flex-1 accent-violet-500" />
                                        <span className="w-8 text-center text-sm font-bold text-violet-400">{skill.proficiency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 sticky top-20">
                    <h2 className="text-lg font-semibold text-white mb-4">Skills Visualization</h2>
                    {skills.length >= 3 ? <SkillRadarChart skills={skills} /> : <div className="text-center py-16 text-slate-500"><p>Add at least 3 skills to see radar chart</p></div>}
                    <div className="mt-4 text-center"><span className="text-sm text-slate-500">{skills.length} skill{skills.length !== 1 ? 's' : ''} added</span></div>
                </div>
            </div>
        </div>
    );
}
