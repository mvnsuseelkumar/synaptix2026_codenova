import { useState, useEffect, useRef } from 'react';
import { applicantAPI, resumeAPI } from '../../services/api';
import { Save, Plus, X, User, GraduationCap, Briefcase, FolderKanban, Github, Linkedin, FileUp, FileText, Trash2, Download, Upload, CheckCircle, Shield, ShieldCheck, ShieldAlert, ShieldX, Loader2, ExternalLink, Star, GitFork, Globe } from 'lucide-react';

export default function Profile() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState({
        name: '', title: '', bio: '', phone: '', location: '',
        education: [], experience: [], projects: [], certifications: [], portfolio_links: [],
        github_url: '', linkedin_url: '', skills: []
    });

    // Resume state
    const [resume, setResume] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    // GitHub validation state
    const [validating, setValidating] = useState(null); // index of project being validated
    const [validationResults, setValidationResults] = useState({}); // {index: result}

    useEffect(() => { loadProfile(); loadResume(); }, []);

    const loadProfile = async () => {
        try {
            const res = await applicantAPI.getProfile();
            const p = res.data.profile || {};
            setProfile({
                name: p.name || res.data.name || '', title: p.title || '', bio: p.bio || '',
                phone: p.phone || '', location: p.location || '',
                education: p.education || [], experience: p.experience || [],
                projects: p.projects || [],
                certifications: p.certifications || [], portfolio_links: p.portfolio_links || [],
                github_url: p.github_url || '', linkedin_url: p.linkedin_url || '', skills: p.skills || []
            });
        } catch (e) { /* ignore */ }
    };

    const loadResume = async () => {
        try {
            const res = await resumeAPI.getInfo();
            setResume(res.data.resume);
        } catch (e) { /* ignore */ }
    };

    const save = async () => {
        setSaving(true);
        try { await applicantAPI.updateProfile(profile); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch (e) { /* ignore */ }
        setSaving(false);
    };

    const addEducation = () => setProfile(p => ({ ...p, education: [...p.education, { degree: '', institution: '', year: '', gpa: '' }] }));
    const addExperience = () => setProfile(p => ({ ...p, experience: [...p.experience, { title: '', company: '', duration: '', description: '' }] }));
    const addProject = () => setProfile(p => ({ ...p, projects: [...p.projects, { name: '', description: '', github_url: '', skills_used: [], duration_months: 1, complexity: 'medium', validation: null }] }));
    const addCert = () => setProfile(p => ({ ...p, certifications: [...p.certifications, ''] }));

    const updateListItem = (field, idx, key, val) => {
        const arr = [...profile[field]];
        arr[idx] = typeof arr[idx] === 'string' ? val : { ...arr[idx], [key]: val };
        setProfile(p => ({ ...p, [field]: arr }));
    };
    const removeListItem = (field, idx) => setProfile(p => ({ ...p, [field]: p[field].filter((_, j) => j !== idx) }));

    const updateProjectSkills = (idx, val) => {
        const arr = [...profile.projects];
        arr[idx] = { ...arr[idx], _skills_text: val, skills_used: val.split(',').map(s => s.trim()).filter(Boolean) };
        setProfile(p => ({ ...p, projects: arr }));
    };

    // Resume handlers
    const validateFile = (file) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) {
            setUploadMsg({ type: 'error', text: `Invalid format: ${ext}. Only PDF, DOC, DOCX allowed.` });
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadMsg({ type: 'error', text: `File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Max 5MB.` });
            return false;
        }
        return true;
    };

    const handleUpload = async (file) => {
        if (!validateFile(file)) return;
        setUploading(true);
        setUploadProgress(0);
        setUploadMsg({ type: '', text: '' });

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress(p => Math.min(p + 15, 90));
        }, 200);

        try {
            const res = await resumeAPI.upload(file);
            clearInterval(progressInterval);
            setUploadProgress(100);
            setResume(res.data.resume);
            setUploadMsg({ type: 'success', text: 'Resume uploaded successfully!' });
            setTimeout(() => setUploadMsg({ type: '', text: '' }), 4000);
        } catch (e) {
            clearInterval(progressInterval);
            const msg = e.response?.data?.detail || 'Upload failed. Please try again.';
            setUploadMsg({ type: 'error', text: msg });
        }
        setUploading(false);
        setUploadProgress(0);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDownload = async () => {
        try {
            const res = await resumeAPI.download();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = resume?.file_name || 'resume';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) { /* ignore */ }
    };

    const handleDelete = async () => {
        if (!confirm('Delete your resume? This cannot be undone.')) return;
        try {
            await resumeAPI.delete();
            setResume(null);
            setUploadMsg({ type: 'success', text: 'Resume deleted.' });
            setTimeout(() => setUploadMsg({ type: '', text: '' }), 3000);
        } catch (e) { /* ignore */ }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch { return iso; }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none";
    const smallInputClass = "px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-violet-500 focus:outline-none";

    // GitHub validation handler
    const validateProject = async (index) => {
        const proj = profile.projects[index];
        if (!proj.github_url) return;
        if (!proj.skills_used || proj.skills_used.length === 0) { alert('Please add at least one skill before verifying.'); return; }

        setValidating(index);
        try {
            const res = await applicantAPI.validateProject({
                github_url: proj.github_url,
                skills_used: proj.skills_used,
                project_index: index
            });
            setValidationResults(prev => ({ ...prev, [index]: res.data }));
            // Update project validation in local state
            const arr = [...profile.projects];
            if (res.data.is_valid) {
                arr[index] = { ...arr[index], validation: { status: res.data.status, message: res.data.message, confidence_score: res.data.skill_analysis?.confidence_score, verified_skills: res.data.skill_analysis?.verified_skills || [], unmatched_skills: res.data.skill_analysis?.unmatched_skills || [], repo_name: res.data.repo_info?.full_name, languages: res.data.repo_info?.languages || {} } };
            } else {
                arr[index] = { ...arr[index], validation: { status: 'invalid', message: res.data.message } };
            }
            setProfile(p => ({ ...p, projects: arr }));
        } catch (e) {
            setValidationResults(prev => ({ ...prev, [index]: { is_valid: false, status: 'error', message: e.response?.data?.detail || 'Validation failed' } }));
        }
        setValidating(null);
    };

    const getStatusBadge = (validation) => {
        if (!validation) return null;
        const map = {
            verified: { icon: ShieldCheck, color: 'emerald', label: 'Verified' },
            partial: { icon: ShieldAlert, color: 'amber', label: 'Partial Match' },
            mismatch: { icon: ShieldX, color: 'red', label: 'Mismatch' },
            invalid: { icon: ShieldX, color: 'red', label: 'Invalid' },
            error: { icon: ShieldX, color: 'red', label: 'Error' },
        };
        const cfg = map[validation.status] || map.invalid;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${cfg.color}-500/10 text-${cfg.color}-400 border border-${cfg.color}-500/20`}>
                <Icon className="w-3 h-3" />{cfg.label}
            </span>
        );
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Profile Builder</h1>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50">
                    <Save className="w-4 h-4" />{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Profile'}
                </button>
            </div>

            {/* Personal */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><User className="w-5 h-5 text-violet-400" /> Personal Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-slate-400 mb-1">Full Name</label><input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className={inputClass} /></div>
                    <div><label className="block text-sm text-slate-400 mb-1">Title</label><input value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} placeholder="e.g. CS Student" className={inputClass + " placeholder-slate-600"} /></div>
                    <div><label className="block text-sm text-slate-400 mb-1">Phone</label><input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className={inputClass} /></div>
                    <div><label className="block text-sm text-slate-400 mb-1">Location</label><input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} className={inputClass} /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1">Bio</label><textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} className={inputClass + " resize-none"} /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-slate-400 mb-1 flex items-center gap-1"><Github className="w-3 h-3" /> GitHub</label><input value={profile.github_url} onChange={e => setProfile(p => ({ ...p, github_url: e.target.value }))} className={inputClass} /></div>
                    <div><label className="block text-sm text-slate-400 mb-1 flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn</label><input value={profile.linkedin_url} onChange={e => setProfile(p => ({ ...p, linkedin_url: e.target.value }))} className={inputClass} /></div>
                </div>
            </section>

            {/* Resume Upload */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><FileUp className="w-5 h-5 text-violet-400" /> Resume / Document</h2>

                {!resume ? (
                    <>
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-violet-400 bg-violet-500/10' : 'border-slate-600 hover:border-slate-500 hover:bg-white/5'}`}
                        >
                            <Upload className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                            <p className="text-sm text-slate-300 font-medium">
                                {dragOver ? 'Drop your file here' : 'Drag & drop your resume, or click to browse'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Supported formats: PDF, DOC, DOCX — Max size: 5MB</p>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                    </>
                ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{resume.file_name}</p>
                                <p className="text-xs text-slate-500">
                                    {resume.file_type} • {formatFileSize(resume.file_size)} • Uploaded: {formatDate(resume.uploaded_at)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={handleDownload} title="Download" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} title="Replace" className="p-2 rounded-lg bg-white/5 hover:bg-violet-500/20 text-slate-400 hover:text-violet-400 transition-all">
                                    <Upload className="w-4 h-4" />
                                </button>
                                <button onClick={handleDelete} title="Delete" className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                    </div>
                )}

                {/* Upload progress */}
                {uploading && (
                    <div className="space-y-1">
                        <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 text-right">{uploadProgress}%</p>
                    </div>
                )}

                {/* Status messages */}
                {uploadMsg.text && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${uploadMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {uploadMsg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                        {uploadMsg.text}
                    </div>
                )}
            </section>

            {/* Education */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2"><GraduationCap className="w-5 h-5 text-violet-400" /> Education</h2>
                    <button onClick={addEducation} className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"><Plus className="w-4 h-4" /> Add</button>
                </div>
                {profile.education.map((edu, i) => (
                    <div key={i} className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 relative">
                        <button onClick={() => removeListItem('education', i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                        {['degree', 'institution', 'year', 'gpa'].map(f => (
                            <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={edu[f] || ''} onChange={e => updateListItem('education', i, f, e.target.value)} className={smallInputClass} />
                        ))}
                    </div>
                ))}
            </section>

            {/* Experience */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-violet-400" /> Experience</h2>
                    <button onClick={addExperience} className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"><Plus className="w-4 h-4" /> Add</button>
                </div>
                {profile.experience.map((exp, i) => (
                    <div key={i} className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 relative">
                        <button onClick={() => removeListItem('experience', i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                        {['title', 'company', 'duration', 'description'].map(f => (
                            <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={exp[f] || ''} onChange={e => updateListItem('experience', i, f, e.target.value)} className={smallInputClass} />
                        ))}
                    </div>
                ))}
            </section>

            {/* Projects */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2"><FolderKanban className="w-5 h-5 text-violet-400" /> Projects</h2>
                    <button onClick={addProject} className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"><Plus className="w-4 h-4" /> Add</button>
                </div>
                <p className="text-xs text-slate-500">Projects boost your match score. Add a GitHub link to verify your tech stack.</p>
                {profile.projects.map((proj, i) => {
                    const vResult = validationResults[i] || null;
                    const vStatus = proj.validation || null;
                    return (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 relative space-y-3">
                            <button onClick={() => removeListItem('projects', i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                            {/* Status badge */}
                            {vStatus && <div className="absolute top-3 right-10">{getStatusBadge(vStatus)}</div>}
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Project Name *</label>
                                    <input value={proj.name || ''} onChange={e => updateListItem('projects', i, 'name', e.target.value)} placeholder="e.g. Sentiment Analyzer" className={smallInputClass + " w-full"} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Description</label>
                                    <input value={proj.description || ''} onChange={e => updateListItem('projects', i, 'description', e.target.value)} placeholder="Brief description" className={smallInputClass + " w-full"} />
                                </div>
                            </div>
                            {/* GitHub URL + Verify */}
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1"><Github className="w-3 h-3" /> GitHub Repository URL</label>
                                <div className="flex gap-2">
                                    <input value={proj.github_url || ''} onChange={e => updateListItem('projects', i, 'github_url', e.target.value)} placeholder="https://github.com/username/repo" className={smallInputClass + " flex-1"} />
                                    <button
                                        onClick={() => validateProject(i)}
                                        disabled={!proj.github_url || validating === i}
                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                                    >
                                        {validating === i ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...</> : <><Shield className="w-3.5 h-3.5" /> Verify</>}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Skills Used (comma separated) *</label>
                                <input value={proj._skills_text !== undefined ? proj._skills_text : (proj.skills_used || []).join(', ')} onChange={e => updateProjectSkills(i, e.target.value)} placeholder="e.g. Python, Machine Learning, TensorFlow" className={smallInputClass + " w-full"} />
                                {proj.skills_used?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {proj.skills_used.map((s, j) => {
                                            const verified = vStatus?.verified_skills?.map(v => v.toLowerCase()).includes(s.toLowerCase());
                                            const unmatched = vStatus?.unmatched_skills?.map(v => v.toLowerCase()).includes(s.toLowerCase());
                                            return (
                                                <span key={j} className={`px-2 py-0.5 rounded-md text-xs border ${verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    unmatched ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                                    }`}>
                                                    {verified && <span className="mr-1">✓</span>}
                                                    {unmatched && <span className="mr-1">✗</span>}
                                                    {s}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Duration (months)</label>
                                    <input type="number" min={1} max={60} value={proj.duration_months || 1} onChange={e => updateListItem('projects', i, 'duration_months', parseInt(e.target.value) || 1)} className={smallInputClass + " w-full"} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Complexity</label>
                                    <select value={proj.complexity || 'medium'} onChange={e => updateListItem('projects', i, 'complexity', e.target.value)} className={smallInputClass + " w-full"}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Validation Results Panel */}
                            {vResult && vResult.is_valid && vResult.repo_info && (
                                <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-violet-400" />
                                            {vResult.repo_info.full_name}
                                        </p>
                                        <a href={vResult.repo_info.html_url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                                            <ExternalLink className="w-3 h-3" /> View
                                        </a>
                                    </div>
                                    {vResult.repo_info.description && <p className="text-xs text-slate-400">{vResult.repo_info.description}</p>}
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {vResult.repo_info.stars}</span>
                                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {vResult.repo_info.forks}</span>
                                        {vResult.repo_info.primary_language && <span className="text-violet-400">{vResult.repo_info.primary_language}</span>}
                                        {vResult.repo_info.is_fork && <span className="text-amber-400">⚠ Forked repo</span>}
                                    </div>
                                    {/* Detected Languages */}
                                    {Object.keys(vResult.repo_info.languages || {}).length > 0 && (
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1.5">Detected Languages</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {Object.entries(vResult.repo_info.languages).sort((a, b) => b[1] - a[1]).map(([lang, pct]) => (
                                                    <span key={lang} className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">{lang} <span className="text-violet-400">{pct}%</span></span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Confidence */}
                                    {vResult.skill_analysis && (
                                        <div>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-slate-500">Skill Confidence</span>
                                                <span className={`font-medium ${vResult.skill_analysis.confidence_score >= 70 ? 'text-emerald-400' : vResult.skill_analysis.confidence_score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{vResult.skill_analysis.confidence_score}%</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${vResult.skill_analysis.confidence_score >= 70 ? 'bg-emerald-500' : vResult.skill_analysis.confidence_score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${vResult.skill_analysis.confidence_score}%` }} />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{vResult.skill_analysis.total_verified}/{vResult.skill_analysis.total_claimed} skills verified</p>
                                        </div>
                                    )}
                                    {/* Message */}
                                    <p className={`text-xs ${vResult.status === 'verified' ? 'text-emerald-400' : vResult.status === 'partial' ? 'text-amber-400' : 'text-red-400'}`}>{vResult.message}</p>
                                </div>
                            )}
                            {/* Error / Invalid message */}
                            {vResult && !vResult.is_valid && (
                                <div className="mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                                    <ShieldX className="w-4 h-4 flex-shrink-0" />
                                    {vResult.message}
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>

            {/* Certifications */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Certifications</h2>
                    <button onClick={addCert} className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"><Plus className="w-4 h-4" /> Add</button>
                </div>
                {profile.certifications.map((cert, i) => (
                    <div key={i} className="flex gap-2">
                        <input value={cert} onChange={e => updateListItem('certifications', i, null, e.target.value)} placeholder="Certification name" className={smallInputClass + " flex-1"} />
                        <button onClick={() => removeListItem('certifications', i)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                    </div>
                ))}
            </section>
        </div>
    );
}
