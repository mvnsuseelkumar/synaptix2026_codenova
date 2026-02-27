import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import SkillBar from '../../components/SkillBar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { getProfile, updateProfile, uploadResume } from '../../api/student'

export default function StudentProfile() {
    const queryClient = useQueryClient()
    const { data: profile, isLoading } = useQuery({ queryKey: ['student-profile'], queryFn: () => getProfile().then(r => r.data) })
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    const { register, handleSubmit } = useForm()

    const updateMutation = useMutation({
        mutationFn: (data) => updateProfile(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['student-profile'] }); toast.success('Profile updated') },
        onError: (e) => toast.error(e.response?.data?.detail || 'Update failed'),
    })

    const handleUpload = useCallback(async (file) => {
        if (!file) return
        if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return }
        if (file.size > 5 * 1024 * 1024) { toast.error('File size exceeds 5MB'); return }
        setUploading(true)
        try {
            await uploadResume(file)
            toast.success('Resume uploaded! Parsing in progress...')
            queryClient.invalidateQueries({ queryKey: ['student-profile'] })
        } catch (e) {
            toast.error(e.response?.data?.detail || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }, [queryClient])

    const onDrop = (e) => {
        e.preventDefault(); setDragOver(false)
        const file = e.dataTransfer.files[0]
        handleUpload(file)
    }

    if (isLoading) return <Sidebar><LoadingSpinner /></Sidebar>

    const skills = profile?.skill_profile ? Object.entries(profile.skill_profile).sort((a, b) => b[1].score - a[1].score) : []

    return (
        <Sidebar>
            <PageHeader title="My Profile" />

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Profile Form */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
                    <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                        <div>
                            <label className="label">Name</label>
                            <input className="input-field" defaultValue={profile?.name} {...register('name')} />
                        </div>
                        <div>
                            <label className="label">Location</label>
                            <input className="input-field" defaultValue={profile?.profile_meta?.location} placeholder="City, Country" {...register('location')} />
                        </div>
                        <div>
                            <label className="label">Institution</label>
                            <input className="input-field" defaultValue={profile?.profile_meta?.institution} placeholder="Your University" {...register('institution')} />
                        </div>
                        <div>
                            <label className="label">Availability</label>
                            <input className="input-field" defaultValue={profile?.profile_meta?.availability} placeholder="Immediate, 2 weeks..." {...register('availability')} />
                        </div>
                        <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
                            {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Resume Upload */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4">Resume</h2>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : 'border-slate-600 hover:border-slate-500'
                            }`}
                        onClick={() => document.getElementById('resume-input').click()}
                    >
                        <input id="resume-input" type="file" accept=".pdf" className="hidden"
                            onChange={(e) => handleUpload(e.target.files[0])} />
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 size={32} className="text-primary animate-spin" />
                                <p className="text-sm text-muted">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload size={32} className="text-slate-500" />
                                <p className="text-sm text-slate-300">Drag & drop or click to upload</p>
                                <p className="text-xs text-muted">PDF only, max 5MB</p>
                            </div>
                        )}
                    </div>

                    {/* Parse Status */}
                    <div className="mt-4">
                        {profile?.resume_parse_status === 'processing' && (
                            <div className="flex items-center gap-2 text-blue-400 text-sm"><Loader2 size={16} className="animate-spin" /> Parsing your resume...</div>
                        )}
                        {profile?.resume_parse_status === 'done' && (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle2 size={16} /> ✓ Parsed successfully — {skills.length} skills detected</div>
                        )}
                        {profile?.resume_parse_status === 'failed' && (
                            <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle size={16} /> Parsing failed — try uploading again</div>
                        )}
                        {profile?.resume_url && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted"><FileText size={14} /> {profile.resume_url.split(/[\\/]/).pop()}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full Skill Profile */}
            {skills.length > 0 && (
                <div className="card mt-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Skill Profile</h2>
                    <div className="overflow-x-auto">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th>Skill</th><th>Score</th><th>Work Exp</th><th>Projects</th><th>Certs</th><th>Courses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {skills.map(([skill, data]) => (
                                    <tr key={skill}>
                                        <td className="font-medium text-white">{skill}</td>
                                        <td className="w-48"><SkillBar skill="" score={data.score} showLabel={false} /></td>
                                        <td className="text-center text-muted">{data.evidence?.work_experience || 0}</td>
                                        <td className="text-center text-muted">{data.evidence?.projects || 0}</td>
                                        <td className="text-center text-muted">{data.evidence?.certifications || 0}</td>
                                        <td className="text-center text-muted">{data.evidence?.courses || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Sidebar>
    )
}
