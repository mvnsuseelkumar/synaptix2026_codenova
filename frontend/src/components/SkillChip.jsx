import { X } from 'lucide-react'

export default function SkillChip({ skill, onRemove, variant = 'default', className = '' }) {
    const variants = {
        default: 'bg-primary/20 text-primary-300 border-primary/30',
        required: 'bg-red-500/20 text-red-400 border-red-500/30',
        matched: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        missing: 'bg-red-500/10 text-red-400 border-red-500/20',
    }

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
            {skill}
            {onRemove && (
                <button onClick={() => onRemove(skill)} className="hover:text-white ml-1 transition-colors">
                    <X size={12} />
                </button>
            )}
        </span>
    )
}
