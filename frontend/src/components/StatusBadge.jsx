const STATUS_STYLES = {
    applied: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    under_review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    shortlisted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const LABELS = {
    applied: 'Applied',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    rejected: 'Rejected',
    open: 'Open',
    closed: 'Closed',
    draft: 'Draft',
    pending: 'Pending',
    processing: 'Processing',
    done: 'Done',
    failed: 'Failed',
}

export default function StatusBadge({ status, className = '' }) {
    const style = STATUS_STYLES[status] || STATUS_STYLES.applied
    const label = LABELS[status] || status

    return (
        <span className={`badge border ${style} ${className}`}>
            {label}
        </span>
    )
}
