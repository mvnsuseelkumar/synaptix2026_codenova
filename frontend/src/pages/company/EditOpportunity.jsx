import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Loader2, Save, Trash2 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import { getOpportunity, updateOpportunity, deleteOpportunity } from '../../api/company'
import { useState } from 'react'

export default function EditOpportunity() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showDelete, setShowDelete] = useState(false)

    const { data: opp, isLoading } = useQuery({
        queryKey: ['company-opp', id],
        queryFn: () => getOpportunity(id).then(r => r.data),
    })

    const { register, handleSubmit } = useForm()

    const updateMut = useMutation({
        mutationFn: (data) => updateOpportunity(id, data),
        onSuccess: () => { toast.success('Opportunity updated'); queryClient.invalidateQueries({ queryKey: ['company-opp', id] }) },
        onError: (e) => toast.error(e.response?.data?.detail || 'Update failed'),
    })

    const deleteMut = useMutation({
        mutationFn: () => deleteOpportunity(id),
        onSuccess: () => { toast.success('Opportunity closed'); navigate('/company/dashboard') },
        onError: (e) => toast.error(e.response?.data?.detail || 'Delete failed'),
    })

    if (isLoading) return <Sidebar><LoadingSpinner /></Sidebar>
    if (!opp) return <Sidebar><div className="text-muted">Opportunity not found</div></Sidebar>

    return (
        <Sidebar>
            <PageHeader
                title={`Edit: ${opp.title}`}
                breadcrumbs={[{ label: 'Dashboard', href: '/company/dashboard' }, { label: 'Edit Opportunity' }]}
                action={<button onClick={() => setShowDelete(true)} className="btn-danger text-sm"><Trash2 size={14} /> Close Opportunity</button>}
            />

            <div className="card max-w-3xl">
                <form onSubmit={handleSubmit((data) => {
                    const cleaned = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== '' && v !== undefined))
                    updateMut.mutate(cleaned)
                })} className="space-y-4">
                    <div>
                        <label className="label">Title</label>
                        <input className="input-field" defaultValue={opp.title} {...register('title')} />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea className="input-field min-h-[120px]" defaultValue={opp.description} {...register('description')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Domain</label>
                            <input className="input-field" defaultValue={opp.domain} {...register('domain')} />
                        </div>
                        <div>
                            <label className="label">Mode</label>
                            <select className="input-field" defaultValue={opp.mode} {...register('mode')}>
                                <option value="remote">Remote</option>
                                <option value="onsite">Onsite</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="label">Duration</label><input className="input-field" defaultValue={opp.duration} {...register('duration')} /></div>
                        <div><label className="label">Location</label><input className="input-field" defaultValue={opp.location} {...register('location')} /></div>
                        <div><label className="label">Stipend</label><input className="input-field" defaultValue={opp.stipend} {...register('stipend')} /></div>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select className="input-field" defaultValue={opp.status} {...register('status')}>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={updateMut.isPending} className="btn-primary">
                            {updateMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmModal
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => deleteMut.mutate()}
                title="Close Opportunity?"
                message="This will close the opportunity. Existing applications will remain but no new ones can be submitted."
                confirmText="Close Opportunity"
                danger
            />
        </Sidebar>
    )
}
