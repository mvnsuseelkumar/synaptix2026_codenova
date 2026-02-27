import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, ChevronLeft, Plus, X, Loader2, Check } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import SkillChip from '../../components/SkillChip'
import { createOpportunity } from '../../api/company'

const step1Schema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    domain: z.string().optional(),
    mode: z.string().default('remote'),
    duration: z.string().optional(),
    location: z.string().optional(),
    stipend: z.string().optional(),
})

export default function NewOpportunity() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [mustHaveSkills, setMustHaveSkills] = useState([])
    const [skillInput, setSkillInput] = useState('')
    const [skillWeights, setSkillWeights] = useState({})
    const [minThreshold, setMinThreshold] = useState(2.0)

    const form = useForm({ resolver: zodResolver(step1Schema), defaultValues: { mode: 'remote' } })

    const mutation = useMutation({
        mutationFn: (data) => createOpportunity(data),
        onSuccess: () => { toast.success('Opportunity posted!'); navigate('/company/dashboard') },
        onError: (e) => toast.error(e.response?.data?.detail || 'Failed to create'),
    })

    const addSkill = () => {
        const s = skillInput.trim()
        if (s && !mustHaveSkills.includes(s)) {
            setMustHaveSkills([...mustHaveSkills, s])
            setSkillWeights({ ...skillWeights, [s]: 0 })
        }
        setSkillInput('')
    }

    const removeSkill = (skill) => {
        setMustHaveSkills(mustHaveSkills.filter(s => s !== skill))
        const w = { ...skillWeights }; delete w[skill]; setSkillWeights(w)
    }

    const totalWeight = Object.values(skillWeights).reduce((s, v) => s + v, 0)

    const handlePost = () => {
        const formData = form.getValues()
        if (totalWeight !== 100) { toast.error('Skill weights must sum to 100'); return }
        mutation.mutate({
            ...formData,
            must_have_skills: mustHaveSkills,
            skill_weights: skillWeights,
            min_score_threshold: minThreshold,
        })
    }

    const steps = [
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Skills Config' },
        { num: 3, label: 'Review & Post' },
    ]

    return (
        <Sidebar>
            <PageHeader title="Post New Opportunity" breadcrumbs={[{ label: 'Dashboard', href: '/company/dashboard' }, { label: 'New Opportunity' }]} />

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {steps.map((s, i) => (
                    <div key={s.num} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.num ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'
                            }`}>
                            {step > s.num ? <Check size={16} /> : s.num}
                        </div>
                        <span className={`text-sm hidden sm:inline ${step >= s.num ? 'text-white' : 'text-muted'}`}>{s.label}</span>
                        {i < steps.length - 1 && <ChevronRight size={16} className="text-slate-600" />}
                    </div>
                ))}
            </div>

            <div className="card max-w-3xl mx-auto">
                {/* Step 1 */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                        <div>
                            <label className="label">Title *</label>
                            <input className="input-field" placeholder="Frontend Developer Intern" {...form.register('title')} />
                            {form.formState.errors.title && <p className="text-red-400 text-xs mt-1">{form.formState.errors.title.message}</p>}
                        </div>
                        <div>
                            <label className="label">Description *</label>
                            <textarea className="input-field min-h-[120px]" placeholder="Describe the role, responsibilities, and requirements..." {...form.register('description')} />
                            {form.formState.errors.description && <p className="text-red-400 text-xs mt-1">{form.formState.errors.description.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Domain</label>
                                <select className="input-field" {...form.register('domain')}>
                                    <option value="">Select Domain</option>
                                    {['Web Development', 'Data Science', 'Mobile', 'DevOps', 'AI/ML', 'Design', 'Backend', 'Frontend', 'Full Stack'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Mode</label>
                                <select className="input-field" {...form.register('mode')}>
                                    <option value="remote">Remote</option>
                                    <option value="onsite">Onsite</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="label">Duration</label><input className="input-field" placeholder="3 months" {...form.register('duration')} /></div>
                            <div><label className="label">Location</label><input className="input-field" placeholder="San Francisco, CA" {...form.register('location')} /></div>
                            <div><label className="label">Stipend</label><input className="input-field" placeholder="$1000/mo" {...form.register('stipend')} /></div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={async () => { const valid = await form.trigger(); if (valid) setStep(2) }} className="btn-primary">
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Skills Configuration</h2>

                        <div>
                            <label className="label">Must-Have Skills</label>
                            <div className="flex gap-2">
                                <input
                                    className="input-field flex-1"
                                    placeholder="Type a skill name and press Enter"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                                />
                                <button onClick={addSkill} className="btn-secondary"><Plus size={16} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {mustHaveSkills.map(s => <SkillChip key={s} skill={s} variant="required" onRemove={removeSkill} />)}
                            </div>
                        </div>

                        {mustHaveSkills.length > 0 && (
                            <div>
                                <label className="label">Skill Weights (must sum to 100)</label>
                                <div className="space-y-3">
                                    {mustHaveSkills.map(skill => (
                                        <div key={skill} className="flex items-center gap-4">
                                            <span className="text-sm text-slate-300 w-32 shrink-0">{skill}</span>
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={skillWeights[skill] || 0}
                                                onChange={(e) => setSkillWeights({ ...skillWeights, [skill]: parseInt(e.target.value) })}
                                                className="flex-1 accent-primary"
                                            />
                                            <span className="text-sm font-semibold text-white w-12 text-right">{skillWeights[skill] || 0}%</span>
                                        </div>
                                    ))}
                                </div>
                                <div className={`mt-3 text-sm font-medium ${totalWeight === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    Total: {totalWeight}/100 {totalWeight === 100 ? '✓' : '(must equal 100)'}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="label">Minimum Score Threshold: {minThreshold.toFixed(1)}</label>
                            <input
                                type="range" min="1" max="3" step="0.1"
                                value={minThreshold}
                                onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                                className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted"><span>1.0 (lenient)</span><span>3.0 (strict)</span></div>
                        </div>

                        <div className="flex justify-between">
                            <button onClick={() => setStep(1)} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
                            <button onClick={() => setStep(3)} className="btn-primary">Next <ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Review & Post</h2>

                        <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-muted">Title:</span> <span className="text-white font-medium ml-2">{form.getValues('title')}</span></div>
                                <div><span className="text-muted">Domain:</span> <span className="text-white ml-2">{form.getValues('domain') || 'N/A'}</span></div>
                                <div><span className="text-muted">Mode:</span> <span className="text-white capitalize ml-2">{form.getValues('mode')}</span></div>
                                <div><span className="text-muted">Duration:</span> <span className="text-white ml-2">{form.getValues('duration') || 'N/A'}</span></div>
                                <div><span className="text-muted">Location:</span> <span className="text-white ml-2">{form.getValues('location') || 'N/A'}</span></div>
                                <div><span className="text-muted">Stipend:</span> <span className="text-white ml-2">{form.getValues('stipend') || 'N/A'}</span></div>
                            </div>

                            <div>
                                <span className="text-muted text-sm">Description:</span>
                                <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">{form.getValues('description')}</p>
                            </div>

                            <div>
                                <span className="text-muted text-sm">Required Skills:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {mustHaveSkills.map(s => (
                                        <span key={s} className="text-sm text-white">{s} ({skillWeights[s]}%)</span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span className="text-muted text-sm">Min Threshold:</span>
                                <span className="text-white text-sm ml-2">{minThreshold.toFixed(1)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button onClick={() => setStep(2)} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
                            <button onClick={handlePost} disabled={mutation.isPending} className="btn-primary">
                                {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Post Opportunity'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Sidebar>
    )
}
